from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum
from uuid import UUID


class PlayerPosition(str, Enum):
    """Football positions"""
    GOALKEEPER = "goalkeeper"
    DEFENDER = "defender"
    MIDFIELDER = "midfielder"
    FORWARD = "forward"
    STRIKER = "striker"


class PlayerRecruitmentStatus(str, Enum):
    """Status of player recruitment application"""
    PENDING = "pending"
    REVIEWED = "reviewed"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    ACCEPTED = "accepted"


class PlayerRecruitmentCreate(BaseModel):
    """Schema for creating player recruitment application"""
    # Personal Information
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    age: int = Field(..., ge=16, le=50)
    date_of_birth: Optional[str] = Field(None, description="YYYY-MM-DD format")
    
    # Address
    address: str = Field(..., min_length=5, max_length=300)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=10)
    
    # Football Information
    position: PlayerPosition
    jersey_number: Optional[int] = Field(None, ge=1, le=99)
    height: Optional[float] = Field(None, ge=140, le=220, description="Height in cm")
    weight: Optional[float] = Field(None, ge=40, le=150, description="Weight in kg")
    
    # Experience
    years_of_experience: int = Field(default=0, ge=0, le=50)
    previous_clubs: Optional[str] = Field(None, max_length=500)
    achievements: Optional[str] = Field(None, max_length=500)
    
    # Additional Info
    preferred_foot: Optional[str] = Field(None, description="left, right, or both")
    injuries_or_concerns: Optional[str] = Field(None, max_length=500)
    additional_notes: Optional[str] = Field(None, max_length=500)


class PlayerRecruitmentResponse(PlayerRecruitmentCreate):
    """Schema for player recruitment response"""
    id: str
    photo_url: Optional[str] = None
    status: PlayerRecruitmentStatus
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PlayerRecruitmentUpdate(BaseModel):
    """Schema for updating player recruitment status (admin only)"""
    status: PlayerRecruitmentStatus
    admin_notes: Optional[str] = None


class PlayerRecruitmentList(BaseModel):
    """Schema for listing player recruitment applications"""
    id: str
    full_name: str
    email: str
    phone: str
    position: PlayerPosition
    age: int
    status: PlayerRecruitmentStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
