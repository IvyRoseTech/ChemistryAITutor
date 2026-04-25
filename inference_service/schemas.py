from pydantic import BaseModel, Field
from typing import List, Optional, Any

# ─────────────────────────────────────────
# GENERAL SCHEMAS
# ─────────────────────────────────────────
class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: int = 100
    temperature: float = 0.7

class GenerateResponse(BaseModel):
    text: str
    model_name: str


# ─────────────────────────────────────────
# RAG SEARCH SCHEMAS
# ─────────────────────────────────────────
class RAGQueryRequest(BaseModel):
    query: str = Field(
        ..., description="Search query text"
    )
    topic: Optional[str] = Field(
        None, description="Optional topic filter"
    )
    top_k: int = Field(
        5, ge=1, le=20,
        description="Number of results to return"
    )
    generate_answer: bool = Field(
        True,
        description="Whether to generate AI answer"
    )


class RAGChunk(BaseModel):
    chunk_id: int
    text: str
    source: str
    distance: float
    score: float


class RAGQueryResponse(BaseModel):
    query: str
    chunks: List[RAGChunk]
    count: int
    answer: Optional[str] = None
    model: Optional[str] = None
    status: Optional[str] = None


# ─────────────────────────────────────────
# RAG GENERATION SCHEMAS
# ─────────────────────────────────────────
class RAGGenerateRequest(BaseModel):
    question: str = Field(
        ..., description="Student question"
    )
    topic: Optional[str] = Field(None)
    top_k: int = Field(3, ge=1, le=10)
    max_tokens: int = Field(1024, ge=1, le=4096)
    temperature: float = Field(0.3, ge=0.0, le=1.0)
    stream: bool = Field(False)
    session_id: str = Field(
        "default",
        description="Unique session per student"
    )


class RAGGenerateResponse(BaseModel):
    question: str
    answer: str
    context: List[RAGChunk]
    model: str = "groq/llama-3.1-8b-instant"  # ← fixed
    status: str = "success"
    session_id: str = "default"
    tokens_used: Optional[int] = None

# ─────────────────────────────────────────
# HEALTH CHECK SCHEMA
# ─────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    rag_index: dict
    llm_model: str = "groq/llama-3.1-8b-instant"  # ← updated
    service: str = "GCE Chemistry AI Tutor"