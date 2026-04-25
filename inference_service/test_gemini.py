from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
print(f"Groq API Key found: {'Yes' if api_key else 'No'}")

client = Groq(api_key=api_key)

print("\nTesting Groq AI...")
print("─" * 40)

response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {
            "role": "system",
            "content": "You are a GCE Chemistry tutor."
        },
        {
            "role": "user", 
            "content": "Say exactly: GCE Chemistry AI is ready!"
        }
    ],
    temperature=0.1,
    max_tokens=100
)

print(f"✅ Response: {response.choices[0].message.content}")
print("─" * 40)
print("\nGroq is working! Ready to build! 🚀")