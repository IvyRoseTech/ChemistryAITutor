"""
Ingest Chemistry syllabus documents into FAISS for RAG retrieval.
Supports both DOCX and PDF files.
"""

import os
import sys
from pathlib import Path
from typing import List, Dict

# Make sure project root is in path
sys.path.append(str(Path(__file__).parent.parent.resolve()))

from retrieval.embeddings import encode_texts
from retrieval.faiss_index import create_index, save_index, index_exists

# ─────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────
DOCS_DIR    = r"data/docs"        # folder with your PDFs/DOCX files
INDEX_DIR   = r"data/index"       # where FAISS index is saved
CHUNK_SIZE  = 12                  # paragraphs per chunk
CHUNK_OVERLAP = 3                 # overlap between chunks

# ─────────────────────────────────────────
# STEP 1: Load All Documents
# ─────────────────────────────────────────
def load_all_documents(docs_dir: str) -> List[Dict]:
    """
    Load all PDF and DOCX files from the docs directory.
    Returns list of {text, source, type} dicts.
    """
    from docx import Document
    from ingestion.pdf_loader import load_pdf, clean_text

    all_paragraphs = []
    docs_path = Path(docs_dir)

    if not docs_path.exists():
        print(f"❌ Docs folder not found: {docs_dir}")
        return []

    files = list(docs_path.glob("*.pdf")) + list(docs_path.glob("*.docx"))

    if not files:
        print(f"⚠️  No PDF or DOCX files found in {docs_dir}")
        return []

    for file in files:
        print(f"📄 Loading: {file.name}")
        try:
            if file.suffix == ".pdf":
                raw_text = load_pdf(str(file))
                cleaned = clean_text(raw_text)
                # Split into paragraphs by sentence breaks
                paragraphs = [p.strip() for p in cleaned.split(". ") if len(p.strip()) > 30]

            elif file.suffix == ".docx":
                doc = Document(str(file))
                paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]

            # Tag each paragraph with its source
            for para in paragraphs:
                all_paragraphs.append({
                    "text": para,
                    "source": file.name
                })

            print(f"   ✅ {len(paragraphs)} paragraphs extracted")

        except Exception as e:
            print(f"   ❌ Failed to load {file.name}: {e}")

    return all_paragraphs

# ─────────────────────────────────────────
# STEP 2: Chunk Paragraphs
# ─────────────────────────────────────────
def chunk_paragraphs(paragraphs: List[Dict], chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP) -> List[Dict]:
    """
    Group paragraphs into overlapping chunks.
    Preserves source metadata.
    """
    chunks = []
    texts = [p["text"] for p in paragraphs]
    sources = [p["source"] for p in paragraphs]

    for i in range(0, len(texts), chunk_size - overlap):
        chunk_texts = texts[i:i + chunk_size]
        chunk_sources = sources[i:i + chunk_size]

        # Use most common source in this chunk
        source = max(set(chunk_sources), key=chunk_sources.count)

        chunks.append({
            "chunk_id": len(chunks),
            "text": " ".join(chunk_texts),
            "source": source,
            "topic": "GCE Chemistry"   # default topic
        })

    return chunks

