"""
Past Papers API — GCE Chemistry AI Tutor
Serves past paper questions, AI grading, and progress tracking
"""

import os
import json
import uuid
from datetime import datetime, date
from pathlib import Path
from fastapi import APIRouter, HTTPException
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/papers", tags=["Papers"])
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

PAPERS_INDEX = Path("data/papers/papers_index.json")
PROGRESS_DIR = Path("data/papers/progress")

# ─────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────
def load_papers_index() -> dict:
    if not PAPERS_INDEX.exists():
        raise HTTPException(
            status_code=404,
            detail="Papers not yet ingested. Run: python ingestion/ingest_papers.py"
        )
    with open(PAPERS_INDEX, "r", encoding="utf-8") as f:
        return json.load(f)


def load_progress(student_id: str) -> dict:
    PROGRESS_DIR.mkdir(parents=True, exist_ok=True)
    path = PROGRESS_DIR / f"{student_id}.json"
    if path.exists():
        with open(path, "r") as f:
            return json.load(f)
    return {
        "student_id": student_id,
        "attempts": [],
        "daily_stats": {},
        "total_attempted": 0,
        "total_correct": 0
    }


def save_progress(student_id: str, progress: dict):
    PROGRESS_DIR.mkdir(parents=True, exist_ok=True)
    path = PROGRESS_DIR / f"{student_id}.json"
    with open(path, "w") as f:
        json.dump(progress, f, indent=2)


# ─────────────────────────────────────────
# LIST AVAILABLE YEARS
# ─────────────────────────────────────────
@router.get("/years")
async def get_available_years():
    """Returns all years that have been ingested."""
    index = load_papers_index()
    return {
        "years": index.get("years_available", []),
        "year_summary": index.get("year_summary", {}),
        "subject": index.get("subject", "GCE Chemistry"),
        "status": "success"
    }


# ─────────────────────────────────────────
# GET QUESTIONS FOR A PAPER
# ─────────────────────────────────────────
@router.get("/questions")
async def get_paper_questions(
    year: int,
    paper: int = 1,
    question_type: str = "mcq"  # 'mcq' or 'structured' or 'all'
):
    """Returns all questions for a specific year and paper."""
    index = load_papers_index()

    # Find the paper
    paper_data = None
    for p in index.get("papers", []):
        if p["year"] == year and p["paper"] == paper:
            paper_data = p
            break

    if not paper_data:
        raise HTTPException(
            status_code=404,
            detail=f"Paper not found: {year} Paper {paper}. Run ingestion first."
        )

    if question_type == "mcq":
        questions = paper_data.get("mcq_questions", [])
    elif question_type == "structured":
        questions = paper_data.get("structured_questions", [])
    else:
        questions = (
            paper_data.get("mcq_questions", []) +
            paper_data.get("structured_questions", [])
        )

    return {
        "year": year,
        "paper": paper,
        "question_type": question_type,
        "questions": questions,
        "count": len(questions),
        "status": "success"
    }


