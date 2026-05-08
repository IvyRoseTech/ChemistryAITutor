GCE AI TUTOR — STARTUP GUIDE
==============================

FIRST TIME ONLY — Install inference service dependencies:
----------------------------------------------------------
cd D:\gce-ai-tutor\gce_ai_tutor\inference_service
python -m venv .venv
.venv\Scripts\activate
pip install fastapi uvicorn pydantic python-docx faiss-cpu sentence-transformers python-dotenv groq httpx


EVERY TIME — Start all 3 services in separate terminals:
---------------------------------------------------------

TERMINAL 1 — FastAPI AI Service (port 8001):
cd D:\gce-ai-tutor\gce_ai_tutor\inference_service
.venv\Scripts\activate
uvicorn main:app --reload --port 8001

TERMINAL 2 — Django Backend (port 8000):
cd D:\gce-ai-tutor\gce_ai_tutor
.venv\Scripts\activate
python backend/manage.py runserver

TERMINAL 3 — React Frontend (port 5173):
cd D:\gce-ai-tutor\gce_ai_tutor\frontend
npm run dev


BROWSER:
http://localhost:5173


NOTES:
- Start FastAPI FIRST (AI service must be ready before frontend loads)
- Start Django SECOND (handles auth and dashboard)
- Start Frontend THIRD
- GROQ_API_KEY is in inference_service/.env  (do NOT commit this file)
- FAISS index is in inference_service/data/index/
- No Ollama needed — AI runs via Groq cloud API
