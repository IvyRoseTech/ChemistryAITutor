"""
Search module for RAG system.
Initializes FAISS index, encodes queries, retrieves top-k chunks.
"""

from typing import List, Dict, Optional
from retrieval.embeddings import encode_query
from retrieval.faiss_index import load_index

_index = None
_chunk_data = None

def initialize_search(index, chunk_data):
    global _index, _chunk_data
    _index = index
    _chunk_data = chunk_data

# def search(query: str, top_k: int = 5, topic_filter: Optional[str] = None) -> List[Dict]:
#     # distances, indices = _index.search(q_vec, k)
#     print("DEBUG ---")
#     print("Index total:", _index.ntotal)
#     print("Chunk data length:", len(_chunk_data))
#     print("RAW INDICES:", indices)
#     print("RAW DISTANCES:", distances)


#     if _index is None or _chunk_data is None:
#         raise RuntimeError("Search not initialized. Call initialize_search() first.")

#     q_vec = encode_query(query)
#     k = min(top_k, _index.ntotal)
#     distances, indices = _index.search(q_vec, k)

#     results = []
#     for idx, dist in zip(indices[0], distances[0]):
#         if idx < 0 or idx >= len(_chunk_data):
#             continue
#         chunk = _chunk_data[idx]
        
#         # Apply topic filter if specified
#         # if topic_filter and topic_filter not in chunk.get("topics", []):
#         #     continue
#         # Apply topic filter (case-insensitive, partial match)
#         # if topic_filter:
#         #     chunk_topics = chunk.get("topics", [])
#         #     if not any(topic_filter.lower() in t.lower() for t in chunk_topics):
#         #         continue


        
            
#         # results.append({
#         #     "chunk_id": chunk["chunk_id"],
#         #     "text": chunk["text"],
#         #     "source": chunk["source"],
#         #     "distance": float(dist),
#         #     "score": 1.0 / (1.0 + float(dist))
#         # })
#     return results

def search(query: str, top_k: int = 5, topic_filter: Optional[str] = None) -> List[Dict]:
    if _index is None or _chunk_data is None:
        raise RuntimeError("Search not initialized.")

    q_vec = encode_query(query)
    k = min(top_k, _index.ntotal)
    distances, indices = _index.search(q_vec, k)

    results = []
    for idx, dist in zip(indices[0], distances[0]):
        if idx < 0 or idx >= len(_chunk_data):
            continue

        chunk = _chunk_data[idx]

        results.append({
            "chunk_id": chunk.get("chunk_id", -1),
            "text": chunk.get("text", ""),
            "source": chunk.get("source", ""),
            "distance": float(dist),
            "score": 1.0 / (1.0 + float(dist))
        })

    return results


def get_index_stats() -> Dict:
    """
    Get statistics about the RAG index.
    """
    if _index is None or _chunk_data is None:
        return {
            "status": "uninitialized",
            "num_vectors": 0,
            "num_chunks": 0,
            "topics": []
        }
    
    # Calculate topic distribution
    topic_counts = {}
    for chunk in _chunk_data:
        topics = chunk.get("topics", [])
        for topic in topics:
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
    
    return {
        "status": "initialized",
        "num_vectors": _index.ntotal,
        "num_chunks": len(_chunk_data),
        "topics": list(topic_counts.keys()),
        "topic_distribution": topic_counts
    }


