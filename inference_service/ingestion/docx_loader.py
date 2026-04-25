"""
DOCX document loader.
Extracts and cleans text content from DOCX files for processing and indexing.
"""

import re
import docx
from typing import Optional

def load_docx(docx_path: str) -> str:
    """
    Extract text from a DOCX file.
    
    Args:
        docx_path: Path to the DOCX file
        
    Returns:
        Combined text from all paragraphs
        
    Raises:
        FileNotFoundError: If DOCX file doesn't exist
        Exception: If DOCX reading fails
    """
    try:
        doc = docx.Document(docx_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return '\n'.join(full_text)
    except Exception as e:
        raise Exception(f"Error reading DOCX: {str(e)}")

def clean_text_advanced(text: str) -> str:
    """
    Clean and normalize extracted text using advanced regex patterns.
    Removes page numbers, TOC entries, figure/table references, and normalizes whitespace.
    
    Args:
        text: Raw text extracted from document
        
    Returns:
        Cleaned and normalized text
    """
    # Remove page numbers
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
    
    # Remove TOC entries like "Chapter 1: Introduction .... 5"
    text = re.sub(r'(Chapter\s+\d+.*?\.+\s*\d+)', '', text)
    text = re.sub(r'(Section\s+\d+.*?\.+\s*\d+)', '', text)
    
    # Remove figure/table references
    text = re.sub(r'(Fig\.?\s*\d+(\.\d+)*)', '', text)
    text = re.sub(r'(Table\s*\d+(\.\d+)*)', '', text)
    
    # Normalize whitespace
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()
