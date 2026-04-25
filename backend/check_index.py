"""
Quick diagnostic script to check topic index loading
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from qa_api.topic_registry import TOPIC_INDEX
from qa_api.topic_index import load_syllabus, build_topic_index
from pathlib import Path

print("="*60)
print("TOPIC INDEX DIAGNOSTIC")
print("="*60)

# Check registry
print(f"\n1. Registry Status:")
print(f"   TOPIC_INDEX loaded: {TOPIC_INDEX is not None}")
if TOPIC_INDEX:
    print(f"   Number of terms: {len(TOPIC_INDEX)}")
    print(f"\n   First 10 terms:")
    for i, (term, data) in enumerate(list(TOPIC_INDEX.items())[:10]):
        print(f"   - {term}: {data}")

# Load syllabus directly
print(f"\n2. Direct Syllabus Load:")
base = Path(__file__).parent
syllabus_path = base / "data" / "syllabus" / "chemistry_syllabus.json"
syllabus = load_syllabus(str(syllabus_path))
print(f"   Syllabus keys: {list(syllabus.keys())[:5]}")
print(f"   Total topics: {len(syllabus)}")

# Build index directly
print(f"\n3. Direct Index Build:")
index = build_topic_index(syllabus)
print(f"   Index size: {len(index)}")
print(f"\n   Sample entries:")
for i, (term, data) in enumerate(list(index.items())[:15]):
    print(f"   - '{term}': topics={data['topics']}, weight={data['weight']}")
