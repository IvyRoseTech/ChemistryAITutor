"""
Quiz API — GCE Chemistry AI Tutor
Generates MCQ questions from syllabus using FAISS + Groq
"""

import json
import os
import random
from fastapi import APIRouter, HTTPException
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/quiz", tags=["Quiz"])

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ─────────────────────────────────────────
# QUESTION GENERATION PROMPT
# ─────────────────────────────────────────
QUIZ_PROMPT = """You are a GCE A-Level Chemistry exam question generator.

Based ONLY on the syllabus content below, generate {count} multiple choice questions.

SYLLABUS CONTENT:
{context}

STRICT RULES:
- Each question must have exactly 4 options
- Only one option is correct
- Base questions ONLY on the provided content
- Include a clear explanation for the correct answer
- Questions should vary in difficulty

Respond with ONLY a valid JSON array — no markdown, no explanation, no extra text:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Clear explanation of why this answer is correct based on the syllabus.",
    "topic": "Topic name from content"
  }}
]"""


# ─────────────────────────────────────────
# GENERATE QUESTIONS ENDPOINT
# ─────────────────────────────────────────
@router.get("/questions")
async def get_quiz_questions(
    topic: str = None,
    count: int = 5
):
    """
    Generate AI quiz questions from the GCE Chemistry syllabus.
    Uses FAISS to retrieve relevant chunks then Groq to generate MCQs.
    """
    try:
        from retrieval.faiss_search import search

        # Step 1 — Build search query
        search_query = topic if topic else "GCE Chemistry key concepts reactions bonding"

        # Step 2 — Retrieve syllabus chunks
        chunks = search(query=search_query, top_k=8, topic_filter=topic)

        if not chunks:
            raise HTTPException(
                status_code=404,
                detail="No syllabus content found for this topic."
            )

        # Step 3 — Build context from chunks
        context = "\n\n".join([
            f"[Topic: {c.get('topic', 'Chemistry')}]\n{c.get('text', '')}"
            for c in chunks
        ])

        # Step 4 — Generate questions with Groq
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": QUIZ_PROMPT.format(
                        count=count,
                        context=context
                    )
                }
            ],
            temperature=0.7,
            max_tokens=2000
        )

        raw = response.choices[0].message.content.strip()

        # Step 5 — Parse JSON response
        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        questions = json.loads(raw)

        # Step 6 — Validate and clean questions
        cleaned = []
        for i, q in enumerate(questions):
            if not all(k in q for k in ["question", "options", "correct_index", "explanation"]):
                continue
            if len(q["options"]) != 4:
                continue
            cleaned.append({
                "id": i + 1,
                "question": q["question"],
                "options": q["options"],
                "correct_index": int(q["correct_index"]),
                "explanation": q["explanation"],
                "topic": q.get("topic", topic or "GCE Chemistry")
            })

        if not cleaned:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate valid questions. Please try again."
            )

        return {
            "questions": cleaned,
            "count": len(cleaned),
            "topic": topic or "GCE Chemistry",
            "status": "success"
        }

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Failed to parse generated questions. Please try again."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Quiz generation failed: {str(e)}"
        )


# ─────────────────────────────────────────
# SUBMIT QUIZ ENDPOINT
# ─────────────────────────────────────────
@router.post("/submit")
async def submit_quiz(submission: dict):
    """
    Receives student answers and returns score with feedback.
    submission = {
        "questions": [...],
        "answers": [0, 2, 1, 3, ...],  ← student selected indices
        "time_taken": 120               ← seconds
    }
    """
    try:
        questions = submission.get("questions", [])
        answers = submission.get("answers", [])
        time_taken = submission.get("time_taken", 0)

        if not questions or not answers:
            raise HTTPException(
                status_code=400,
                detail="Questions and answers are required."
            )

        # Score each question
        results = []
        correct_count = 0

        for i, question in enumerate(questions):
            student_answer = answers[i] if i < len(answers) else None
            correct_index = question.get("correct_index", 0)
            is_correct = student_answer == correct_index

            if is_correct:
                correct_count += 1

            results.append({
                "id": question.get("id", i + 1),
                "question": question["question"],
                "options": question["options"],
                "student_answer": student_answer,
                "correct_index": correct_index,
                "is_correct": is_correct,
                "explanation": question.get("explanation", ""),
                "topic": question.get("topic", "")
            })

        total = len(questions)
        score_percent = round((correct_count / total) * 100) if total > 0 else 0

        # Grade
        if score_percent >= 80:
            grade = "A"
            feedback = "Excellent work! You have a strong grasp of this topic."
        elif score_percent >= 65:
            grade = "B"
            feedback = "Good performance. Review the questions you missed."
        elif score_percent >= 50:
            grade = "C"
            feedback = "You passed, but there are gaps to fill. Use the AI Tutor to review."
        else:
            grade = "F"
            feedback = "Keep practising. Ask the AI Tutor to explain the topics you struggled with."

        return {
            "score": correct_count,
            "total": total,
            "percentage": score_percent,
            "grade": grade,
            "feedback": feedback,
            "time_taken": time_taken,
            "results": results,
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Submission failed: {str(e)}"
        )
