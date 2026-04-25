from docx import Document
import os

def load_docx(file_path):
    """Load text from a .docx file."""
    file_path = os.path.normpath(file_path)  # normalize Windows path
    doc = Document(file_path)
    text = []
    for para in doc.paragraphs:
        if para.text.strip():
            text.append(para.text.strip())
    return "\n".join(text)


if __name__ == "__main__":
    # Get the directory of the current script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct absolute path to the document
    file_path = os.path.join(base_dir, "data", "docs", "GCE_A_Level_Chemistry_Syllabus_Cleaned_Structured.docx")
    
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
    else:
        # load text
        try:
            text = load_docx(file_path)
            print(f"Loaded {len(text.split())} words from the document")
        except Exception as e:
            print(f"Error loading document: {e}")


