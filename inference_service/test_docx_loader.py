
import os
import docx
from docx_loader import load_docx

# Create a dummy docx file
doc = docx.Document()
doc.add_paragraph("Hello world from docx")
doc.save("test.docx")

try:
    text = load_docx("test.docx")
    print(f"Loaded text: {text}")
    assert "Hello world from docx" in text
    print("Test passed!")
except Exception as e:
    print(f"Test failed: {e}")
finally:
    if os.path.exists("test.docx"):
        os.remove("test.docx")
