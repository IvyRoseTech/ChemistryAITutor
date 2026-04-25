import requests
import json

def test_query(query):
    url = "http://localhost:8001/rag/query"
    data = {"query": query, "top_k": 2}
    
    try:
        response = requests.post(url, json=data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print(f"\n=== Query: '{query}' ===")
            print(f"Results found: {result['count']}")
            for i, chunk in enumerate(result['chunks'], 1):
                print(f"\nResult {i}:")
                print(f"  Score: {chunk['score']:.2f}")
                print(f"  Text snippet: {chunk['text'][:150]}...")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

# Test different queries
test_query("atomic structure")
test_query("chemical bonding")
test_query("thermochemistry")
test_query("periodic table")
