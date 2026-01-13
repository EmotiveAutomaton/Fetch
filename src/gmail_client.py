import os.path
import base64
from email.message import EmailMessage
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from src.config import Config

class GmailClient:
    def __init__(self):
        self.creds = None
        self.service = None
        self.authenticate()

    def authenticate(self):
        """Shows basic usage of the Gmail API.
        Lists the user's Gmail labels.
        """
        if os.path.exists(Config.GMAIL_TOKEN_FILE):
            self.creds = Credentials.from_authorized_user_file(Config.GMAIL_TOKEN_FILE, Config.GMAIL_SCOPES)
        
        # If there are no (valid) credentials available, let the user log in.
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    Config.GMAIL_CREDENTIALS_FILE, Config.GMAIL_SCOPES)
                self.creds = flow.run_local_server(port=0)
            
            # Save the credentials for the next run
            with open(Config.GMAIL_TOKEN_FILE, 'w') as token:
                token.write(self.creds.to_json())

        try:
            self.service = build('gmail', 'v1', credentials=self.creds)
        except HttpError as error:
            print(f'An error occurred: {error}')

    def list_unread_emails(self, max_results=10):
        """Lists unread emails from the inbox."""
        try:
            results = self.service.users().messages().list(userId='me', q='is:unread', maxResults=max_results).execute()
            messages = results.get('messages', [])
            
            email_data = []
            if not messages:
                print('No new messages.')
            else:
                for message in messages:
                    msg = self.service.users().messages().get(userId='me', id=message['id']).execute()
                    email_data.append(msg)
            return email_data

        except HttpError as error:
            print(f'An error occurred: {error}')
            return []

    def create_draft(self, to, subject, body, thread_id=None):
        """Create and insert a draft email.
           Print the returned draft's message and id.
        """
        try:
            message = EmailMessage()
            message.set_content(body)
            message['To'] = to
            message['Subject'] = subject

            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            create_message = {
                'message': {
                    'raw': encoded_message
                }
            }
            
            if thread_id:
                create_message['message']['threadId'] = thread_id

            draft = self.service.users().drafts().create(userId='me', body=create_message).execute()
            print(f'Draft id: {draft["id"]}\nDraft message: {draft["message"]}')
            return draft

        except HttpError as error:
            print(f'An error occurred: {error}')
            return None

    def send_email(self, to, subject, body, thread_id=None):
        """Send an email immediately."""
        try:
            message = EmailMessage()
            message.set_content(body)
            message['To'] = to
            message['Subject'] = subject

            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            create_message = {
                'raw': encoded_message
            }
            
            if thread_id:
                create_message['threadId'] = thread_id

            sent_message = self.service.users().messages().send(userId='me', body=create_message).execute()
            print(f'Message Id: {sent_message["id"]}')
            return sent_message

        except HttpError as error:
            print(f'An error occurred: {error}')
            return None
