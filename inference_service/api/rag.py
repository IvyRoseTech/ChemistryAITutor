"""
RAG API endpoints for GCE Chemistry AI Tutor.
Handles search, generation, and stats routes.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from schemas import (
    RAGQueryRequest, RAGQueryResponse,
    RAGChunk, RAGGenerateRequest, RAGGenerateResponse
)
from retrieval.faiss_search import search, get_index_stats
import traceback

router = APIRouter(prefix="/rag", tags=["RAG"])

# Minimum relevance score to include a chunk
RELEVANCE_THRESHOLD = 0.3

# ─────────────────────────────────────────
# /rag/query — Search FAISS + Generate Answer
# ─────────────────────────────────────────
@router.post("/generate")
async def generate_answer(request: RAGGenerateRequest):
    from generation import generate_rag_answer
    import traceback

    try:
        result = generate_rag_answer(request)

        if request.stream:
            from fastapi.responses import StreamingResponse
            return StreamingResponse(
                result,
                media_type="text/event-stream"
            )

        return RAGGenerateResponse(
            question=result["question"],
            answer=result["answer"],
            context=[
                RAGChunk(**c) for c in result["context"]
            ],
            model="groq/llama-3.1-8b-instant",  # ← fixed
            status="success",
            session_id=result.get(               # ← fixed
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
# /rag/generate — Full RAG Generation
# ─────────────────────────────────────────
@router.post("/generate", response_model=RAGGenerateResponse)
async def generate_answer_endpoint(request: RAGGenerateRequest):
    """
    Full RAG generation - retrieves chunks then generates
    a detailed GCE Chemistry answer using Llama 3.2:3b
    """
    try:
        # Step 1 - Retrieve relevant chunks from FAISS
        results = search(
            query=request.question,
            top_k=request.top_k,
            topic_filter=request.topic
        )

        if not results:
            return RAGGenerateResponse(
                question=request.question,
                answer="I cannot find relevant content in your GCE Chemistry syllabus for this question.",
                context=[],
                model="llama3.2:3b",
                status="no_results"
            )

        chunks = [RAGChunk(**r) for r in results]

        # Step 2 - Stream response if requested
        if request.stream:
            from services.llm_service import stream_answer
            return StreamingResponse(
                stream_answer(request.question, [c.dict() for c in chunks]),
                media_type="text/event-stream"
            )

        # Step 3 - Generate full answer with Llama
        from services.llm_service import generate_answer
        llm_result = generate_answer(
            question=request.question,
            chunks=[c.dict() for c in chunks],
            temperature=request.temperature
        )

        return RAGGenerateResponse(
            question=request.question,
            answer=llm_result["answer"],
            context=chunks,
            model="llama3.2:3b",
            status=llm_result["status"]
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


# ─────────────────────────────────────────
# /rag/stats — Index Statistics
# ─────────────────────────────────────────
@router.get("/stats")
async def get_stats():
    """
    Get FAISS index statistics and LLM status.
    """
    stats = get_index_stats()

    # Check Ollama is running
    llm_status = "unknown"
    try:
        import httpx
        res = httpx.get("http://localhost:11434/api/tags", timeout=3)
        if res.status_code == 200:
            models = res.json().get("models", [])
            names = [m.get("name", "") for m in models]
            llm_status = "ready" if any("llama3.2" in n for n in names) else "model_missing"
        else:
            llm_status = "ollama_error"
    except Exception:
        llm_status = "ollama_not_running"

    return {
        "rag": stats,
        "llm": {
            "model": "llama3.2:3b",
            "status": llm_status,
            "endpoint": "http://localhost:11434"
        }
    }
