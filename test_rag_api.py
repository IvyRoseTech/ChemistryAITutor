import requests
import json

def test_rag_query():
    url = "http://localhost:8001/rag/query"
    data = {
        "query": "mole concept",
        "top_k": 3
    }
    
    try:
        print("Testing RAG query endpoint...")
        response = requests.post(url, json=data, timeout=10)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nQuery: {result['query']}")
            print(f"Results found: {result['count']}")
            
            for i, chunk in enumerate(result['chunks'], 1):
                print(f"\nResult {i}:")
                print(f"  Chunk ID: {chunk['chunk_id']}")
                print(f"  Score: {chunk['score']:.2f}")
                print(f"  Distance: {chunk['distance']:.2f}")
                print(f"  Text snippet: {chunk['text'][:200]}...")
                print(f"  Source: {chunk['source']}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")


def test_health():
    url = "http://localhost:8001/health"
    
    try:
        print("\nTesting health check endpoint...")
        response = requests.get(url, timeout=5)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Health status: {result['status']}")
            print(f"RAG index: {result['rag_index']}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    test_rag_query()
    test_health()
