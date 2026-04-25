
import sys
import os

# Add the current directory to sys.path so we can import from local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from generation import generate_response

if __name__ == "__main__":
    print("--- Starting Manual Model Test ---")
    
    question = "What is an atom?"
    context = "An atom is the smallest unit of ordinary matter that forms a chemical element. Every solid, liquid, gas, and plasma is composed of neutral or ionized atoms. Atoms are extremely small, typically around 100 picometers across."
    
    print(f"\nQuestion: {question}")
    print(f"Context: {context[:50]}...")
    
    # Inspect the formatted prompt
    from generation import format_prompt
    formatted = format_prompt(question, context)
    print(f"\n--- Formatted Prompt ---\n{formatted}\n------------------------")
    
    try:
        print("\nGenerating response... (this may take a moment)")
        response = generate_response(question, context)
        print(f"\n--- Model Response ---\n{response}\n----------------------")
    except Exception as e:
        print(f"\nError during generation: {e}")
