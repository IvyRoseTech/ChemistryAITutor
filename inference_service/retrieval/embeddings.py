"""
Embeddings module for RAG system.
Loads SentenceTransformer once and encodes texts or queries.
"""

import numpy as np
from typing import List
from sentence_transformers import SentenceTransformer

_embedding_model: SentenceTransformer = None
DEFAULT_MODEL = "all-MiniLM-L6-v2"
# "sentence-transformers/all-mpnet-base-v2"


def load_embedding_model(model_name: str = DEFAULT_MODEL):
    global _embedding_model
    if _embedding_model is None:
        print(f"Loading embedding model: {model_name}...")
        _embedding_model = SentenceTransformer(model_name)
        print(f"Model loaded. Dimension: {_embedding_model.get_sentence_embedding_dimension()}")
    return _embedding_model

def encode_texts(texts: List[str], show_progress=True) -> np.ndarray:
    model = load_embedding_model()
    embeddings = model.encode(texts, show_progress_bar=show_progress, normalize_embeddings=True)
    return np.array(embeddings, dtype="float32")

def encode_query(query: str) -> np.ndarray:
    model = load_embedding_model()
    embedding = model.encode([query], show_progress_bar=False, normalize_embeddings=True)
    return np.array(embedding, dtype="float32")
