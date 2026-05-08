"""
Main entry point for the AI Inference Service.
Initializes the FastAPI application and mounts all API routes.
"""

import os
import sys
import traceback
from pathlib import Path

sys.path.append(str(Path(__file__).parent.resolve()))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from api.rag import router as rag_router
from retrieval.faiss_index import load_index, index_exists
from retrieval.faiss_search import initialize_search, get_index_stats, search
from retrieval.embeddings import load_embedding_model
from schemas import RAGQueryRequest, RAGQueryResponse, HealthResponse

# ─────────────────────────────────────────
# INITIALIZE FASTAPI APP
# ─────────────────────────────────────────
app = FastAPI(
    title="GCE AI Tutor Inference Service",
    description="RAG-based inference service for GCE Chemistry tutoring",
    version="1.0.0"
)

# ─────────────────────────────────────────
# CORS — allows React frontend to connect
# ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # React (CRA)
        "http://localhost:5173",   # React (Vite) ← your frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# MOUNT ROUTERS
# ─────────────────────────────────────────
app.include_router(rag_router)   # handles /rag/* routes from api/rag.py

# ─────────────────────────────────────────
# STARTUP — Load FAISS index
# ─────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    """Load FAISS index and initialize search on startup."""
    print("\n🚀 Starting GCE AI Tutor Inference Service...")
    print("─" * 50)
    print("🔍 Checking FAISS index...")

    if index_exists():
        print("📂 Loading FAISS index...")
        try:
            index, chunk_data = load_index()
            initialize_search(index, chunk_data)
            print("✅ RAG system initialized successfully")
        except Exception as e:
            print(f"❌ Failed to load FAISS index: {e}")
            print("   Run ingestion script first.")
    else:
        print("⚠️  No FAISS index found.")
        print("   Run: python ingestion/ingest.py")

    print("🔤 Pre-loading embedding model...")
    try:
        load_embedding_model()
        print("✅ Embedding model ready")
    except Exception as e:
        print(f"❌ Failed to load embedding model: {e}")

    print("─" * 50)
    print("🧪 GCE Chemistry AI Tutor is ready!\n")

# ─────────────────────────────────────────
# ROOT — Health check
# ─────────────────────────────────────────
@app.get("/")
async def root():
    """Basic health check endpoint."""
    return {
        "service": "GCE AI Tutor Inference Service",
        "status": "running",
        "version": "1.0.0",
        "model": "llama3.2:3b",
        "subject": "GCE Chemistry"
    }

# ─────────────────────────────────────────
# HEALTH — Detailed system status
# ─────────────────────────────────────────
@app.get("/health")
async def health_check():
    """Detailed health check including RAG and LLM status."""
    stats = get_index_stats()

    # Check if Ollama/Llama is running
    llm_status = "unknown"
    try:
        import httpx
        response = httpx.get("http://localhost:11434/api/tags", timeout=3)
        if response.status_code == 200:
            models = response.json().get("models", [])
            model_names = [m.get("name", "") for m in models]
            llm_status = "running" if any(
                "llama3.2" in name for name in model_names
            ) else "model_not_found"
        else:
            llm_status = "ollama_error"
    except Exception:
        llm_status = "ollama_not_running"

    return {
        "status": "healthy" if stats.get("status") == "initialized" else "degraded",
        "rag_index": stats,
        "llm": {
            "model": "llama3.2:3b",
            "status": llm_status,
            "endpoint": "http://localhost:11434"
        },
        "service": "GCE Chemistry AI Tutor"
    }

# ─────────────────────────────────────────
# RAG QUERY — Search + Generate Answer
# NOTE: Full implementation is in api/rag.py
# This is a lightweight fallback endpoint
# ─────────────────────────────────────────
@app.post("/query")
def quick_query(request: RAGQueryRequest):
    """
    Quick query endpoint - searches FAISS and generates answer.
    Full RAG endpoint with more options available at /rag/query
    """
    try:
        # Step 1 - Search FAISS
        results = search(
            query=request.query,
            top_k=request.top_k,
            topic_filter=request.topic
        )

        if not results:
            return {
                "query": request.query,
                "answer": "No relevant content found in the GCE Chemistry syllabus.",
                "chunks": [],
                "count": 0,
                "status": "no_results"
            }

        # Step 2 - Generate answer with Llama if requested
        if getattr(request, 'generate_answer', True):
            from services.llm_service import generate_answer
            llm_result = generate_answer(request.query, results)
            return {
                "query": request.query,
                "answer": llm_result["answer"],
                "chunks": results,
                "count": len(results),
                "model": "llama3.2:3b",
                "status": llm_result["status"]
            }

        return {
            "query": request.query,
            "answer": None,
            "chunks": results,
            "count": len(results),
            "status": "chunks_only"
        }

    except Exception as e:
        print("ERROR IN /query:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


