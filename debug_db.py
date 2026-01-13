import os
import psycopg2
from sqlalchemy import create_engine

# Check env var
env_url = os.environ.get("DATABASE_URL")
print(f"Environment DATABASE_URL: {env_url}")

# Hardcoded url
url = "postgresql://postgres:password@127.0.0.1:5432/fetch_db"
print(f"Using URL: {url}")

try:
    conn = psycopg2.connect(
        dbname="fetch_db",
        user="postgres",
        password="password",
        host="127.0.0.1",
        port="5432"
    )
    print("psycopg2 connection successful")
    conn.close()
except Exception as e:
    print(f"psycopg2 failed: {e}")

try:
    engine = create_engine(url)
    with engine.connect() as conn:
        print("SQLAlchemy connection successful")
except Exception as e:
    print(f"SQLAlchemy failed: {e}")
