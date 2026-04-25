import json
import string
import unicodedata
from pathlib import Path
from typing import Dict, Any, List, Union

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in", 
    "into", "is", "it", "no", "not", "of", "on", "or", "such", "that", "the", 
    "their", "then", "there", "these", "they", "this", "to", "was", "will", 
    "with"
}

def load_syllabus(path: str) -> Dict[str, Any]:
    """
    Loads and validates syllabus JSON from disk.
    Raises explicit exceptions on failure.
    """
    path_obj = Path(path)
    if not path_obj.exists():
        raise FileNotFoundError(f"Syllabus file not found: {path}")
    
    try:
        with open(path_obj, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format in syllabus: {e}")
    except Exception as e:
        raise ValueError(f"Error reading syllabus file: {e}")
        
    if not data:
        raise ValueError("Syllabus JSON is empty")
        
    return data

def _normalize(text: str) -> str:
    """
    Lowercase, strip punctuation, normalize whitespace, convert Unicode.
    """
    if not text:
        return ""
    
    text = unicodedata.normalize('NFKC', text)
    text = text.lower()
    
    translator = str.maketrans('', '', string.punctuation)
    text = text.translate(translator)
    
    return " ".join(text.split())

def _tokenize(text: str) -> List[str]:
    """
    Normalize and split into tokens, filtering stopwords.
    """
    normalized = _normalize(text)
    if not normalized:
        return []
    
    tokens = normalized.split()
    return [t for t in tokens if t not in STOPWORDS]

def build_topic_index(syllabus_json: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """
    Builds a normalized, weighted topic index.
    """
    index: Dict[str, Dict[str, Any]] = {}
    
    def add_entry(term: str, topic_name: str, weight: float):
        if not term:
            return
            
        if term not in index:
            index[term] = {"topics": [], "weight": 0.0}
            
        if topic_name not in index[term]["topics"]:
            index[term]["topics"].append(topic_name)
            
        if weight > index[term]["weight"]:
            index[term]["weight"] = weight

    for topic_title, subtopics in syllabus_json.items():
        topic_tokens = _tokenize(topic_title)
        for token in topic_tokens:
            add_entry(token, topic_title, 1.0)
            
        if isinstance(subtopics, dict):
            for sub_title, sub_desc in subtopics.items():
                phrase = _normalize(sub_title)
                add_entry(phrase, topic_title, 2.0)
                
                if isinstance(sub_desc, str):
                    desc_tokens = _tokenize(sub_desc)
                    for token in desc_tokens:
                        add_entry(token, topic_title, 1.2)
                        
    return index
