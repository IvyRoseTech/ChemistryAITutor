# GCE AI TUTOR — STARTUP GUIDE
==============================

## FIRST TIME ONLY — Install inference service dependencies
```
cd D:\gce-ai-tutor\gce_ai_tutor\inference_service
python -m venv .venv
.venv\Scripts\activate
pip install fastapi uvicorn pydantic python-docx faiss-cpu sentence-transformers python-dotenv groq httpx pypdf
```

---

## EVERY TIME — Start all 3 services in separate terminals

### TERMINAL 1 — FastAPI AI Service (port 8001)
```
cd D:\gce-ai-tutor\gce_ai_tutor\inference_service
.venv\Scripts\activate
python -m uvicorn main:app --reload --port 8001
```
 Must start FIRST — AI chat, quiz, and past papers all depend on this

### TERMINAL 2 — Django Backend (port 8000)
```
cd D:\gce-ai-tutor\gce_ai_tutor
.venv\Scripts\activate
```
 Handles auth, dashboard, topics

### TERMINAL 3 — React Frontend (port 5173)
```
cd D:\gce-ai-tutor\gce_ai_tutor\frontend
npm run dev
```
 Start LAST — depends on both backends being ready

---

## BROWSER
```
http://localhost:5173
```

---

## ONE-TIME — Ingest past papers (run once after adding new PDFs)
```
cd D:\gce-ai-tutor\gce_ai_tutor\inference_service
python ingestion/ingest_papers.py
```
- Reads all PDFs from data/papers/input_papers/chemistry/
- Extracts and structures questions using Groq AI
- Saves to data/papers/papers_index.json
- Safe to re-run — skips already processed papers
- Run again whenever you add new year folders

---

## ONE-TIME — Ingest syllabus (only if FAISS index is missing)
```
cd D:\gce-ai-tutor\gce_ai_tutor\inference_service
python ingestion/ingest.py
```

---

## PORT MAP
| Port | Service         | Handles                              |
|------|-----------------|--------------------------------------|
| 8001 | FastAPI         | /rag, /quiz, /papers, /health        |
| 8000 | Django          | /auth, /dashboard, /topics, /api     |
| 5173 | React (Vite)    | Frontend UI                          |

---

## ACTIVE FEATURES
- ✅ Socratic AI Tutor (turn-based, 3-phase dialogue)
- ✅ Practice Quizzes (AI-generated from syllabus, MCQ)
- ✅ Past Papers (2015–2025, MCQ + structured, AI-graded)
- ✅ Progress tracking (daily + weekly stats saved per student)
- ✅ Firebase authentication

---

## NOTES
- Use `python -m uvicorn` NOT `uvicorn` directly (Windows security policy blocks the .exe)
- GROQ_API_KEY is in inference_service/.env — NEVER commit this file
- FAISS index is in inference_service/data/index/
- Past papers index is in inference_service/data/papers/papers_index.json
- No Ollama needed — all AI runs via Groq cloud API (llama-3.1-8b-instant)
- Session IDs are generated per browser tab — each student gets isolated conversation memory
- Groq free tier limit: 6000 tokens/min — ingestion script uses 3s delay to avoid hitting it

---

## COMMON ERRORS AND FIXES

| Error | Fix |
|-------|-----|
| `uvicorn.exe blocked` | Use `python -m uvicorn` instead |
| `timeout of 120000ms exceeded` | Check FastAPI is on port 8001 not 8000 |
| `Cannot send a request, as the client has been closed` | Restart FastAPI — Groq client gets stale after long idle or ingestion run |
| `No papers ingested` | Run `python ingestion/ingest_papers.py` |
| `GROQ_API_KEY missing` | Check .env file exists in inference_service/ |
| `FAISS index not found` | Run `python ingestion/ingest.py` |