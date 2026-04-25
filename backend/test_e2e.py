"""
End-to-End Testing Script for Topic Detection System
Tests backend API, edge cases, and response handling
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import RequestFactory
from qa_api.views import AskView
import json

def print_test_header(test_name):
    print("\n" + "="*60)
    print(f"TEST: {test_name}")
    print("="*60)

def print_result(passed, message=""):
    status = "[PASS]" if passed else "[FAIL]"
    print(f"{status} {message}")

def test_backend_api():
    """Test backend API endpoint directly"""
    print_test_header("Backend API Validation")
    
    rf = RequestFactory()
    ask_view = AskView.as_view()
    
    # Test 1: In-syllabus question
    print("\n1. Testing in-syllabus question...")
    request = rf.post(
        '/api/qa_api/ask/',
        data=json.dumps({'question': 'Define the mole concept'}),
        content_type='application/json'
    )
    response = ask_view(request)
    
    print(f"   Status Code: {response.status_code}")
    print(f"   Response: {json.dumps(response.data, indent=2)}")
    
    passed = (
        response.status_code == 200 and
        response.data.get('status') in ['matched', 'ambiguous']
    )
    print_result(passed, "In-syllabus question handled correctly")
    
    # Test 2: Out-of-syllabus question
    print("\n2. Testing out-of-syllabus question...")
    request = rf.post(
        '/api/qa_api/ask/',
        data=json.dumps({'question': 'What is quantum gravity?'}),
        content_type='application/json'
    )
    response = ask_view(request)
    
    print(f"   Status Code: {response.status_code}")
    print(f"   Response: {json.dumps(response.data, indent=2)}")
    
    passed = (
        response.status_code == 200 and
        response.data.get('status') == 'out_of_syllabus'
    )
    print_result(passed, "Out-of-syllabus question rejected correctly")
    
    # Test 3: Ambiguous question
    print("\n3. Testing ambiguous question...")
    request = rf.post(
        '/api/qa_api/ask/',
        data=json.dumps({'question': 'Explain equilibrium'}),
        content_type='application/json'
    )
    response = ask_view(request)
    
    print(f"   Status Code: {response.status_code}")
    print(f"   Response: {json.dumps(response.data, indent=2)}")
    
    has_multiple_topics = len(response.data.get('matched_topics', [])) > 1
    print_result(
        response.status_code == 200,
        f"Ambiguous question handled (topics: {len(response.data.get('matched_topics', []))})"
    )

def test_edge_cases():
    """Test edge cases and error handling"""
    print_test_header("Edge Case Testing")
    
    rf = RequestFactory()
    ask_view = AskView.as_view()
    
    # Test 1: Empty question
    print("\n1. Testing empty question...")
    request = rf.post(
        '/api/qa_api/ask/',
        data=json.dumps({'question': ''}),
        content_type='application/json'
    )
    response = ask_view(request)
    
    print(f"   Status Code: {response.status_code}")
    print(f"   Response: {json.dumps(response.data, indent=2)}")
    
    passed = response.data.get('status') == 'out_of_syllabus'
    print_result(passed, "Empty question handled gracefully")
    
    # Test 2: Missing question field
    print("\n2. Testing missing question field...")
    request = rf.post(
        '/api/qa_api/ask/',
        data=json.dumps({}),
        content_type='application/json'
    )
    response = ask_view(request)
    
    print(f"   Status Code: {response.status_code}")
    print(f"   Response: {json.dumps(response.data, indent=2)}")
    
    passed = response.status_code == 400
    print_result(passed, "Missing field returns 400 error")
    
    # Test 3: Very long question
    print("\n3. Testing very long question...")
    long_question = "What is the mole concept? " * 50
    request = rf.post(
        '/api/qa_api/ask/',
        data=json.dumps({'question': long_question}),
        content_type='application/json'
    )
    response = ask_view(request)
    
    print(f"   Status Code: {response.status_code}")
    print(f"   Response Status: {response.data.get('status')}")
    
    passed = response.status_code == 200
    print_result(passed, "Long question processed without error")
    
    # Test 4: Special characters
    print("\n4. Testing special characters...")
    request = rf.post(
        '/api/qa_api/ask/',
        data=json.dumps({'question': 'What is H₂SO₄ and its properties?'}),
        content_type='application/json'
    )
    response = ask_view(request)
    
    print(f"   Status Code: {response.status_code}")
    print(f"   Response Status: {response.data.get('status')}")
    
    passed = response.status_code == 200
    print_result(passed, "Special characters handled correctly")
    
    # Test 5: Only stopwords
    print("\n5. Testing question with only stopwords...")
    request = rf.post(
        '/api/qa_api/ask/',
        data=json.dumps({'question': 'the and or but'}),
        content_type='application/json'
    )
    response = ask_view(request)
    
    print(f"   Status Code: {response.status_code}")
    print(f"   Response Status: {response.data.get('status')}")
    
    passed = response.data.get('status') == 'out_of_syllabus'
    print_result(passed, "Stopwords-only question rejected")

def test_response_schema():
    """Verify response schema matches specification"""
    print_test_header("Response Schema Validation")
    
    rf = RequestFactory()
    ask_view = AskView.as_view()
    
    request = rf.post(
        '/api/qa_api/ask/',
        data=json.dumps({'question': 'What is stoichiometry?'}),
        content_type='application/json'
    )
    response = ask_view(request)
    
    print("\nValidating response schema...")
    data = response.data
    
    # Check required fields
    required_fields = ['status', 'primary_topic', 'matched_topics', 'explanation']
    all_present = all(field in data for field in required_fields)
    print_result(all_present, f"All required fields present: {required_fields}")
    
    # Check status values
    valid_status = data.get('status') in ['matched', 'ambiguous', 'out_of_syllabus']
    print_result(valid_status, f"Status is valid: {data.get('status')}")
    
    # Check matched_topics structure
    topics = data.get('matched_topics', [])
    if topics:
        topic_valid = all('topic' in t and 'confidence' in t for t in topics)
        print_result(topic_valid, f"Topic structure valid (count: {len(topics)})")
    
    # Check explanation is string
    explanation_valid = isinstance(data.get('explanation'), str)
    print_result(explanation_valid, "Explanation is string")

def test_performance():
    """Test response time and performance"""
    print_test_header("Performance Testing")
    
    import time
    
    rf = RequestFactory()
    ask_view = AskView.as_view()
    
    questions = [
        'What is the mole concept?',
        'Explain chemical equilibrium',
        'What is photosynthesis?',
        'Define oxidation and reduction',
        'What are ionic compounds?'
    ]
    
    print("\nTesting response times for 5 questions...")
    times = []
    
    for i, question in enumerate(questions, 1):
        request = rf.post(
            '/api/qa_api/ask/',
            data=json.dumps({'question': question}),
            content_type='application/json'
        )
        
        start = time.time()
        response = ask_view(request)
        elapsed = (time.time() - start) * 1000  # Convert to ms
        times.append(elapsed)
        
        print(f"   Question {i}: {elapsed:.2f}ms")
    
    avg_time = sum(times) / len(times)
    max_time = max(times)
    
    print(f"\n   Average: {avg_time:.2f}ms")
    print(f"   Maximum: {max_time:.2f}ms")
    
    passed = avg_time < 100  # Should be under 100ms
    print_result(passed, f"Average response time acceptable (<100ms)")

def main():
    print("\n" + "="*60)
    print("TOPIC DETECTION SYSTEM - END-TO-END TEST SUITE")
    print("="*60)
    
    try:
        test_backend_api()
        test_edge_cases()
        test_response_schema()
        test_performance()
        
        print("\n" + "="*60)
        print("ALL TESTS COMPLETED")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n[ERROR] Test suite failed with exception: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
