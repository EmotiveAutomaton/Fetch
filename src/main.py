from fastapi import FastAPI, HTTPException, Depends
from contextlib import asynccontextmanager
from typing import List
from sqlmodel import Session, select
from .models import Draft, Email
from .database import engine
from .gmail_client import GmailClient
from .discovery import ServiceDiscovery
from .router import router as chat_router
from .services.ingest import ingest_emails
import asyncio
import uuid
from datetime import datetime

# Global Clients
gmail_client = None
discovery_service = None
background_tasks = set()

async def periodic_ingest():
    """Background task to ingest emails every 60 seconds."""
    while True:
        try:
            print("[Background] Running ingestion...")
            # Run blocking sync function in thread pool
            await asyncio.to_thread(ingest_emails)
            print("[Background] Ingestion complete.")
        except Exception as e:
            print(f"[Background] Ingestion failed: {e}")
        
        await asyncio.sleep(60)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    global gmail_client, discovery_service
    try:
        gmail_client = GmailClient()
    except Exception as e:
        print(f"Warning: Could not initialize Gmail client: {e}")
    
    try:
        discovery_service = ServiceDiscovery(port=8000)
        discovery_service.register()
    except Exception as e:
        print(f"Warning: Could not start Service Discovery: {e}")

    # Start background ingestion
    task = asyncio.create_task(periodic_ingest())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)

    yield
    
    # Shutdown logic
    if discovery_service:
        discovery_service.unregister()
    
    # Cancel background tasks
    for task in background_tasks:
        task.cancel()

app = FastAPI(title="Fetch API", lifespan=lifespan)
app.include_router(chat_router)

@app.get("/")
async def root():
    return {"message": "Fetch API is running"}

