from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column
import uuid

class Email(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    message_id: str = Field(unique=True)
    body_hash: str = Field(unique=True) # SHA-256
    sender: str
    subject: str
    raw_body: str
    summary: Optional[str] = None
    embedding: List[float] = Field(sa_column=Column(Vector(768)))
    is_processed: bool = False
    is_sent: bool = Field(default=False)
    received_at: datetime = Field(default_factory=datetime.utcnow)

class Draft(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email_id: str = Field(foreign_key="email.id")
    status: str = "PENDING" # PENDING, APPROVED, REJECTED, SENT
    proposed_body: str
    reasoning_trace: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AiExclusion(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    body_hash: str = Field(unique=True, index=True)
    reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

