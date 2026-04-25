import requests
import json

def test_generation():
    url = "http://localhost:8001/rag/generate"
    data = {
        "question": "Explain the mole concept in chemistry",
        "top_k": 3,
        "max_tokens": 512,
        "temperature": 0.7,
        "stream": False
    }
    
    try:
        print("Testing RAG generation endpoint...")
        response = requests.post(url, json=data, timeout=30)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nQuestion: {result['question']}")
            print(f"\nAnswer: {result['answer']}")
            
            print(f"\nSources used:")
            for i, chunk in enumerate(result['context'], 1):
                print(f"  {i}. Chunk {chunk['chunk_id']}")
                print(f"     Score: {chunk['score']:.2f}")
                print(f"     Source: {chunk['source']}")
                print(f"     Text snippet: {chunk['text'][:150]}...\n")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    test_generation()
