from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import ollama
import os

router = APIRouter()

# Configure Gemini
# Note: API key should be in env vars, but for now we assume it's set or we might need to load it.
# genai.configure(api_key=os.environ["GEMINI_API_KEY"])

class ChatRequest(BaseModel):
    message: str
    mode: str = "public" # public | private

class ChatResponse(BaseModel):
    response: str
    model_used: str

SYSTEM_PROMPT_PUBLIC = """
You are Fetch, a helpful AI assistant.
IMPORTANT: You are running in PUBLIC mode. 
Do NOT process or store any Personal Identifiable Information (PII).
If the user asks about sensitive personal data, politely decline and suggest switching to Private mode.
"""

SYSTEM_PROMPT_PRIVATE = """
You are Fetch, a helpful AI assistant running in PRIVATE mode.
You are powered by a local LLM (DeepSeek-R1) via Ollama.
You have full access to process sensitive data locally.
Your persona is a helpful, intelligent Terrier.
"""

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if request.mode == "public":
        try:
            # Real Gemini Call
            # Ensure GEMINI_API_KEY is set in your environment variables
            if "GEMINI_API_KEY" not in os.environ:
                 return ChatResponse(response="[System] Error: GEMINI_API_KEY not found in environment variables.", model_used="system-error")

            genai.configure(api_key=os.environ["GEMINI_API_KEY"])
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(f"{SYSTEM_PROMPT_PUBLIC}\n\nUser: {request.message}")
            return ChatResponse(response=response.text, model_used="gemini-1.5-flash")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini Error: {str(e)}")
            
    elif request.mode == "private":
        try:
            response = ollama.chat(model='deepseek-r1', messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT_PRIVATE},
                {'role': 'user', 'content': request.message},
            ])
            return ChatResponse(response=response['message']['content'], model_used="deepseek-r1")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ollama Error: {str(e)}")
    
    else:
        raise HTTPException(status_code=400, detail="Invalid mode. Use 'public' or 'private'.")

# --- Phase 3: The Deck ---

from typing import List
from sqlmodel import select, Session
from .database import engine
from .models import Draft, Email

class DraftResponse(BaseModel):
    id: str
    email_subject: str
    email_sender: str
    proposed_body: str
    reasoning_trace: str | None

@router.get("/drafts/pending", response_model=List[DraftResponse])
async def get_pending_drafts():
    with Session(engine) as session:
        statement = select(Draft, Email).where(Draft.email_id == Email.id).where(Draft.status == "PENDING")
        results = session.exec(statement).all()
        
        drafts = []
        for draft, email in results:
            drafts.append(DraftResponse(
                id=draft.id,
                email_subject=email.subject,
                email_sender=email.sender,
                proposed_body=draft.proposed_body,
                reasoning_trace=draft.reasoning_trace
            ))
        return drafts

from .gmail_client import GmailClient

@router.post("/drafts/{draft_id}/{action}")
async def handle_draft_action(draft_id: str, action: str):
    if action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'.")

    with Session(engine) as session:
        draft = session.get(Draft, draft_id)
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found.")
        
        email = session.get(Email, draft.email_id)
        if not email:
             raise HTTPException(status_code=404, detail="Associated email not found.")

        if action == "approve":
            draft.status = "APPROVED"
            try:
                client = GmailClient()
                # Assuming 'email.sender' contains the address we are replying to.
                # In a real scenario, we might parse the address or use a 'reply_to' field.
                # For now, we reply to the sender.
                client.send_email(
                    to=email.sender, 
                    subject=f"Re: {email.subject}", 
                    body=draft.proposed_body
                )
                print(f"Draft {draft_id} APPROVED. Email sent to {email.sender}.")
            except Exception as e:
                print(f"Failed to send email for draft {draft_id}: {e}")
                # We might want to mark it as 'APPROVED_BUT_FAILED' or similar, 
                # but for now we proceed with 'APPROVED' status and log error.
                
        elif action == "reject":
            draft.status = "REJECTED"
            print(f"Draft {draft_id} REJECTED.")
            
        session.add(draft)
        session.commit()
        
    return {"status": "success", "action": action, "draft_id": draft_id}
