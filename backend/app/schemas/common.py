from enum import Enum
from typing import List, Optional
from pydantic import BaseModel


class RegistrationStatus(str, Enum):
    pending = "pending"
    payment_submitted = "payment_submitted"
    approved = "approved"
    rejected = "rejected"


class FieldError(BaseModel):
    field: str
    message: str


class ErrorResponse(BaseModel):
    detail: str
    code: str
    field_errors: Optional[List[FieldError]] = None
