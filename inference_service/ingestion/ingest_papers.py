"""
Past Papers Ingestion Pipeline
Reads all GCE Chemistry PDFs, uses Groq to extract and structure questions,
saves everything to data/papers/papers_index.json
Run once: python ingestion/ingest_papers.py
"""

import os
import sys
import json
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.resolve()))

from pypdf import PdfReader
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────
PAPERS_INPUT_DIR = Path("data/papers/input_papers/chemistry")
PAPERS_OUTPUT_FILE = Path("data/papers/papers_index.json")
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ─────────────────────────────────────────
# EXTRACTION PROMPT
# ─────────────────────────────────────────
MCQ_PROMPT = """You are a GCE A-Level Chemistry exam parser.

Extract ALL multiple choice questions from the exam text below.

For each question return:
- question_number: the number on the paper
- question: the full question text
- options: list of exactly 4 options (without A/B/C/D labels)
- topic: the chemistry topic this question covers

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {{
    "question_number": 1,
    "question": "Full question text here?",
    "options": ["Option text", "Option text", "Option text", "Option text"],
    "topic": "Topic name"
  }}
]

If no multiple choice questions are found, return: []

EXAM TEXT:
{text}"""

STRUCTURED_PROMPT = """You are a GCE A-Level Chemistry exam parser.

Extract ALL structured/essay questions from the exam text below.
These are questions that require written answers, not multiple choice.

For each question return:
- question_number: the number on the paper  
- question: the full question text including all sub-parts (a, b, c etc)
- marks: total marks if visible (default 0 if not found)
- topic: the chemistry topic this question covers

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {{
    "question_number": 1,
    "question": "Full question text with all sub-parts here.",
    "marks": 10,
    "topic": "Topic name"
  }}
]

If no structured questions are found, return: []

EXAM TEXT:
{text}"""


# ─────────────────────────────────────────
# EXTRACT TEXT FROM PDF
# ─────────────────────────────────────────
def extract_pdf_text(pdf_path: Path) -> str:
    try:
        reader = PdfReader(str(pdf_path))
        full_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
        return full_text.strip()
    except Exception as e:
        print(f"    ❌ Failed to read {pdf_path.name}: {e}")
        return ""


# ─────────────────────────────────────────
# DETECT PAPER TYPE FROM FILENAME
# ─────────────────────────────────────────
def detect_paper_number(filename: str) -> int:
    filename_lower = filename.lower()
    if filename_lower.endswith("-2.pdf") or "-chemistry-2" in filename_lower:
        return 2
    return 1


# ─────────────────────────────────────────
# CALL GROQ TO EXTRACT QUESTIONS
# ─────────────────────────────────────────
def extract_questions_with_groq(
    text: str,
    year: int,
    paper: int,
    question_type: str
) -> list:
    """
    Sends PDF text to Groq and gets back structured questions.
    question_type: 'mcq' or 'structured'
    """
    if not text or len(text) < 100:
        return []

    # Truncate to avoid token limits — take first 6000 chars
    text_chunk = text[:6000]

    prompt = MCQ_PROMPT if question_type == "mcq" else STRUCTURED_PROMPT

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": prompt.format(text=text_chunk)
                }
            ],
            temperature=0.1,  # low temp for consistent extraction
            max_tokens=3000
        )

        raw = response.choices[0].message.content.strip()

        # Strip markdown fences
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        questions = json.loads(raw)

        # Enrich with metadata
        enriched = []
        for i, q in enumerate(questions):
            if not q.get("question"):
                continue
            entry = {
                "id": f"{year}_p{paper}_{question_type}_{i+1}",
                "year": year,
                "paper": paper,
                "type": question_type,
                "question_number": q.get("question_number", i + 1),
                "question": q["question"].strip(),
                "topic": q.get("topic", "GCE Chemistry"),
            }
            if question_type == "mcq":
                opts = q.get("options", [])
                if len(opts) == 4:
                    entry["options"] = opts
                    entry["correct_index"] = None  # No marking scheme yet
                else:
                    continue  # skip malformed MCQ
            else:
                entry["marks"] = q.get("marks", 0)
                entry["model_answer"] = None  # Generated on demand by AI

            enriched.append(entry)

        return enriched

    except json.JSONDecodeError:
        print(f"    ⚠️  JSON parse failed for {year} Paper {paper} ({question_type})")
        return []
    except Exception as e:
        print(f"    ❌ Groq error for {year} Paper {paper}: {e}")
        return []


