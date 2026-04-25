import sys
import os
import unittest
from unittest.mock import MagicMock, patch

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from generation import format_prompt, generate_response, generate_response_stream
import model_loader

class TestGeneration(unittest.TestCase):
    def test_format_prompt(self):
        question = "What is an atom?"
        context = "An atom is the basic unit of a chemical element."
        expected = "<s>[INST] You are an expert Chemistry tutor for GCE O-Level students. \nAnswer the question based ONLY on the provided context. \nIf the context does not contain the answer, say \"I cannot answer this based on the provided notes.\"\nDo not halluncinate instructions or facts not present in the context.\nKeep your answer concise and easy to understand.\n\nContext:\nAn atom is the basic unit of a chemical element.\n\nQuestion: What is an atom? [/INST]"
        
        formatted = format_prompt(question, context)
        self.assertEqual(formatted, expected)

    @patch('generation.get_model')
    def test_generate_response_dummy(self, mock_get_model):
        # Mock the model instance
        mock_model = MagicMock()
        mock_model.generate.return_value = {"choices": [{"text": "Generated Answer"}]}
        mock_get_model.return_value = mock_model
        
        response = generate_response("Question", "Context")
        self.assertEqual(response, "Generated Answer")
        
    @patch('generation.get_model')
    def test_generate_response_stream(self, mock_get_model):
        # Mock the model instance
        mock_model = MagicMock()
        mock_model.generate.return_value = iter([
            {"choices": [{"text": "Gen"}]},
            {"choices": [{"text": "erated"}]}
        ])
        mock_get_model.return_value = mock_model
        
        stream = generate_response_stream("Question", "Context")
        chunks = list(stream)
        self.assertEqual(chunks, ["Gen", "erated"])

if __name__ == '__main__':
    unittest.main()
