import os
import sys
import django
from pathlib import Path

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings') # Assuming 'core' is the project name, check manage.py if unsure.
# Wait, list_dir showed 'core' directory, so this is likely correct.
django.setup()

from qa_api.topic_detection import load_syllabus, detect_topic

def run_verification():
    print("Loading syllabus...")
    try:
        syllabus = load_syllabus()
        print("Syllabus loaded successfully.")
    except Exception as e:
        print(f"Failed to load syllabus: {e}")
        return

    test_cases = [
        "How do isotopes affect atomic mass?",
        "Explain the mole concept",
        "What is simple harmonic motion?", # Physics, should be out
        "Discuss the structure of the atom",
        "Define ionic bonding"
    ]

    print("\nRunning Test Cases:")
    for question in test_cases:
        result = detect_topic(question, syllabus)
        print(f"\nQ: {question}")
        print(f"In Syllabus: {result['is_in_syllabus']}")
        if result['is_in_syllabus']:
            print(f"Topic: {result['topic']}")
            print(f"Subtopic: {result['subtopic']}")
        print(f"Confidence: {result['confidence']}")

if __name__ == "__main__":
    run_verification()
