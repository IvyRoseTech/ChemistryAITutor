import os
import sys
import django
from pathlib import Path
import json

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings') 
django.setup()

from qa_api.topic_detection import load_syllabus, detect_topics

def run_verification():
    print("Loading syllabus...")
    try:
        syllabus = load_syllabus()
        print(f"Syllabus loaded with {len(syllabus)} topics.")
    except Exception as e:
        print(f"Failed to load syllabus: {e}")
        return

    test_cases = [
        "Explain the mole concept", # Expect Clear match
        "Explain equilibrium in reactions", # Expect Ambiguous (Chemical vs Ionic vs Reaction Kinetics)
        "What is photosynthesis?", # Expect Out of syllabus
        "Discuss chemical equations", # Expect Clear match
        "Calculate the relative atomic mass of chlorine" # Expect Clear match
    ]

    print("\nRunning Test Cases:")
    for question in test_cases:
        print(f"\nQ: {question}")
        result = detect_topics(question, syllabus)
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    run_verification()
