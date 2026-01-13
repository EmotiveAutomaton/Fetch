import os
from dotenv import load_dotenv
import yaml
import json

load_dotenv(override=True)

class Config:
    # Gmail Settings
    GMAIL_CREDENTIALS_FILE = os.getenv('GMAIL_CREDENTIALS_FILE', 'credentials.json')
    GMAIL_TOKEN_FILE = os.getenv('GMAIL_TOKEN_FILE', 'token.json')
    GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.modify']

    # Ollama Settings
    OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama3')
    OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'http://localhost:11434')

    # Application Settings
    POLL_INTERVAL_SECONDS = int(os.getenv('POLL_INTERVAL_SECONDS', 60))
    STYLE_EXAMPLES_FILE = 'style_examples.json'

    @staticmethod
    def load_style_examples():
        try:
            with open(Config.STYLE_EXAMPLES_FILE, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return []
