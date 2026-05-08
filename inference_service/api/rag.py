"""
RAG API endpoints for GCE Chemistry AI Tutor.
Handles search, generation, and stats routes.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from schemas import (
    RAGChunk, RAGGenerateRequest, RAGGenerateResponse
)
from retrieval.faiss_search import get_index_stats
from generation import generate_rag_answer   # ✅ moved to top
import traceback                             # ✅ already at top, keep once

router = APIRouter(prefix="/rag", tags=["RAG"])

# ─────────────────────────────────────────
# /rag/generate — Search FAISS + Generate Answer
# ─────────────────────────────────────────
@router.post("/generate")
async def generate_answer(request: RAGGenerateRequest):
    try:
        result = generate_rag_answer(request)

        if request.stream:
            return StreamingResponse(       # ✅ no re-import needed
                result,
                media_type="text/event-stream"
            )

        return RAGGenerateResponse(
            question=result["question"],
            answer=result["answer"],
            context=[
                RAGChunk(**c) for c in result["context"]
            ],
            model="groq/llama-3.1-8b-instant",
            status="success",
            session_id=result.get(
                "session_id", request.session_id
            )
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )

# ─────────────────────────────────────────
# /rag/stats — Index + LLM Status
# ─────────────────────────────────────────
@router.get("/stats")
async def get_stats():
    """
    Get FAISS index statistics and Groq LLM status.
    """
    stats = get_index_stats()

    # ✅ Check Groq API key instead of Ollama
    import os
    groq_key = os.getenv("GROQ_API_KEY", "")
    if not groq_key:
        llm_status = "missing_api_key"
    elif len(groq_key) < 20:
        llm_status = "invalid_api_key"
    else:
        llm_status = "ready"

    return {
        "rag": stats,
        "llm": {
            "model": "llama-3.1-8b-instant",   # ✅ updated from llama3.2:3b
            "status": llm_status,
            "provider": "groq"                  # ✅ updated from ollama
        }
    }