# ─────────────────────────────────────────
# STEP 3: Assign Topics (if syllabus exists)
# ─────────────────────────────────────────
def assign_topics(chunks: List[Dict]) -> List[Dict]:
    """
    Assign GCE Chemistry topics to chunks based on keywords.
    """
    # GCE Chemistry topic keywords
    CHEMISTRY_TOPICS = {
        "Atomic Structure": [
            "atom", "proton", "neutron", "electron", "orbital",
            "shell", "nucleus", "isotope", "atomic number", "mass number"
        ],
        "Chemical Bonding": [
            "ionic", "covalent", "metallic", "bond", "electronegativity",
            "polar", "van der waals", "hydrogen bond", "dative"
        ],
        "Stoichiometry": [
            "mole", "molar mass", "empirical formula", "molecular formula",
            "stoichiometry", "limiting reagent", "yield", "concentration"
        ],
        "Energetics": [
            "enthalpy", "entropy", "gibbs", "exothermic", "endothermic",
            "bond energy", "hess", "lattice energy", "activation energy"
        ],
        "Kinetics": [
            "rate", "reaction rate", "catalyst", "activation energy",
            "collision theory", "order of reaction", "rate constant"
        ],
        "Equilibrium": [
            "equilibrium", "le chatelier", "kc", "kp", "reversible",
            "dynamic equilibrium", "position of equilibrium"
        ],
        "Electrochemistry": [
            "electrode", "electrolysis", "oxidation", "reduction",
            "redox", "half equation", "cell potential", "galvanic"
        ],
        "Organic Chemistry": [
            "organic", "alkane", "alkene", "alkyne", "alcohol",
            "carboxylic acid", "ester", "amine", "benzene", "polymer",
            "isomer", "functional group", "substitution", "addition"
        ],
        "Periodicity": [
            "periodic table", "period", "group", "periodic trend",
            "ionization energy", "electron affinity", "atomic radius"
        ],
        "Acids and Bases": [
            "acid", "base", "pH", "buffer", "neutralization",
            "titration", "indicator", "strong acid", "weak acid"
        ]
    }

    for chunk in chunks:
        text_lower = chunk["text"].lower()
        best_topic = "General Chemistry"
        best_count = 0

        for topic, keywords in CHEMISTRY_TOPICS.items():
            count = sum(1 for kw in keywords if kw.lower() in text_lower)
            if count > best_count:
                best_count = count
                best_topic = topic

        chunk["topic"] = best_topic

    return chunks

# ─────────────────────────────────────────
# MAIN — Run Ingestion
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("\n🔬 GCE Chemistry RAG Ingestion Starting...")
    print("─" * 50)

    # Check if index already exists
    if index_exists(INDEX_DIR):
        response = input("⚠️  FAISS index already exists. Rebuild it? (y/n): ")
        if response.lower() != "y":
            print("Exiting. Existing index preserved.")
            exit(0)

    # Step 1 - Load documents
    print("\n📂 Step 1: Loading documents...")
    paragraphs = load_all_documents(DOCS_DIR)
    if not paragraphs:
        print("❌ No documents loaded. Add files to data/docs/ and retry.")
        exit(1)
    print(f"✅ Total paragraphs loaded: {len(paragraphs)}")

    # Step 2 - Create chunks
    print("\n✂️  Step 2: Creating chunks...")
    chunks = chunk_paragraphs(paragraphs)
    print(f"✅ Total chunks created: {len(chunks)}")

    # Step 3 - Assign chemistry topics
    print("\n🏷️  Step 3: Assigning Chemistry topics...")
    chunks = assign_topics(chunks)
    topic_counts = {}
    for c in chunks:
        topic_counts[c["topic"]] = topic_counts.get(c["topic"], 0) + 1
    for topic, count in sorted(topic_counts.items()):
        print(f"   {topic}: {count} chunks")

    # Step 4 - Generate embeddings
    print("\n⚙️  Step 4: Generating embeddings...")
    texts = [c["text"] for c in chunks]
    embeddings = encode_texts(texts)
    print(f"✅ Embeddings shape: {embeddings.shape}")

    # Step 5 - Build FAISS index
    print("\n🗄️  Step 5: Building FAISS index...")
    index = create_index(embeddings)

    # Step 6 - Save everything
    print("\n💾 Step 6: Saving index...")
    save_index(index, chunks, INDEX_DIR)

    print("\n" + "─" * 50)
    print("✅ RAG Ingestion Complete!")
    print(f"   Documents processed: {len(set(p['source'] for p in paragraphs))}")
    print(f"   Total chunks indexed: {len(chunks)}")
    print(f"   Index saved to: {INDEX_DIR}")
    print("─" * 50)
    print("\n🚀 You can now start the server:")
    print("   uvicorn main:app --reload --port 8000\n")
