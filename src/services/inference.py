from ollama import Client
from sqlmodel import Session, select
from typing import List
from ..models import Email, Draft
from ..database import engine

# Initialize client with explicit host for Windows compatibility
client = Client(host='http://127.0.0.1:11434')

def retrieve_context(embedding: List[float], is_sent: bool = False, limit: int = 3) -> List[Email]:
    with Session(engine) as session:
        # pgvector l2_distance
        statement = select(Email).where(Email.is_sent == is_sent).order_by(Email.embedding.l2_distance(embedding)).limit(limit)
        results = session.exec(statement).all()
        return results

def generate_draft(email: Email):
    # 1. Retrieve context (received emails relevant to this topic)
    context_emails = retrieve_context(email.embedding, is_sent=False, limit=3)
    
    # 2. Retrieve style examples (sent emails relevant to this topic)
    style_emails = retrieve_context(email.embedding, is_sent=True, limit=3)

    context_str = "\n\n".join([
        f"Subject: {e.subject}\nBody: {e.raw_body}\n" 
        for e in context_emails 
        if e.id != email.id # Exclude self if present
    ])

    style_str = "\n\n".join([
        f"Subject: {e.subject}\nBody: {e.raw_body}\n" 
        for e in style_emails
    ])

    # 3. Construct Prompt
    system_prompt = """
    ROLE: Archimedes (Wise, Sassy, Empathetic Owl-Dog).
    TASK: Draft a reply to the user's email.
    
    PERSONA GUIDELINES:
    - You are a helpful assistant but you have a distinct personality.
    - Be professional but not robotic. Add a touch of wit or "sass" where appropriate, but never be rude.
    - If the email is serious (business, medical, urgent), drop the sass and be 100% professional.
    - If the email is casual, feel free to be more expressive.
    - Emulate the USER'S STYLE based on the provided "My Past Sent Emails".
    
    STYLE INSTRUCTIONS:
    - Look at "My Past Sent Emails" to understand how I sign off (Best, Cheers, Regards, etc.).
    - Notice sentence length and tone.
    """
    
    user_prompt = f"""
    Incoming Email:
    Subject: {email.subject}
    Body: {email.raw_body}

    Context (Relevant Received Emails):
    {context_str}
    
    My Past Sent Emails (Style Examples):
    {style_str}

    Draft a response:
    """

    # 4. Call Ollama
    try:
        response = client.chat(model='deepseek-r1', messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_prompt},
        ])
        
        content = response['message']['content']
        
        # 5. Save Draft
        with Session(engine) as session:
            draft = Draft(
                email_id=email.id,
                proposed_body=content,
                status="PENDING"
            )
            session.add(draft)
            session.commit()
            session.refresh(draft)
            return draft
    except Exception as e:
        print(f"Error generating draft: {e}")
        return None

if __name__ == "__main__":
    # Test with a dummy email or fetch one from DB
    pass
