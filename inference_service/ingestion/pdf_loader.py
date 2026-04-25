"""
PDF document loader.
Extracts text content from PDF files for processing and indexing.
"""

import re
from typing import Optional
from pypdf import PdfReader


def load_pdf(pdf_path: str) -> str:
    """
    Extract text from all pages of a PDF file.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Combined text from all pages
        
    Raises:
        FileNotFoundError: If PDF file doesn't exist
        Exception: If PDF reading fails
    """
    try:
        reader = PdfReader(pdf_path)
        full_text = ""
        
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
        
        return full_text
    except FileNotFoundError:
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")


def clean_text(text: str) -> str:
    """
    Clean and normalize extracted PDF text.
    Removes page numbers, TOC entries, figure/table references, and normalizes whitespace.
    
    Args:
        text: Raw text extracted from PDF
        
    Returns:
        Cleaned and normalized text
    """
    if not text:
        return ""
    
    # Remove page numbers (standalone numbers on lines)
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
    
    # Remove TOC entries like "Chapter 1: Introduction .... 5"
    text = re.sub(r'(Chapter\s+\d+.*?\.+\s*\d+)', '', text)
    text = re.sub(r'(Section\s+\d+.*?\.+\s*\d+)', '', text)
    
    # Remove figure/table references
    text = re.sub(r'(Fig\.?\s*\d+(\.\d+)*)', '', text)
    text = re.sub(r'(Table\s*\d+(\.\d+)*)', '', text)
    
    # Normalize whitespace - collapse multiple newlines and spaces
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()
