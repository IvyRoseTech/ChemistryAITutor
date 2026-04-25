"""
LLM Service - Integrates Llama 3.2:3b via Ollama
Handles all AI generation for Chemistry tutoring
"""

from langchain_ollama import OllamaLLM
from langchain.prompts import PromptTemplate

# ─────────────────────────────────────────
# CHEMISTRY TUTOR PROMPT
# ─────────────────────────────────────────
CHEMISTRY_PROMPT = PromptTemplate(
    template="""You are an expert GCE Chemistry tutor. 
You only answer based on the syllabus content provided below.
Use proper chemical terminology, equations, and clear explanations.
If the answer is not in the context, say: 
"This topic is not covered in your current GCE syllabus material."

Syllabus Context:
{context}

Student Question: {question}

GCE Chemistry Answer:""",
    input_variables=["context", "question"]
)

# ─────────────────────────────────────────
# INITIALIZE LLAMA MODEL
# ─────────────────────────────────────────
def get_llm():
    return OllamaLLM(
        model="llama3.2:3b",
        temperature=0.1,        # low = factual, no hallucination
        num_ctx=4096,           # context window size
        repeat_penalty=1.1      # avoids repetitive answers
    )

# ─────────────────────────────────────────
# GENERATE ANSWER FROM CHUNKS
# ─────────────────────────────────────────
def generate_answer(question: str, chunks: list) -> dict:
    """
    Takes search results from FAISS and generates
    a Chemistry answer using Llama
    """
    try:
        # Build context from your FAISS chunks
        context_parts = []
        for i, chunk in enumerate(chunks):
            # Handle both dict and object chunk formats
            if isinstance(chunk, dict):
                text = chunk.get("text", chunk.get("content", str(chunk)))
                topic = chunk.get("topic", "General Chemistry")
            else:
                text = getattr(chunk, "text", str(chunk))
                topic = getattr(chunk, "topic", "General Chemistry")
            
            context_parts.append(f"[Topic: {topic}]\n{text}")
        
        context = "\n\n".join(context_parts)
        
        # Format the prompt
        prompt = CHEMISTRY_PROMPT.format(
            context=context,
            question=question
        )
        
        # Get answer from Llama
        llm = get_llm()
        answer = llm.invoke(prompt)
        
        return {
            "answer": answer,
            "model": "llama3.2:3b",
            "chunks_used": len(chunks),
            "status": "success"
        }
    
    except ConnectionError:
        return {
            "answer": "AI model is not running. Please start Ollama with: ollama serve",
            "status": "error",
            "error": "Ollama not running"
        }
    except Exception as e:
        return {
            "answer": f"Error generating answer: {str(e)}",
            "status": "error",
            "error": str(e)
        }