# ─────────────────────────────────────────
# AI GRADE A STRUCTURED ANSWER
# ─────────────────────────────────────────
@router.post("/grade")
async def grade_answer(submission: dict):
    """
    AI grades a student's written answer.
    submission = {
        "question": "...",
        "student_answer": "...",
        "topic": "...",
        "marks": 5,
        "year": 2023,
        "paper": 1
    }
    """
    question = submission.get("question", "")
    student_answer = submission.get("student_answer", "")
    topic = submission.get("topic", "GCE Chemistry")
    marks = submission.get("marks", 5)

    if not question or not student_answer:
        raise HTTPException(status_code=400, detail="Question and answer required.")

    if len(student_answer.strip()) < 5:
        return {
            "score": 0,
            "max_marks": marks,
            "percentage": 0,
            "grade": "F",
            "feedback": "No answer provided.",
            "correct_points": [],
            "missing_points": [],
            "model_answer": "",
            "status": "success"
        }

    # Get syllabus context from FAISS
    syllabus_context = ""
    try:
        from retrieval.faiss_search import search
        chunks = search(query=f"{topic} {question[:100]}", top_k=3)
        if chunks:
            syllabus_context = "\n".join([c.get("text", "") for c in chunks])
    except Exception:
        pass

    grading_prompt = f"""You are a GCE A-Level Chemistry examiner grading a student answer.

QUESTION ({marks} marks):
{question}

STUDENT ANSWER:
{student_answer}

RELEVANT SYLLABUS CONTENT:
{syllabus_context if syllabus_context else "Use your chemistry knowledge."}

Grade this answer strictly as a GCE examiner. Respond with ONLY valid JSON:
{{
  "score": <integer 0 to {marks}>,
  "feedback": "Brief overall feedback in 2 sentences.",
  "correct_points": ["Point student got right", "Another correct point"],
  "missing_points": ["Key point that was missing", "Another missing point"],
  "model_answer": "A complete model answer for this question in 3-5 sentences."
}}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": grading_prompt}],
            temperature=0.2,
            max_tokens=800
        )

        raw = response.choices[0].message.content.strip()
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        result = json.loads(raw)
        score = min(int(result.get("score", 0)), marks)
        percentage = round((score / marks) * 100) if marks > 0 else 0

        grade = "A" if percentage >= 80 else \
                "B" if percentage >= 65 else \
                "C" if percentage >= 50 else "F"

        return {
            "score": score,
            "max_marks": marks,
            "percentage": percentage,
            "grade": grade,
            "feedback": result.get("feedback", ""),
            "correct_points": result.get("correct_points", []),
            "missing_points": result.get("missing_points", []),
            "model_answer": result.get("model_answer", ""),
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grading failed: {str(e)}")


# ─────────────────────────────────────────
# SAVE STUDENT PROGRESS
# ─────────────────────────────────────────
@router.post("/progress/save")
async def save_student_progress(data: dict):
    """
    Saves a student's attempt to their progress file.
    data = {
        "student_id": "uid_from_firebase",
        "year": 2023,
        "paper": 1,
        "question_type": "mcq",
        "score": 8,
        "total": 10,
        "time_taken": 300,
        "topic_breakdown": {"Bonding": {"correct": 3, "total": 4}}
    }
    """
    student_id = data.get("student_id", "default")
    progress = load_progress(student_id)

    today = date.today().isoformat()

    attempt = {
        "id": str(uuid.uuid4()),
        "date": today,
        "year": data.get("year"),
        "paper": data.get("paper"),
        "question_type": data.get("question_type", "mcq"),
        "score": data.get("score", 0),
        "total": data.get("total", 0),
        "percentage": round((data.get("score", 0) / data.get("total", 1)) * 100),
        "time_taken": data.get("time_taken", 0),
        "topic_breakdown": data.get("topic_breakdown", {})
    }

    progress["attempts"].append(attempt)
    progress["total_attempted"] += attempt["total"]
    progress["total_correct"] += attempt["score"]

    # Update daily stats
    if today not in progress["daily_stats"]:
        progress["daily_stats"][today] = {
            "attempted": 0,
            "correct": 0,
            "sessions": 0
        }
    progress["daily_stats"][today]["attempted"] += attempt["total"]
    progress["daily_stats"][today]["correct"] += attempt["score"]
    progress["daily_stats"][today]["sessions"] += 1

    save_progress(student_id, progress)

    return {"status": "success", "attempt_id": attempt["id"]}


# ─────────────────────────────────────────
# GET STUDENT PROGRESS
# ─────────────────────────────────────────
@router.get("/progress")
async def get_student_progress(student_id: str, days: int = 7):
    """Returns student progress stats for the last N days."""
    progress = load_progress(student_id)

    # Build last N days stats
    from datetime import timedelta
    today = date.today()
    daily = []
    for i in range(days - 1, -1, -1):
        d = (today - timedelta(days=i)).isoformat()
        stats = progress["daily_stats"].get(d, {"attempted": 0, "correct": 0, "sessions": 0})
        daily.append({
            "date": d,
            "attempted": stats["attempted"],
            "correct": stats["correct"],
            "accuracy": round((stats["correct"] / stats["attempted"]) * 100) if stats["attempted"] > 0 else 0,
            "sessions": stats["sessions"]
        })

    # Recent attempts
    recent = sorted(progress["attempts"], key=lambda x: x["date"], reverse=True)[:10]

    # Overall accuracy
    total_attempted = progress.get("total_attempted", 0)
    total_correct = progress.get("total_correct", 0)
    overall_accuracy = round((total_correct / total_attempted) * 100) if total_attempted > 0 else 0

    # Topic breakdown across all attempts
    topic_stats = {}
    for attempt in progress["attempts"]:
        for topic, stats in attempt.get("topic_breakdown", {}).items():
            if topic not in topic_stats:
                topic_stats[topic] = {"correct": 0, "total": 0}
            topic_stats[topic]["correct"] += stats.get("correct", 0)
            topic_stats[topic]["total"] += stats.get("total", 0)

    weak_topics = [
        {"topic": t, "accuracy": round((s["correct"] / s["total"]) * 100)}
        for t, s in topic_stats.items()
        if s["total"] > 0 and (s["correct"] / s["total"]) < 0.6
    ]

    return {
        "student_id": student_id,
        "total_attempted": total_attempted,
        "total_correct": total_correct,
        "overall_accuracy": overall_accuracy,
        "daily_stats": daily,
        "recent_attempts": recent,
        "weak_topics": sorted(weak_topics, key=lambda x: x["accuracy"])[:5],
        "status": "success"
    }
