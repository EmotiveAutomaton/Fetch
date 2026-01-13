import ollama
from ollama import Client

print("Testing with explicit host...")
client = Client(host='http://127.0.0.1:11434')

try:
    print("Listing models...")
    models = client.list()
    print(f"Models: {models}")
    
    print("Generating...")
    response = client.chat(model='deepseek-r1', messages=[{'role': 'user', 'content': 'hi'}])
    print(f"Response: {response['message']['content']}")
except Exception as e:
    print(f"Error: {e}")
