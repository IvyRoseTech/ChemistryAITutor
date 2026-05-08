import os
import requests

# Default to the Docker service name 'fastapi-inference'
# For local dev without docker, set this env var to "http://localhost:8001/rag/generate"
RAG_URL = os.environ.get("RAG_API_URL", "http://localhost:8001/rag/generate")

def generate_answer(question, top_k=3, topic=None):
    try:
        response = requests.post(
            RAG_URL,
            json={
                "question": question,
                "top_k": top_k,
                "topic": topic,
                "max_tokens": 300,
                "temperature": 0.7,
                "stream": False
            },
            timeout=30
        )

        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        return {
            "answer": "RAG service is unavailable.",
            "context": [],
            "error": str(e)
        }
