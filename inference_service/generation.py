"""
Generation Module
Groq API + Llama 3.1 + Socratic Dialogue
GCE Chemistry AI Tutor
"""
import os
import sys
import json
from typing import List, Dict
from groq import Groq
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

# ─────────────────────────────────────────
# CONVERSATION MANAGER
# ─────────────────────────────────────────
class ConversationManager:
    def __init__(self):
        self.sessions: Dict[str, List] = {}

    def get_history(self, session_id: str) -> List:
        return self.sessions.get(session_id, [])

    def get_turn_number(self, session_id: str) -> int:
        """
        Returns the current turn number based on how many
        assistant messages exist in this session.
        Turn 1 = no assistant messages yet (first student question).
        Turn 2 = one assistant message already sent.
        Turn 3+ = two or more assistant messages sent.
        """
        history = self.sessions.get(session_id, [])
        completed_turns = sum(
            1 for m in history if m["role"] == "assistant"
        )
        return completed_turns + 1

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str
    ):
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        self.sessions[session_id].append({
            "role": role,
            "content": content
        })
        # Keep last 20 messages (10 full exchanges) for memory
        if len(self.sessions[session_id]) > 20:
            self.sessions[session_id] = \
                self.sessions[session_id][-20:]

    def clear_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]


# Global instance
conversation_manager = ConversationManager()

# ─────────────────────────────────────────
# CONFIGURE GROQ
# ─────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)

MODEL_NAME = "llama-3.1-8b-instant"
RELEVANCE_THRESHOLD = 0.3

# ─────────────────────────────────────────
# SYSTEM PROMPT (base — turn instruction injected dynamically)
# ─────────────────────────────────────────
SYSTEM_PROMPT = """You are ChemAI — a brilliant GCE Chemistry tutor who uses Socratic dialogue.

STRICT LENGTH RULE:
"Give the answer in exactly 2 clear sentences. Then one extension question."

SOCRATIC TURN RULES (follow the CURRENT TURN instruction injected below — this overrides everything):
Turn 1 → Open with a real-world hook to spark curiosity. Ask one probing question. Do NOT reveal the answer.
Turn 2 → If the student is wrong, give a gentle hint that nudges them closer. If right, celebrate briefly. Still do NOT give the full answer.
Turn 3+ → Naturally reveal the answer in 1–2 clear sentences. Then ask one extension question to deepen understanding.

SPECIAL CASES (these override turn rules):
• Student says "I don't know" → Explain immediately and clearly. Do NOT keep probing.
  Format: "No worries — here's what happens: [clear explanation]. Does that make sense?"
• Student says "just tell me" or "explain directly" → Give the answer in 2 punchy sentences, then one extension question.
• Student asks for a short/definition answer → Give the shortest accurate answer possible. No Socratic probe needed.
  Example: "Define acid" → "A substance that releases H⁺ ions in solution."

REASONING DETECTION:
• CLOSE → Build on it and confirm.
• PARTIALLY RIGHT → Correct the gap gently.
• MIXING CONCEPTS → Distinguish calmly.
• CLEARLY WRONG → Redirect without saying "wrong" — guide to the right direction.
• AFTER 2 WRONG ATTEMPTS → Give the answer directly.

VOICE:
Warm, natural, direct. Talk like a brilliant friend who knows Chemistry deeply.
No bullet points. No headers. No lists. No labels like "Definition:" or "Key Points:".

SCOPE:
Syllabus context only. If outside syllabus: "That's beyond our syllabus — what else can we explore?"
"""

# ─────────────────────────────────────────
# TURN INSTRUCTION BUILDER
# ─────────────────────────────────────────
def _build_turn_instruction(session_id: str) -> str:
    """
    Generates a turn-specific instruction injected into the
    system prompt so the LLM always knows exactly which
    Socratic phase it is in — no guessing from history.
    """
    turn = conversation_manager.get_turn_number(session_id)

    if turn == 1:
        return (
            "\n\n─── CURRENT TURN: 1 ───\n"
            "This is the student's FIRST message on this topic.\n"
            "Your job: Ask a real-world hook question to spark curiosity.\n"
            "Do NOT explain or reveal the answer under any circumstances.\n"
            "End with exactly one probing question."
        )
    elif turn == 2:
        return (
            "\n\n─── CURRENT TURN: 2 ───\n"
            "The student has had one exchange already.\n"
            "If their answer is wrong: give a helpful hint that nudges "
            "them toward the right idea — do NOT give the full answer yet.\n"
            "If their answer is right: celebrate briefly and deepen with "
            "one follow-up question.\n"
            "End with exactly one question."
        )
    else:
        return (
            f"\n\n─── CURRENT TURN: {turn} ───\n"
            "The student has had multiple exchanges. It is now time to "
            "teach directly if they have not discovered the answer yet.\n"
            "Reveal the answer naturally in 1–2 clear sentences.\n"
            "Then ask ONE extension question to deepen understanding.\n"
            "Do not keep withholding the answer — this turn is for clarity."
        )


