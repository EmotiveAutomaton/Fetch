from src.database import create_db_and_tables, engine
from src.services.ingest import ingest_emails
from src.services.inference import generate_draft
from src.models import Email
from sqlmodel import Session, select

def main():
    print("1. Creating Tables...")
    try:
        create_db_and_tables()
        print("Tables created.")
    except Exception as e:
        print(f"Database connection failed: {e}")
        return

    print("2. Ingesting Emails...")
    try:
        ingest_emails()
    except Exception as e:
        print(f"Ingestion failed: {e}")

    print("3. Generating Draft...")
    with Session(engine) as session:
        email = session.exec(select(Email).limit(1)).first()
        if email:
            print(f"Generating draft for: {email.subject}")
            draft = generate_draft(email)
            if draft:
                print(f"Draft generated: {draft.proposed_body[:100]}...")
            else:
                print("Draft generation failed.")
        else:
            print("No emails found to generate draft for.")

if __name__ == "__main__":
    main()
