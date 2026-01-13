from sqlmodel import Session, text
from src.database import engine

def migrate():
    with Session(engine) as session:
        try:
            session.exec(text("ALTER TABLE email ADD COLUMN is_sent BOOLEAN DEFAULT FALSE;"))
            session.commit()
            print("Migration successful: Added is_sent column to email table.")
        except Exception as e:
            print(f"Migration failed (column might already exist): {e}")

if __name__ == "__main__":
    migrate()
