import ollama
from src.config import Config

class OllamaClient:
    def __init__(self):
        self.model = Config.OLLAMA_MODEL
        self.client = ollama.Client(host=Config.OLLAMA_HOST)

    def generate_response(self, email_content, style_examples):
        """
        Generates a response using Ollama based on the email content and style examples.
        """
        
        prompt = self._construct_prompt(email_content, style_examples)
        
        try:
            response = self.client.chat(model=self.model, messages=[
                {
                    'role': 'user',
                    'content': prompt,
                },
            ])
            return response.message.content
        except Exception as e:
            print(f"Error generating response from Ollama: {e}")
            return None

    def _construct_prompt(self, email_content, style_examples):
        """
        Constructs the prompt with few-shot examples.
        """
        prompt = "You are a helpful assistant drafting email responses for a therapist. "
        prompt += "Your goal is to draft a professional, warm, and concise response in the style of the provided examples. "
        prompt += "Do not include any placeholders like [Your Name] unless absolutely necessary. "
        prompt += "Maintain strict medical confidentiality. Do not reveal patient details if not already present.\n\n"
        
        prompt += "Here are some examples of how I write:\n\n"
        
        for example in style_examples:
            prompt += f"Input Email: {example.get('body', '')}\n"
            prompt += f"My Response: {example.get('response', '')}\n\n"
            
        prompt += "Now, please draft a response for the following email:\n"
        prompt += f"Subject: {email_content.get('subject', 'No Subject')}\n"
        prompt += f"Body: {email_content.get('body', '')}\n\n"
        prompt += "Draft Response:"
        
        return prompt
