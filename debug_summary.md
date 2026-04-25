# Debug Summary: Fixing RAG API Retrieval Issue

## Problem Summary
The RAG API was failing to retrieve any results because of mismatched data structures between the search functionality and the response schema.

## Changes Made

### 1. Fixed RAGChunk Schema
**File**: `gce_ai_tutor/inference_service/schemas.py`

**Before**:
```python
class RAGChunk(BaseModel):
    chunk_id: int
    text: str
    topic: str
    distance: float
    relevance_score: float
```

**After**:
```python
class RAGChunk(BaseModel):
    chunk_id: int
    text: str
    source: str
    distance: float
    score: float
```

**Reason**: The search results were returning `source` and `score` fields, not `topic` and `relevance_score`.

### 2. Updated Search Function Signature
**File**: `gce_ai_tutor/inference_service/retrieval/faiss_search.py`

**Before**:
```python
def initialize_search(index_dir: str):
    global _index, _chunk_data
    _index, _chunk_data = load_index(index_dir)
```

**After**:
```python
def initialize_search(index, chunk_data):
    global _index, _chunk_data
    _index = index
    _chunk_data = chunk_data
```

**Reason**: The function was being called with index and chunk data directly, not a directory path.

### 3. Added get_index_stats Function
**File**: `gce_ai_tutor/inference_service/retrieval/faiss_search.py`

Added missing function to return index statistics:
```python
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
```

### 4. Added Topic Filter Support
**File**: `gce_ai_tutor/inference_service/retrieval/faiss_search.py`

Updated search function to support topic filtering:
```python
def search(query: str, top_k: int = 5, topic_filter: Optional[str] = None) -> List[Dict]:
    if _index is None or _chunk_data is None:
        raise RuntimeError("Search not initialized. Call initialize_search() first.")

    q_vec = encode_query(query)
    k = min(top_k, _index.ntotal)
    distances, indices = _index.search(q_vec, k)

    results = []
    for idx, dist in zip(indices[0], distances[0]):
        if idx < 0 or idx >= len(_chunk_data):
            continue
        chunk = _chunk_data[idx]
        
        # Apply topic filter if specified
        if topic_filter and topic_filter not in chunk.get("topics", []):
            continue
            
        results.append({
            "chunk_id": chunk["chunk_id"],
            "text": chunk["text"],
            "source": chunk["source"],
            "distance": float(dist),
            "score": 1.0 / (1.0 + float(dist))
        })
    return results
```

## Results Verified

### API Endpoints Tested:

1. **Root Endpoint**: `GET /`
   - Status: Working
   - Response: {"service":"GCE AI Tutor Inference Service","status":"running","version":"1.0.0"}

2. **Health Check**: `GET /health`
   - Status: Working
   - Response: Health status + RAG index info

3. **Search Endpoint**: `POST /rag/query`
   - Status: Working
   - Query examples tested:
     - "mole concept" - returns relevant chunks about mole concept
     - "atomic structure" - returns chunks about atomic structure
     - "chemical bonding" - returns chunks about chemical bonding
     - "thermochemistry" - returns chunks about thermochemistry
     - "periodic table" - returns chunks about periodic table

### Data Stats:
- Number of vectors in index: 80
- Number of chunks: 80
- Embedding model: all-MiniLM-L6-v2 (384 dimensions)
- Index location: `data/index/faiss_index.bin`

## Conclusion
The RAG API is now fully functional and retrieving relevant chunks based on semantic search. The issue was primarily caused by schema mismatches between the search output and the response model.
