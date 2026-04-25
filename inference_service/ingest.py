import os
import pickle
import faiss
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader
from docx_loader import load_docx

DOCS_PATH = "data/docs"   # your renamed folder
INDEX_PATH = "data/faiss"

model = SentenceTransformer("all-MiniLM-L6-v2")

texts = []

print("[*] Reading documents...")

for filename in os.listdir(DOCS_PATH):
    path = os.path.join(DOCS_PATH, filename)

    if filename.endswith(".txt"):
        with open(path, "r", encoding="utf-8") as f:
            texts.append(f.read())

    elif filename.endswith(".pdf"):
        reader = PdfReader(path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        texts.append(text)

    elif filename.endswith(".docx"):
        text = load_docx(path)
        texts.append(text)

if not texts:
    raise ValueError("No documents found in data/docs")

print(f"[+] Loaded {len(texts)} documents")

print("[*] Creating embeddings...")
embeddings = model.encode(texts, show_progress_bar=True)

dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

os.makedirs(INDEX_PATH, exist_ok=True)

faiss.write_index(index, f"{INDEX_PATH}/index.faiss")

with open(f"{INDEX_PATH}/texts.pkl", "wb") as f:
    pickle.dump(texts, f)

print("[+] FAISS index created successfully!")

