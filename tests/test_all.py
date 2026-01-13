import unittest
from unittest.mock import MagicMock, patch
from src.ollama_client import OllamaClient
from src.gmail_client import GmailClient

class TestOllamaClient(unittest.TestCase):
    def test_construct_prompt(self):
        client = OllamaClient()
        email_content = {'subject': 'Test Subject', 'body': 'Test Body'}
        style_examples = [{'body': 'Ex Body', 'response': 'Ex Response'}]
        
        prompt = client._construct_prompt(email_content, style_examples)
        
        self.assertIn("Test Subject", prompt)
        self.assertIn("Test Body", prompt)
        self.assertIn("Ex Body", prompt)
        self.assertIn("Ex Response", prompt)
        self.assertIn("Draft Response:", prompt)

class TestGmailClient(unittest.TestCase):
    @patch('src.gmail_client.build')
    @patch('src.gmail_client.Credentials')
    @patch('os.path.exists')
    def test_list_unread_emails(self, mock_exists, mock_creds, mock_build):
        # Setup mocks
        mock_exists.return_value = True # Token file exists
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        
        # Mock response for list
        mock_service.users().messages().list().execute.return_value = {
            'messages': [{'id': '123'}]
        }
        # Mock response for get
        mock_service.users().messages().get().execute.return_value = {
            'id': '123',
            'snippet': 'Test Snippet',
            'payload': {'headers': [{'name': 'Subject', 'value': 'Test Subject'}]}
        }

        client = GmailClient()
        # Override authenticate for test if needed, but mocking build/creds handles it mostly
        # We might need to mock the authenticate method itself if it does complex flow logic
        
        emails = client.list_unread_emails()
        self.assertEqual(len(emails), 1)
        self.assertEqual(emails[0]['snippet'], 'Test Snippet')

if __name__ == '__main__':
    unittest.main()
