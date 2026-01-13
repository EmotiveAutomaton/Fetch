import requests
import time

BASE_URL = "http://localhost:8000"

def test_public_chat():
    print("Testing Public Chat (Gemini)...")
    try:
        response = requests.post(f"{BASE_URL}/chat", json={"message": "Hello", "mode": "public"})
        if response.status_code == 200:
            data = response.json()
            print(f"SUCCESS: {data}")
            if "Gemini" in data['response'] or "gemini" in data['model_used']:
                return True
        else:
            print(f"FAILED: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")
    return False

def test_private_chat():
    print("Testing Private Chat (Ollama)...")
    try:
        response = requests.post(f"{BASE_URL}/chat", json={"message": "Hello", "mode": "private"})
        if response.status_code == 200:
            data = response.json()
            print(f"SUCCESS: {data}")
            if "deepseek-r1" in data['model_used']:
                return True
        else:
            print(f"FAILED: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")
    return False

if __name__ == "__main__":
    # Wait for server to potentially reload
    time.sleep(2)
    
    public_ok = test_public_chat()
    private_ok = test_private_chat()
    
    if public_ok and private_ok:
        print("\nALL TESTS PASSED")
    else:
        print("\nSOME TESTS FAILED")
