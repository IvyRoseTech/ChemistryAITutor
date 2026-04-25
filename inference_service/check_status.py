import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8001"

def check_endpoint(method, endpoint, payload=None):
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url)
        else:
            response = requests.post(url, json=payload)
        
        print(f"[{response.status_code}] {method} {endpoint}")
        if response.status_code == 200:
            try:
                print(json.dumps(response.json(), indent=2))
                return response.json()
            except:
                print(response.text)
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Failed to connect to {url}: {e}")
        return None

def main():
    print("--- Checking API Health ---")
    check_endpoint("GET", "/health")
    
    print("\n--- Checking RAG Stats ---")
    check_endpoint("GET", "/rag/stats")
    
    print("\n--- Checking RAG Generation (LLM Status) ---")
    payload = {
        "question": "What is an atom?",
        "top_k": 1,
        "max_tokens": 50
    }
    response = check_endpoint("POST", "/rag/generate", payload)
    
    if response:
        answer = response.get("answer", "")
        if "[Dummy Response]" in answer:
            print("\n>>> LLM STATUS: RUNNING IN DUMMY MODE (Model not loaded)")
        else:
            print("\n>>> LLM STATUS: ACTIVE (Model loaded and generating)")

if __name__ == "__main__":
    main()
