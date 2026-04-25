import requests
import time

# Wait for server to reload
time.sleep(2)

try:
    print("Testing health endpoint...")
    response = requests.get("http://localhost:8001/health", timeout=5)
    print(f"Health endpoint: {response.status_code} - {response.text}")
    
    print("\nTesting search endpoint...")
    search_response = requests.post("http://localhost:8001/rag/query", 
                                  json={"query": "mole concept", "top_k": 2}, 
                                  timeout=10)
    print(f"Search endpoint: {search_response.status_code} - {search_response.text[:200]}...")
    
except Exception as e:
    print(f"Error: {e}")
