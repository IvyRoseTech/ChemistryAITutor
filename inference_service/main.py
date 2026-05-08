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
from api.quiz import router as quiz_router
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
    version="2.0.0"
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
app.include_router(rag_router)    # handles /rag/* routes
app.include_router(quiz_router)   # handles /quiz/* routes

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

    # ✅ Verify Groq API key is present on startup
    groq_key = os.getenv("GROQ_API_KEY", "")
    if not groq_key or len(groq_key) < 20:
        print("⚠️  WARNING: GROQ_API_KEY missing or invalid in .env")
    else:
        print("✅ Groq API key detected")

    print("─" * 50)
    print("🧪 GCE Chemistry AI Tutor is ready!\n")


# ─────────────────────────────────────────
# ROOT — Basic health check
# ─────────────────────────────────────────
@app.get("/")
async def root():
    """Basic health check endpoint."""
    return {
        "service": "GCE AI Tutor Inference Service",
        "status": "running",
        "version": "2.0.0",
        "llm_provider": "groq",                     # ✅ updated from ollama
        "model": "llama-3.1-8b-instant",            # ✅ updated from llama3.2:3b
        "subject": "GCE Chemistry"
    }


# ─────────────────────────────────────────
# HEALTH — Detailed system status
# ─────────────────────────────────────────
@app.get("/health")
async def health_check():
    """Detailed health check including RAG and Groq LLM status."""
    stats = get_index_stats()

    # ✅ Check Groq API key instead of pinging Ollama on localhost
    groq_key = os.getenv("GROQ_API_KEY", "")
    if not groq_key:
        llm_status = "missing_api_key"
    elif len(groq_key) < 20:
        llm_status = "invalid_api_key"
    else:
        llm_status = "ready"

    return {
        "status": "healthy" if stats.get("status") == "initialized" else "degraded",
        "rag_index": stats,
        "llm": {
            "provider": "groq",                     # ✅ updated from ollama
            "model": "llama-3.1-8b-instant",        # ✅ updated from llama3.2:3b
            "status": llm_status,                   # ✅ checks GROQ_API_KEY not localhost
        },
        "service": "GCE Chemistry AI Tutor"
    }


# ─────────────────────────────────────────
# RAG QUERY — Lightweight fallback endpoint
# NOTE: Full implementation is in api/rag.py
# ─────────────────────────────────────────
@app.post("/query")
def quick_query(request: RAGQueryRequest):
    """
    Quick query endpoint — searches FAISS only.
    Full Socratic RAG endpoint available at /rag/generate
    """
    try:
        # Search FAISS
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

        # ✅ Removed: Llama/Ollama generation block from here
        # All AI generation now goes through /rag/generate via generation.py + Groq
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
