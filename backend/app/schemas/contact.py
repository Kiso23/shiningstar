import uuid
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=10, max_length=5000)
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Validate phone number - must contain at least 10 digits."""
        # Remove common separators and spaces
        digits_only = ''.join(c for c in v if c.isdigit())
        if len(digits_only) < 10:
            raise ValueError('Phone number must contain at least 10 digits')
        return v


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
