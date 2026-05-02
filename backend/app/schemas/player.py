import uuid
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict

POSITION_OPTIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"]


class PlayerCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=5, le=60)
    jersey_number: int = Field(..., ge=1, le=99, description="Jersey number (1–99)")
    position: str = Field(..., description="One of: Goalkeeper, Defender, Midfielder, Forward")


class PlayerResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    age: int
    jersey_number: int
    position: str
    position_index: int
    model_config = ConfigDict(from_attributes=True)
