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
        if len(self.sessions[session_id]) > 10:
            self.sessions[session_id] = \
                self.sessions[session_id][-10:]

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
# SYSTEM PROMPT
# ─────────────────────────────────────────
SYSTEM_PROMPT = """CRITICAL RULE NUMBER ONE:
Never reveal the answer in your first response.
Always probe what the student knows first.
Maximum 2 sentences then one question.
Never exceed 50 words total.

You are ChemAI — the most memorable Chemistry 
tutor this student has ever met.

FIRST RESPONSE RULE:
When a student asks about ANY concept always
start with a real world connection then ask
what they already know. Never explain first.

Example:
Student: "What is ionic bonding?"
WRONG: "Ionic bonding is when electrons transfer..."
RIGHT: "You actually use ionic bonding every day 
        without knowing it — table salt is the 
        perfect example. What do you think holds 
        salt together at the atomic level?"

YOUR VOICE:
- Talk like a brilliant friend not a textbook
- Warm, direct and exciting
- Never lecture — always converse
- No lists, bullets or headers ever

REASONING DETECTION:
When student answers internally assess:
- CLOSE → "So close! Just one more step..."
- PARTIALLY RIGHT → "Half right! Now what about..."
- MIXING CONCEPTS → "I love this — you are 
  actually describing [X]! What makes ionic 
  different from what you just said?"
- WRONG → Never say wrong. Say: "Interesting — 
  what if I told you something surprising..."

REAL WORLD FIRST — always use these hooks:
Salt dissolving → ionic bonding
Water existing → covalent bonding
Fizzy drinks → equilibrium
Iron rusting → oxidation
Fireworks colours → periodic trends

CONFIDENCE READING:
"I think/maybe" → "Trust that instinct — 
you are closer than you know..."
"I give up" → "One image — think of [analogy]. 
Does that click?"

CELEBRATE WINS:
One punchy sentence about exactly what 
they got right.

ABSOLUTE RULES:
- 50 words maximum
- One question only
- No bullet points
- No numbered lists
- No Definition/Explanation/Key Points
- Syllabus context only
- Outside syllabus: "That is beyond our 
  syllabus — what else can we explore?"
"""

# ─────────────────────────────────────────
# BUILD MESSAGES WITH HISTORY
# ─────────────────────────────────────────
def build_messages(
    question: str,
    context: str,
    session_id: str
) -> list:
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    history = conversation_manager.get_history(session_id)
    for msg in history:
        messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })

    messages.append({
        "role": "user",
        "content": f"""Syllabus Context (use ONLY this):
{context}

Student Question: {question}"""
    })

    return messages

# ─────────────────────────────────────────
# CALL GROQ
# ─────────────────────────────────────────
def call_groq(
    question: str,
    context: str,
    session_id: str,
    temperature: float = 0.5
) -> str:
    try:
        messages = build_messages(
            question, context, session_id
        )

        response = groq_client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=temperature,
            max_tokens=120,
            top_p=0.9
        )

        answer = response.choices[0].message.content

        # Enforce short response
        sentences = answer.split(". ")
        if len(sentences) > 3:
            answer = ". ".join(sentences[:3])
            if not answer.endswith("?"):
                answer += "?"

        # Save to memory
        conversation_manager.add_message(
            session_id, "user", question
        )
        conversation_manager.add_message(
            session_id, "assistant", answer
        )

        return answer

    except Exception as e:
        error = str(e)
        if "api_key" in error.lower():
            return "Invalid API key. Check your .env file."
        elif "429" in error:
            return "Rate limit reached. Wait 1 minute."
        elif "connect" in error.lower():
            return "No internet connection."
        return f"Error: {error}"

# ─────────────────────────────────────────
# STREAM RESPONSE
# ─────────────────────────────────────────
def stream_groq(
    question: str,
    context: str,
    session_id: str
):
    try:
        messages = build_messages(
            question, context, session_id
        )

        stream = groq_client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.5,
            max_tokens=120,
            stream=True
        )

        full_answer = ""
        for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                full_answer += token
                yield f"data: {json.dumps({'token': token})}\n\n"

        conversation_manager.add_message(
            session_id, "user", question
        )
        conversation_manager.add_message(
            session_id, "assistant", full_answer
        )

        yield "data: [DONE]\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

# ─────────────────────────────────────────
# MAIN RAG PIPELINE
# ─────────────────────────────────────────
def generate_rag_answer(request):
    """
    Complete Socratic RAG Pipeline:
    1. FAISS searches syllabus
    2. Filters by relevance
    3. Builds context
    4. Groq generates Socratic response
    5. Saves to conversation memory
    """
    from retrieval.faiss_search import search

    # Step 1 - Search FAISS
    chunks = search(
        query=request.question,
        top_k=request.top_k,
        topic_filter=request.topic
    )

    # Step 2 - Handle no results
    if not chunks:
        return {
            "question": request.question,
            "answer": "I could not find that topic "
                     "in your GCE Chemistry syllabus. "
                     "What other concept would you "
                     "like to explore?",
            "context": [],
            "session_id": getattr(
                request, 'session_id', 'default'
            )
        }

    # Step 3 - Filter weak matches
    filtered = [
        c for c in chunks
        if c.get("score", 1.0) >= RELEVANCE_THRESHOLD
    ]
    final_chunks = filtered if filtered else chunks

    # Step 4 - Build context
    context_text = "\n\n".join([
        f"[Topic: {c.get('topic', 'Chemistry')}]"
        f"\n{c.get('text', '')}"
        for c in final_chunks
    ])

    # Step 5 - Get session ID
    session_id = request.session_id \
        if hasattr(request, 'session_id') \
        and request.session_id \
        else 'default'

    print(f"🎯 Session: {session_id}")

    # Step 6 - Stream or full response
    if request.stream:
        return stream_groq(
            request.question,
            context_text,
            session_id
        )

    # Step 7 - Generate response
    answer = call_groq(
        question=request.question,
        context=context_text,
        session_id=session_id,
        temperature=getattr(request, 'temperature', 0.5)
    )

    return {
        "question": request.question,
        "answer": answer,
        "context": final_chunks,
        "session_id": session_id
    }