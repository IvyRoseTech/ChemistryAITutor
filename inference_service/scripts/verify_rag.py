import os 
import sys

# Add project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
sys.path.append(project_root)

# Now we can import from inference_service
from inference_service.ingestion.docx_loader import load_docx, clean_text_advanced
from inference_service.ingestion.chunker import chunk_text_with_overlap, assign_topics_to_chunks
from inference_service.retrieval.embeddings import encode_texts
from inference_service.retrieval.faiss_index import create_index, save_index
from inference_service.retrieval.faiss_search import initialize_search, search
from inference_service.model_loader import get_model

def main():
    print("=== Starting RAG Verification ===")
    
    # Paths
    base_dir = os.path.dirname(os.path.abspath(__file__)) # scripts dir
    service_dir = os.path.dirname(base_dir) # inference_service dir
    docx_path = os.path.join(service_dir, "data", "textbook", "GCE_A_Level_Chemistry_Syllabus_Cleaned_Structured.docx")
    # Use manual test syllabus since the main one might be empty/missing
    syllabus_path = os.path.join(service_dir, "manual_test_syllabus.json")
    index_dir = os.path.join(service_dir, "data", "index")
    
    # 1. Ingestion
    print(f"\n1. Loading DOCX from: {docx_path}")
    if not os.path.exists(docx_path):
        print(f"Error: DOCX file not found at {docx_path}")
        return

    text = load_docx(docx_path)
    print(f"   Loaded {len(text)} characters.")
    
    cleaned_text = clean_text_advanced(text)
    print(f"   Cleaned text length: {len(cleaned_text)}")
    
    # 2. Chunking
    print("\n2. Chunking text...")
    chunks = chunk_text_with_overlap(cleaned_text, chunk_size=500, overlap=150)
    print(f"   Created {len(chunks)} chunks.")
    
    print("\n3. Assigning topics...")
    chunk_data = assign_topics_to_chunks(chunks, syllabus_path)
    print(f"   Assigned topics to {len(chunk_data)} chunks.")
    print(f"   Sample topic: {chunk_data[0]['topic']}")
    
    # 3. Embedding
    print("\n4. Generating embeddings (this may take a moment)...")
    texts = [c["text"] for c in chunk_data]
    embeddings = encode_texts(texts)
    print(f"   Generated embeddings with shape: {embeddings.shape}")
    
    # 4. Indexing
    print("\n5. Creating FAISS index...")
    index = create_index(embeddings)
    save_index(index, chunk_data, index_dir)
    
    # 5. Search
    print("\n6. Testing Search...")
    initialize_search(index, chunk_data)
    
    query = "Explain Avogadro's constant"
    print(f"   Query: {query}")
    results = search(query, top_k=3)
    
    context = ""
    for i, res in enumerate(results):
        print(f"   Result {i+1} (Topic: {res['topic']}): {res['text'][:100]}...")
        context += res['text'] + "\n\n"
        
    # 6. Generation
    print("\n7. Testing Generation with Ollama...")
    model = get_model()
    prompt = f"Context:\n{context}\n\nQuestion: {query}\n\nAnswer:"
    
    print("   Sending prompt to Ollama...")
    response = model.generate(prompt, max_tokens=200)
    print("\n   Response:")
    print(response['choices'][0]['text'])
    
    print("\n=== Verification Complete ===")

if __name__ == "__main__":
    main()
