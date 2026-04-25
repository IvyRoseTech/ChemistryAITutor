from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .topic_detector import detect_topics

class AskView(APIView):
    def post(self, request):
        """
        Handle question submission with topic detection gating.
        """
        question = request.data.get("question")
        if not question:
            return Response(
                {"error": "Question field is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Use the deterministic topic detector
        result = detect_topics(question)
        
        # Return the detection result
        # Frontend will handle loader states based on status
        return Response(result)