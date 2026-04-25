import os
from google import genai
from google.genai import types

class GeminiModelWrapper:
    def __init__(self):
        """
        Gemini API model wrapper.
        Provides responses using Google's Gemini API to power the generative AI
        alongside the Mistral prompt system.
        """
        print("[+] Using Gemini API model wrapper")
        
        # Will look for GEMINI_API_KEY environment variable by default
        # If not set, it might raise an error when initializing the client.
        try:
            self.client = genai.Client()
            self.model_id = "gemini-1.5-flash" # Excellent balance of speed, cost, and intelligence
        except Exception as e:
            print(f"[-] Error initializing Gemini Client: {e}")
            print("Please ensure GEMINI_API_KEY environment variable is set.")
            self.client = None

    def generate(self, prompt, max_tokens=1000, temperature=0.7, stop=None, echo=False, stream=False):
        """
        Generate a response using Gemini API.
        We adapt the OpenAI/llama.cpp-style parameters to Gemini.
        """
        if not self.client:
            error_msg = "Error: Gemini client not initialized. Check GEMINI_API_KEY."
            if stream:
                def err_stream():
                    yield {"choices": [{"text": error_msg}]}
                return err_stream()
            return {"choices": [{"text": error_msg}]}

        try:
            config = types.GenerateContentConfig(
                max_output_tokens=max_tokens,
                temperature=temperature,
            )
            
            if stream:
                # Generate content stream
                response_stream = self.client.models.generate_content_stream(
                    model=self.model_id,
                    contents=prompt,
                    config=config
                )
                
                def stream_generator():
                    for chunk in response_stream:
                        yield {"choices": [{"text": chunk.text}]}
                return stream_generator()
            else:
                response = self.client.models.generate_content(
                    model=self.model_id,
                    contents=prompt,
                    config=config
                )
                return {
                    "choices": [
                        {
                            "text": response.text,
                            "finish_reason": "stop"
                        }
                    ]
                }
        except Exception as e:
            print(f"[-] Generation error: {e}")
            error_msg = f"Error generating response: {str(e)}"
            if stream:
                def err_stream():
                    yield {"choices": [{"text": error_msg}]}
                return err_stream()
            return {"choices": [{"text": error_msg}]}


_model_instance = None

def get_model():
    """Get the singleton model instance (Gemini version)"""
    global _model_instance
    if _model_instance is None:
        _model_instance = OllamaModelWrapper()
    return OllamaModelWrapper