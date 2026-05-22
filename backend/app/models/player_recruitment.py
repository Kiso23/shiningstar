from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

from app.database import Base


class PlayerRecruitmentStatus(str, enum.Enum):
    """Status of player recruitment application"""
    PENDING = "pending"
    REVIEWED = "reviewed"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    ACCEPTED = "accepted"


class PlayerPosition(str, enum.Enum):
    """Football positions"""
    GOALKEEPER = "goalkeeper"
    DEFENDER = "defender"
    MIDFIELDER = "midfielder"
    FORWARD = "forward"
    STRIKER = "striker"


class PlayerRecruitment(Base):
    """Player recruitment/joining form"""
    __tablename__ = "player_recruitment"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Personal Information
    full_name = Column(String(100), nullable=False, index=True)
    email = Column(String(120), nullable=False, index=True)
    phone = Column(String(20), nullable=False)
    age = Column(Integer, nullable=False)
    date_of_birth = Column(String(10), nullable=True)  # YYYY-MM-DD format
    
    # Address
    address = Column(String(300), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(10), nullable=True)
    
    # Football Information
    position = Column(SQLEnum(PlayerPosition), nullable=False)
    jersey_number = Column(Integer, nullable=True)
    height = Column(Float, nullable=True)  # in cm
    weight = Column(Float, nullable=True)  # in kg
    
    # Experience
    years_of_experience = Column(Integer, nullable=False, default=0)
    previous_clubs = Column(Text, nullable=True)  # Comma-separated or description
    achievements = Column(Text, nullable=True)  # Awards, trophies, etc.
    
    # Additional Info
    preferred_foot = Column(String(20), nullable=True)  # left, right, both
    injuries_or_concerns = Column(Text, nullable=True)
    additional_notes = Column(Text, nullable=True)
    
    # Photo
    photo_url = Column(String(500), nullable=True)
    
    # Status & Timestamps
    status = Column(SQLEnum(PlayerRecruitmentStatus), default=PlayerRecruitmentStatus.PENDING, index=True)
    admin_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<PlayerRecruitment {self.full_name} - {self.position}>"
