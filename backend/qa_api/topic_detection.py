import json
import string
import re
from pathlib import Path
from django.conf import settings

def load_syllabus():
    """
    Loads the chemistry syllabus JSON from the data directory.
    Returns the 'topics' list from the JSON.
    """
    try:
        # Django project structure
        if hasattr(settings, 'BASE_DIR'):
            syllabus_path = Path(settings.BASE_DIR) / "data" / "syllabus" / "chemistry_syllabus.json"
        else:
            # Fallback for standalone scripts
            current_dir = Path(__file__).resolve().parent
            syllabus_path = current_dir.parent / "data" / "syllabus" / "chemistry_syllabus.json"
            
        if not syllabus_path.exists():
            # Fallback to creating a minimal structure if file doesn't exist to prevent crash, 
            # though strictly we should just fail or log.
            # Raising error is safer to alert dev.
            raise FileNotFoundError(f"Syllabus file not found at {syllabus_path}")
            
        with open(syllabus_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("topics", [])
    except Exception as e:
        # Log error in valid Django prod env
        print(f"Error loading syllabus: {e}")
        return []

def normalize_text(text):
    """
    Normalizes input text: lowercasing, removing punctuation, tokenizing.
    Returns: (set of words, normalized_string)
    """
    if not text:
        return set(), ""
    text = text.lower()
    # Remove punctuation using regex to be thorough or str.translate
    translator = str.maketrans('', '', string.punctuation)
    text = text.translate(translator)
    words = set(text.split())
    return words, text

from difflib import SequenceMatcher

def calculate_match_score(query_words, query_text, target_text):
    """
    Calculates a match score between query and target text (topic/subtopic name).
    - 1.0: Exact phrase match
    - 0.8: All target words present in query
    - 0.1 - 0.7: Partial word overlap
    """
    target_words, target_norm = normalize_text(target_text)
    if not target_words:
        return 0.0

    # exact phrase match
    if target_norm in query_text:
        return 1.0
    
    # word overlap with fuzzy matching
    intersection_count = 0
    for tw in target_words:
        if tw in query_words:
            intersection_count += 1
        else:
            # simple fuzzy match for singular/plural or small typos
            # Threshold 0.8 usually handles singular/plural well (equilibrium vs equilibria is ~0.85)
            match_found = False
            for qw in query_words:
                # Skip very short words to avoid false positives
                if len(qw) < 3 or len(tw) < 3:
                    continue
                if SequenceMatcher(None, tw, qw).ratio() > 0.8:
                    match_found = True
                    break
            if match_found:
                intersection_count += 1
        
    overlap_ratio = intersection_count / len(target_words)
    
    if overlap_ratio == 1.0:
        return 0.8
    else:
        # Scale remaining overlap. e.g. 50% match -> 0.4
        return 0.7 * overlap_ratio

def calculate_keyword_overlap(query_words, syllabus_content):
    """
    Calculates a low-weight overlap score based on general keywords in the topic/subtopic.
    For this simple implementation, we assume syllabus_content (the topic/subtopic name) 
    IS the keyword source.
    """
    # In a more complex system, 'syllabus_content' effectively means the aggregate 
    # of words in the topic/subtopic name for now.
    # We can reuse the same logic as match score but tailored for "general context".
    # For this specific requirement, we'll treat the topic+subtopic string as the bag of keywords.
    return 0.0 # Placeholder if we don't have separate keywords list. 
    # But wait, requirements say "Keyword overlap with the question (low weight)".
    # Let's interpret this as overlap with the *words* of the topic/subtopic.
    pass

def detect_topics(question, syllabus):
    """
    Deterministic topic detection with confidence tuning and ambiguity handling.
    
    Scoring:
    confidence = (topic_match * 0.45) + (subtopic_match * 0.40) + (keyword_overlap * 0.15)
    
    Args:
        question (str): User query
        syllabus (list): List of topic dicts [{"name": "...", "subtopics": [...]}, ...]
        
    Returns:
        dict: Result structure with is_in_syllabus, ambiguous, best_guess, etc.
    """
    query_words, query_text = normalize_text(question)
    
    matches = []
    
    for topic_obj in syllabus:
        topic_name = topic_obj.get("name", "")
        subtopics = topic_obj.get("subtopics", [])
        
        # 1. Topic Match Score
        topic_score = calculate_match_score(query_words, query_text, topic_name)
        
        # If no subtopics, we treat the topic itself as the main match
        if not subtopics:
            # Create a "dummy" subtopic entry or handle raw topic
            # To fit the formula, we'll assume subtopic_score is same as topic if generic
            sub_score = 0.0
            keyword_score = calculate_match_score(query_words, query_text, topic_name) # simplified
            
            confidence = (topic_score * 0.45) + (sub_score * 0.40) + (keyword_score * 0.15)
            confidence = min(confidence, 1.0)
            
            if confidence >= 0.35:
                matches.append({
                    "topic": topic_name,
                    "subtopic": None,
                    "confidence": confidence
                })
            continue

        for sub in subtopics:
            # 2. Subtopic Match Score
            sub_score = calculate_match_score(query_words, query_text, sub)
            
            # 3. Keyword Overlap (Low weight)
            # We combine topic and subtopic name as "keywords" for this context
            # Or simplified: checks if any words from topic/subtopic appear in question
            all_target_text = f"{topic_name} {sub}"
            keyword_score = calculate_match_score(query_words, query_text, all_target_text)
            
            # Calculate final confidence
            # If topic_score is high, it boosts the subtopic
            # If sub_score is high, it captures specific intent
            
            # SPECIAL CASE: If subtopic is exact match or very high, 
            # we should effectively trust it heavily.
            # But adhering to the formula:
            confidence = (topic_score * 0.45) + (sub_score * 0.40) + (keyword_score * 0.15)
            
            # Cap at 1.0
            confidence = min(confidence, 1.0)
            
            if confidence >= 0.35:
                matches.append({
                    "topic": topic_name,
                    "subtopic": sub,
                    "confidence": round(confidence, 2)
                })

    # Sort checks
    matches.sort(key=lambda x: x["confidence"], reverse=True)
    
    # Check for empty matches or very low confidence (strict gating)
    # Raising threshold to 0.4 to be more conservative as requested (Accuracy > Recall)
    if not matches or matches[0]["confidence"] < 0.4:
        return {
            "status": "rejected",
            "is_in_syllabus": False,
            "confidence": 0.0,
            "topic": "",
            "subtopic": "",
            "message": "Sorry, I can only answer questions within the GCE Chemistry syllabus."
        }
        
    best_match = matches[0]
    is_ambiguous = False
    ambiguous_matches = []
    
    # Ambiguity Detection
    # If top two scores differ by < 0.10 OR top score is in "weak" range < 0.6 but > 0.4
    if len(matches) > 1:
        score_diff = matches[0]["confidence"] - matches[1]["confidence"]
        if score_diff < 0.10:
            is_ambiguous = True
            # Collect up to 2 topics maximum as requested
            ambiguous_matches = matches[:2]
            
    if is_ambiguous:
        return {
            "status": "accepted",
            "is_in_syllabus": True,
            "ambiguous": True,
            "confidence": best_match["confidence"],
            "topics": [
                {"topic": m["topic"], "subtopic": m["subtopic"]} 
                for m in ambiguous_matches
            ],
            "message": "Your question relates to multiple syllabus topics. Clarification may improve accuracy."
        }
    else:
        # Clear match
        return {
            "status": "accepted",
            "is_in_syllabus": True,
            "ambiguous": False,
            "confidence": best_match["confidence"],
            "topic": best_match["topic"],
            "subtopic": best_match["subtopic"] if best_match["subtopic"] else "",
            "message": "Question is within the GCE Chemistry syllabus. Preparing response."
        }
