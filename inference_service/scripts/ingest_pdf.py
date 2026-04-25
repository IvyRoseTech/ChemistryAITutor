"""
PDF Ingestion Pipeline Script

This script processes a PDF textbook and builds a FAISS vector index for RAG queries.

Usage:
    python scripts/ingest_pdf.py

The script will:
1. Locate the PDF file in data/textbooks/
2. Extract and clean text
3. Chunk text with overlap
4. Assign topics to chunks using the syllabus
5. Generate embeddings
6. Build and save FAISS index
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from ingestion.pdf_loader import load_pdf, clean_text
from ingestion.chunker import chunk_text_with_overlap, assign_topics_to_chunks
from retrieval.embeddings import encode_texts
from retrieval.faiss_index import create_index, save_index


def find_pdf_file(textbooks_dir: str) -> str:
    """
    Find the chemistry PDF file in the textbooks directory.
    
    Args:
        textbooks_dir: Path to textbooks directory
        
    Returns:
        Path to the PDF file
        
    Raises:
        FileNotFoundError: If no PDF found
    """
    textbooks_path = Path(textbooks_dir)
    
    # Look for PDF files
    pdf_files = list(textbooks_path.glob("*.pdf"))
    
    if not pdf_files:
        raise FileNotFoundError(f"No PDF files found in {textbooks_dir}")
    
    if len(pdf_files) == 1:
        return str(pdf_files[0])
    
    # If multiple PDFs, look for Cambridge or chemistry-related ones
    for pdf in pdf_files:
        name_lower = pdf.name.lower()
        if "cambridge" in name_lower or "chemistry" in name_lower:
            return str(pdf)
    
    # Default to first PDF
    print(f"⚠ Multiple PDFs found, using: {pdf_files[0].name}")
    return str(pdf_files[0])


def main():
    """Main ingestion pipeline."""
    
    print("=" * 60)
    print("GCE Chemistry PDF Ingestion Pipeline")
    print("=" * 60)
    
    # Set up paths
    base_dir = Path(__file__).parent.parent
    textbooks_dir = base_dir / "data" / "textbooks"
    syllabus_path = base_dir.parent / "backend" / "data" / "syllabus" / "chemistry_syllabus.json"
    output_dir = base_dir / "data" / "faiss"
    
    print(f"\nTextbooks directory: {textbooks_dir}")
    print(f"Syllabus path: {syllabus_path}")
    print(f"Output directory: {output_dir}")
    
    # Step 1: Find and load PDF
    print("\n" + "=" * 60)
    print("Step 1: Loading PDF")
    print("=" * 60)
    
    try:
        pdf_path = find_pdf_file(str(textbooks_dir))
        print(f"[+] Found PDF: {Path(pdf_path).name}")
    except FileNotFoundError as e:
        print(f"[-] Error: {e}")
        print(f"\nPlease place your PDF file in: {textbooks_dir}")
        return
    
    try:
        raw_text = load_pdf(pdf_path)
        print(f"[+] Extracted {len(raw_text)} characters from PDF")
    except Exception as e:
        print(f"[-] Error loading PDF: {e}")
        return
    
    # Step 2: Clean text
    print("\n" + "=" * 60)
    print("Step 2: Cleaning Text")
    print("=" * 60)
    
    cleaned_text = clean_text(raw_text)
    print(f"[+] Cleaned text: {len(cleaned_text)} characters")
    
    # Step 3: Chunk text
    print("\n" + "=" * 60)
    print("Step 3: Chunking Text")
    print("=" * 60)
    
    chunks = chunk_text_with_overlap(cleaned_text, chunk_size=500, overlap=150)
    print(f"[+] Created {len(chunks)} chunks")
    
    # Step 4: Assign topics
    print("\n" + "=" * 60)
    print("Step 4: Assigning Topics")
    print("=" * 60)
    
    try:
        chunk_data = assign_topics_to_chunks(chunks, str(syllabus_path))
        
        # Show topic distribution
        topic_counts = {}
        for chunk in chunk_data:
            topic = chunk["topic"]
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        print(f"[+] Assigned topics to {len(chunk_data)} chunks")
        print("\nTopic Distribution:")
        for topic, count in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"  - {topic}: {count} chunks")
    except Exception as e:
        print(f"[-] Error assigning topics: {e}")
        return
    
    # Step 5: Generate embeddings
    print("\n" + "=" * 60)
    print("Step 5: Generating Embeddings")
    print("=" * 60)
    
    try:
        texts = [chunk["text"] for chunk in chunk_data]
        embeddings = encode_texts(texts, show_progress=True)
        print(f"[+] Generated embeddings with shape: {embeddings.shape}")
    except Exception as e:
        print(f"[-] Error generating embeddings: {e}")
        return
    
    # Step 6: Create FAISS index
    print("\n" + "=" * 60)
    print("Step 6: Building FAISS Index")
    print("=" * 60)
    
    try:
        index = create_index(embeddings)
        print(f"[+] Created FAISS index with {index.ntotal} vectors")
    except Exception as e:
        print(f"[-] Error creating index: {e}")
        return
    
    # Step 7: Save index and metadata
    print("\n" + "=" * 60)
    print("Step 7: Saving Index")
    print("=" * 60)
    
    try:
        save_index(index, chunk_data, str(output_dir))
        print(f"[+] Saved index to: {output_dir}")
    except Exception as e:
        print(f"[-] Error saving index: {e}")
        return
    
    # Success!
    print("\n" + "=" * 60)
    print("[+] Ingestion Complete!")
    print("=" * 60)
    print("\nThe RAG system is now ready to use.")
    print("Start the server with: uvicorn main:app --reload --port 8001")


if __name__ == "__main__":
    main()
