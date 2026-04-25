# from inference_client.client import generate_answer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from inference_client.client import generate_answer


@csrf_exempt
def ask_question(request):
    """
    Receives a question from frontend
    Sends it to FastAPI RAG service
    Returns generated answer
    """

    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=405)

    try:
        body = json.loads(request.body)
        question = body.get("question")

        if not question:
            return JsonResponse({"error": "Question is required"}, status=400)

        # Call FastAPI RAG service
        rag_response = generate_answer(question)

        return JsonResponse(rag_response)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