# ─────────────────────────────────────────
# BUILD MESSAGES WITH HISTORY + TURN INJECTION
# ─────────────────────────────────────────
def build_messages(
    question: str,
    context: str,
    session_id: str
) -> list:
    """
    Builds the full message list for Groq.
    The system prompt is dynamically extended with the current
    turn instruction so the LLM never guesses the Socratic phase.
    """
    turn_instruction = _build_turn_instruction(session_id)
    dynamic_system_prompt = SYSTEM_PROMPT + turn_instruction

    messages = [
        {
            "role": "system",
            "content": dynamic_system_prompt
        }
    ]

    # Inject conversation history
    history = conversation_manager.get_history(session_id)
    for msg in history:
        messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })

    # Append the current student question with syllabus context
    messages.append({
        "role": "user",
        "content": (
            f"Syllabus Context (use ONLY this — do not go beyond):\n"
            f"{context}\n\n"
            f"Student Question: {question}"
        )
    })

    return messages


# ─────────────────────────────────────────
# CALL GROQ (non-streaming)
# ─────────────────────────────────────────
def call_groq(
    question: str,
    context: str,
    session_id: str,
    temperature: float = 0.5
) -> str:
    try:
        messages = build_messages(question, context, session_id)

        response = groq_client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=temperature,
            max_tokens=180,   # Raised from 120 — gives room for Socratic response + question
            top_p=0.9
        )

        answer = response.choices[0].message.content.strip()

        # Soft length enforcement — keep max 3 sentences
        sentences = answer.split(". ")
        if len(sentences) > 3:
            answer = ". ".join(sentences[:3]).strip()
            if not answer.endswith("?") and not answer.endswith("."):
                answer += "."

        # Save both sides to memory
        conversation_manager.add_message(session_id, "user", question)
        conversation_manager.add_message(session_id, "assistant", answer)

        return answer

    except Exception as e:
        error = str(e)
        if "api_key" in error.lower():
            return "Invalid API key. Please check your .env file."
        elif "429" in error:
            return "Rate limit reached. Please wait 1 minute and try again."
        elif "connect" in error.lower():
            return "No internet connection detected."
        return f"Error: {error}"


# ─────────────────────────────────────────
# STREAM GROQ (streaming)
# ─────────────────────────────────────────
def stream_groq(
    question: str,
    context: str,
    session_id: str
):
    try:
        messages = build_messages(question, context, session_id)

        stream = groq_client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.5,
            max_tokens=180,   # Raised from 120 to match non-streaming
            stream=True
        )

        full_answer = ""
        for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                full_answer += token
                yield f"data: {json.dumps({'token': token})}\n\n"

        # Save full streamed response to memory after completion
        conversation_manager.add_message(session_id, "user", question)
        conversation_manager.add_message(session_id, "assistant", full_answer)

        yield "data: [DONE]\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


# ─────────────────────────────────────────
# TOPIC-ANCHORED FAISS QUERY BUILDER
# ─────────────────────────────────────────
def _build_search_query(question: str, session_id: str) -> str:
    """
    Builds a FAISS search query that keeps topic context through
    conversation turns. Short student replies like "I don't know"
    or "maybe electrons?" have no topic signal on their own,
    causing FAISS to drift to unrelated syllabus chunks.
    Prepending the last AI message anchors the query to the
    topic actually being discussed.
    """
    history = conversation_manager.get_history(session_id)

    # If no history or the question is already detailed, use it as-is
    if not history or len(question.strip()) >= 80:
        return question

    last_ai = next(
        (m["content"] for m in reversed(history)
         if m["role"] == "assistant"),
        ""
    )
    if last_ai:
        return f"{last_ai} {question}"[:350]
    return question


# ─────────────────────────────────────────
# MAIN RAG PIPELINE
# ─────────────────────────────────────────
def generate_rag_answer(request):
    """
    Complete Socratic RAG Pipeline:
    1. Determine session ID
    2. Build topic-anchored FAISS search query
    3. Search syllabus chunks via FAISS
    4. Filter by relevance score
    5. Build context string
    6. Inject dynamic turn instruction into system prompt
    7. Call Groq (streaming or full)
    8. Save exchange to conversation memory
    """
    from retrieval.faiss_search import search

    # Step 1 — Resolve session ID
    session_id = (
        request.session_id
        if hasattr(request, "session_id") and request.session_id
        else "default"
    )

    # Step 2 — Build topic-anchored query
    search_query = _build_search_query(request.question, session_id)

    # Step 3 — Search FAISS index
    chunks = search(
        query=search_query,
        top_k=request.top_k,
        topic_filter=request.topic
    )

    # Step 4 — Handle zero results
    if not chunks:
        return {
            "question": request.question,
            "answer": (
                "I could not find that topic in your GCE Chemistry "
                "syllabus. What other concept would you like to explore?"
            ),
            "context": [],
            "session_id": session_id
        }

    # Step 5 — Filter weak relevance matches
    filtered = [
        c for c in chunks
        if c.get("score", 1.0) >= RELEVANCE_THRESHOLD
    ]
    final_chunks = filtered if filtered else chunks

    # Step 6 — Build context string from chunks
    context_text = "\n\n".join([
        f"[Topic: {c.get('topic', 'Chemistry')}]\n{c.get('text', '')}"
        for c in final_chunks
    ])

    print(
        f"🎯 Session: {session_id} | "
        f"Turn: {conversation_manager.get_turn_number(session_id)} | "
        f"Chunks: {len(final_chunks)}"
    )

    # Step 7 — Stream or full response
    if request.stream:
        return stream_groq(
            request.question,
            context_text,
            session_id
        )

    # Step 8 — Generate full response
    answer = call_groq(
        question=request.question,
        context=context_text,
        session_id=session_id,
        temperature=getattr(request, "temperature", 0.5)
    )

    return {
        "question": request.question,
        "answer": answer,
        "context": final_chunks,
        "session_id": session_id
    }