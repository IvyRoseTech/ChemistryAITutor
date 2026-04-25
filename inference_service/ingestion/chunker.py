"""
Text chunking module.
Splits large documents into smaller chunks suitable for embedding and retrieval.
"""

import json
from typing import List, Dict, Any
from pathlib import Path


def chunk_text_with_overlap(
    text: str, 
    chunk_size: int = 500, 
    overlap: int = 150
) -> List[str]:
    """
    Split text into overlapping chunks based on word count.
    
    Args:
        text: Text to be chunked
        chunk_size: Number of words per chunk
        overlap: Number of overlapping words between chunks
        
    Returns:
        List of text chunks
    """
    words = text.split()
    chunks = []

    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start = end - overlap

    return chunks


def assign_topic(chunk: str, syllabus_topics: Dict[str, List[str]]) -> str:
    """
    Assign a topic to a chunk based on keyword matching.
    
    Args:
        chunk: Text chunk to classify
        syllabus_topics: Dictionary mapping topic names to keyword lists
        
    Returns:
        Best matching topic name or "Unassigned"
    """
    chunk_lower = chunk.lower()
    
    for topic, keywords in syllabus_topics.items():
        for keyword in keywords:
            if keyword.lower() in chunk_lower:
                return topic
    
    return "Unassigned"


def load_syllabus(syllabus_path: str) -> Dict[str, List[str]]:
    """
    Load syllabus from JSON file and build topic-keyword mapping.
    
    Args:
        syllabus_path: Path to syllabus JSON file
        
    Returns:
        Dictionary mapping topic names to lists of keywords
    """
    with open(syllabus_path, 'r', encoding='utf-8') as f:
        syllabus_data = json.load(f)
    
    topic_keywords = {}
    
    for topic in syllabus_data.get('topics', []):
        topic_name = topic['name']
        keywords = [topic_name]  # Include topic name as keyword
        
        # Add all subtopics as keywords
        if 'subtopics' in topic:
            keywords.extend(topic['subtopics'])
        
        topic_keywords[topic_name] = keywords
    
    return topic_keywords


def assign_topics_to_chunks(
    chunks: List[str], 
    syllabus_path: str
) -> List[Dict[str, Any]]:
    """
    Assign topics to all chunks based on syllabus.
    
    Args:
        chunks: List of text chunks
        syllabus_path: Path to syllabus JSON file
        
    Returns:
        List of dictionaries containing chunk_id, topic, and text
    """
    syllabus_topics = load_syllabus(syllabus_path)
    
    chunk_data = []
    for idx, chunk in enumerate(chunks):
        topic = assign_topic(chunk, syllabus_topics)
        chunk_data.append({
            "chunk_id": idx,
            "topic": topic,
            "text": chunk
        })
    
    return chunk_data
