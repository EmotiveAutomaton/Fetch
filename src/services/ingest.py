import os.path
import base64
import hashlib
from typing import List, Optional
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from sqlmodel import Session, select
from sentence_transformers import SentenceTransformer
import ollama
from ..models import Email, AiExclusion
from ..database import engine

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify']

def authenticate_gmail():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return build('gmail', 'v1', credentials=creds)

def get_body(payload):
    if 'parts' in payload:
        for part in payload['parts']:
            if part['mimeType'] == 'text/plain':
                return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
    elif 'body' in payload:
        return base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')
    return ""

def ingest_emails(query='is:unread', is_sent=False):
    service = authenticate_gmail()
    results = service.users().messages().list(userId='me', q=query).execute()
    messages = results.get('messages', [])

    # Initialize embedding model (768 dimensions)
    model = SentenceTransformer('all-mpnet-base-v2')

    with Session(engine) as session:
        for msg in messages:
            try:
                txt = service.users().messages().get(userId='me', id=msg['id']).execute()
                payload = txt['payload']
                headers = payload['headers']
                
                subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "No Subject")
                sender = next((h['value'] for h in headers if h['name'] == 'From'), "Unknown")
                body = get_body(payload)
                
                if not body:
                    print(f"Skipping empty body: {subject}")
                    continue

                body_hash = hashlib.sha256(body.encode('utf-8')).hexdigest()
                
                # Check for exclusion
                exclusion = session.exec(select(AiExclusion).where(AiExclusion.body_hash == body_hash)).first()
                if exclusion:
                    print(f"Skipping excluded content: {subject}")
                    continue

                # Check for duplicates
                existing = session.exec(select(Email).where(Email.body_hash == body_hash)).first()
                if existing:
                    print(f"Skipping duplicate: {subject}")
                    continue

                # Summarize using Ollama (Llama 3.1)
                try:
                    summary_response = ollama.chat(model='llama3.1', messages=[
                        {'role': 'system', 'content': "Summarize this email in one sentence."},
                        {'role': 'user', 'content': body[:2000]}, # Truncate for speed
                    ])
                    summary = summary_response['message']['content']
                except Exception as e:
                    print(f"Summarization failed: {e}")
                    summary = body[:100] + "..."

                embedding = model.encode(body).tolist()

                email = Email(
                    message_id=msg['id'],
                    body_hash=body_hash,
                    sender=sender,
                    subject=subject,
                    raw_body=body,
                    summary=summary,
                    embedding=embedding,
                    is_sent=is_sent
                )
                session.add(email)
                session.commit()
                print(f"Ingested ({'Sent' if is_sent else 'Received'}): {subject}")
            except Exception as e:
                session.rollback()
                print(f"Error processing message {msg['id']}: {e}")

def ingest_sent_emails():
    print("Ingesting sent emails...")
    ingest_emails(query='label:SENT', is_sent=True)

if __name__ == "__main__":
    print("Ingesting unread emails...")
    ingest_emails()
    ingest_sent_emails()
