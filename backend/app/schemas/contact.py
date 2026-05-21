import uuid
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r"^\d{10}$")
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=10, max_length=5000)


class ContactResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: str
    subject: str
    message: str
    status: str
    admin_reply: str | None = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ContactReply(BaseModel):
    admin_reply: str = Field(..., min_length=10, max_length=5000)
    status: str = Field(default="responded")
