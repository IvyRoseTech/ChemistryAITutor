import string
from typing import Dict, List, Any, Optional

def _normalize(text: str) -> str:
    """
    Lowercase, strip punctuation, collapse whitespace.
    """
    if not text:
        return ""
    
    text = text.lower()
    translator = str.maketrans('', '', string.punctuation)
    text = text.translate(translator)
    return " ".join(text.split())

def _tokenize(text: str) -> List[str]:
    """
    Normalize and split into tokens.
    """
    normalized = _normalize(text)
    if not normalized:
        return []
    return normalized.split()

def detect_topics(
    question: str,
    *,
    min_confidence: float = 0.25,
    ambiguity_delta: float = 0.10
) -> Dict[str, Any]:
    """
    Detects which syllabus topics a question belongs to.
    
    Args:
        question: User's question string
        min_confidence: Minimum confidence threshold for topic match
        ambiguity_delta: Maximum confidence difference to mark as ambiguous
        
    Returns:
        Dictionary with status, primary_topic, matched_topics, and explanation
    """
    from .topic_registry import TOPIC_INDEX
    
    if not TOPIC_INDEX:
        return {
            "status": "out_of_syllabus",
            "primary_topic": None,
            "matched_topics": [],
            "explanation": "Topic index not loaded"
        }
    
    question_tokens = set(_tokenize(question))
    if not question_tokens:
        return {
            "status": "out_of_syllabus",
            "primary_topic": None,
            "matched_topics": [],
            "explanation": "Empty or invalid question"
        }
    
    topic_scores: Dict[str, float] = {}
    
    for term, entry in TOPIC_INDEX.items():
        term_tokens = set(_tokenize(term))
        if not term_tokens:
            continue
            
        if term_tokens.intersection(question_tokens):
            weight = entry.get("weight", 1.0)
            topics = entry.get("topics", [])
            
            for topic in topics:
                if topic not in topic_scores:
                    topic_scores[topic] = 0.0
                topic_scores[topic] += weight
    
    if not topic_scores:
        return {
            "status": "out_of_syllabus",
            "primary_topic": None,
            "matched_topics": [],
            "explanation": "No matching topics found in syllabus"
        }
    
    max_score = max(topic_scores.values())
    if max_score == 0:
        return {
            "status": "out_of_syllabus",
            "primary_topic": None,
            "matched_topics": [],
            "explanation": "No significant topic matches"
        }
    
    normalized_scores = [
        {"topic": topic, "confidence": round(score / max_score, 2)}
        for topic, score in topic_scores.items()
    ]
    
    normalized_scores.sort(key=lambda x: x["confidence"], reverse=True)
    
    filtered_topics = [
        t for t in normalized_scores 
        if t["confidence"] >= min_confidence
    ]
    
    if not filtered_topics:
        return {
            "status": "out_of_syllabus",
            "primary_topic": None,
            "matched_topics": [],
            "explanation": f"No topics met minimum confidence threshold of {min_confidence}"
        }
    
    top_topic = filtered_topics[0]
    
    if len(filtered_topics) >= 2:
        confidence_diff = top_topic["confidence"] - filtered_topics[1]["confidence"]
        if confidence_diff <= ambiguity_delta:
            return {
                "status": "ambiguous",
                "primary_topic": top_topic["topic"],
                "matched_topics": filtered_topics[:2],
                "explanation": f"Question matches multiple topics with similar confidence (difference: {round(confidence_diff, 2)})"
            }
    
    return {
        "status": "matched",
        "primary_topic": top_topic["topic"],
        "matched_topics": [top_topic],
        "explanation": f"Clear match to topic with confidence {top_topic['confidence']}"
    }