# ─────────────────────────────────────────
# MAIN INGESTION PIPELINE
# ─────────────────────────────────────────
def ingest_all_papers():
    print("\n📄 Starting Past Papers Ingestion Pipeline...")
    print("─" * 55)

    if not PAPERS_INPUT_DIR.exists():
        print(f"❌ Input directory not found: {PAPERS_INPUT_DIR}")
        return

    # Load existing index if it exists (to resume interrupted runs)
    existing_index = {}
    if PAPERS_OUTPUT_FILE.exists():
        with open(PAPERS_OUTPUT_FILE, "r") as f:
            existing_data = json.load(f)
            for entry in existing_data.get("papers", []):
                key = f"{entry['year']}_p{entry['paper']}"
                existing_index[key] = True
        print(f"📂 Found existing index with {len(existing_index)} papers — skipping those")

    all_papers = []
    year_dirs = sorted(PAPERS_INPUT_DIR.iterdir())

    for year_dir in year_dirs:
        if not year_dir.is_dir():
            continue

        year = int(year_dir.name)
        pdf_files = sorted(year_dir.glob("*.pdf"))

        if not pdf_files:
            print(f"  ⚠️  No PDFs found in {year_dir.name}/")
            continue

        for pdf_file in pdf_files:
            paper_num = detect_paper_number(pdf_file.name)
            key = f"{year}_p{paper_num}"

            if key in existing_index:
                print(f"  ⏭️  Skipping {year} Paper {paper_num} (already indexed)")
                continue

            print(f"\n  📖 Processing {year} Paper {paper_num}: {pdf_file.name}")

            # Extract raw text
            text = extract_pdf_text(pdf_file)
            if not text:
                print(f"    ⚠️  Empty text extracted — skipping")
                continue

            print(f"    ✅ Extracted {len(text)} characters")

            # Extract MCQ questions
            print(f"    🔍 Extracting MCQ questions...")
            mcq_questions = extract_questions_with_groq(text, year, paper_num, "mcq")
            print(f"    ✅ Found {len(mcq_questions)} MCQ questions")
            time.sleep(1)  # rate limit buffer

            # Extract structured questions
            print(f"    🔍 Extracting structured questions...")
            structured_questions = extract_questions_with_groq(text, year, paper_num, "structured")
            print(f"    ✅ Found {len(structured_questions)} structured questions")
            time.sleep(1)  # rate limit buffer

            all_papers.append({
                "year": year,
                "paper": paper_num,
                "filename": pdf_file.name,
                "total_mcq": len(mcq_questions),
                "total_structured": len(structured_questions),
                "mcq_questions": mcq_questions,
                "structured_questions": structured_questions
            })

            # Save after each paper in case of interruption
            _save_index(all_papers)
            print(f"    💾 Saved progress")

    print("\n─" * 55)
    print(f"✅ Ingestion complete!")
    print(f"   Papers processed: {len(all_papers)}")
    total_q = sum(p["total_mcq"] + p["total_structured"] for p in all_papers)
    print(f"   Total questions extracted: {total_q}")
    print(f"   Output: {PAPERS_OUTPUT_FILE}")


def _save_index(papers: list):
    PAPERS_OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    # Build year summary
    years = {}
    for p in papers:
        yr = str(p["year"])
        if yr not in years:
            years[yr] = {"papers": [], "total_questions": 0}
        years[yr]["papers"].append(p["paper"])
        years[yr]["total_questions"] += p["total_mcq"] + p["total_structured"]

    index = {
        "subject": "GCE A-Level Chemistry",
        "years_available": sorted(years.keys(), reverse=True),
        "year_summary": years,
        "papers": papers
    }

    with open(PAPERS_OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    ingest_all_papers()
