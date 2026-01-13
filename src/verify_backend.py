import requests
import json

BASE_URL = "http://localhost:8000"

def test_chat(mode):
    print(f"Testing chat with mode: {mode}")
    try:
        response = requests.post(f"{BASE_URL}/chat", json={"message": "Hello", "mode": mode})
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Response: {data}")
            return True
        else:
            print(f"Failed. Status: {response.status_code}, Detail: {response.text}")
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

if __name__ == "__main__":
    print("Verifying Backend...")
    # Test Public (Gemini) - might fail if no API key, but should return 500 or specific error
    test_chat("public")
    
    # Test Private (DeepSeek) - requires Ollama running
    test_chat("private")
