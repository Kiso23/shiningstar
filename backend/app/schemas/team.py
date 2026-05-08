import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from app.schemas.common import RegistrationStatus
from app.schemas.player import PlayerResponse


class TeamCreate(BaseModel):
    team_name: str = Field(..., min_length=1, max_length=100)
    manager_name: str = Field(..., min_length=1, max_length=100)
    contact_phone: str = Field(..., pattern=r"^\d{10}$")
    contact_email: EmailStr
    player_count: int = Field(..., ge=11, le=18)
    address: Optional[str] = Field(None, max_length=300)


class PaymentProofResponse(BaseModel):
    id: uuid.UUID
    original_filename: str
    mime_type: str
    file_size_bytes: int
    uploaded_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TeamResponse(BaseModel):
    id: uuid.UUID
    registration_id: str
    team_name: str
    manager_name: str
    contact_phone: str
    contact_email: str
    player_count: int
    address: Optional[str] = None
    status: RegistrationStatus
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TeamDetailResponse(TeamResponse):
    id: uuid.UUID
    logo_path: Optional[str] = None
    updated_at: datetime
    players: List[PlayerResponse] = []
    payment_proof: Optional[PaymentProofResponse] = None
    model_config = ConfigDict(from_attributes=True)
