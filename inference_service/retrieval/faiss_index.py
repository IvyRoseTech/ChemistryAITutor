import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

BASE_DIR = os.path.dirname(__file__)
INDEX_DIR = os.path.join(BASE_DIR, "../data/index")
CHUNKS_FILE = os.path.join(INDEX_DIR, "chunk_metadata.json")
FAISS_INDEX_FILE = os.path.join(INDEX_DIR, "faiss_index.bin")


# ---------------- LOAD CHUNKS ----------------
def load_chunks(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)
    print(f"Loaded {len(chunks)} chunks")
    return chunks


# ---------------- CREATE INDEX ----------------
def create_index(embeddings: np.ndarray):
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    print(f"FAISS index created with {index.ntotal} vectors")
    return index


# ---------------- SAVE INDEX ----------------
def save_index(index, chunk_data):
    os.makedirs(INDEX_DIR, exist_ok=True)
    faiss.write_index(index, FAISS_INDEX_FILE)

    with open(CHUNKS_FILE, "w", encoding="utf-8") as f:
        json.dump(chunk_data, f, indent=2, ensure_ascii=False)

    print("Index saved successfully")


# ---------------- LOAD INDEX ----------------
def load_index():
    if not os.path.exists(FAISS_INDEX_FILE):
        raise FileNotFoundError("FAISS index missing. Run ingestion first.")
    if not os.path.exists(CHUNKS_FILE):
        raise FileNotFoundError("Chunk metadata missing.")

    index = faiss.read_index(FAISS_INDEX_FILE)

    with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    print(f"Loaded index with {index.ntotal} vectors")
    return index, chunks


# ---------------- CHECK INDEX ----------------
def index_exists():
    return os.path.exists(FAISS_INDEX_FILE) and os.path.exists(CHUNKS_FILE)


# ---------------- BUILD SCRIPT (ONLY WHEN RUN DIRECTLY) ----------------
if __name__ == "__main__":
    chunks = load_chunks(CHUNKS_FILE)
    texts = [c["text"] for c in chunks]

    print("Loading embedding model...")
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    embeddings = model.encode(texts, convert_to_numpy=True)

    index = create_index(embeddings)
    save_index(index, chunks)
