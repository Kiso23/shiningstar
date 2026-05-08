import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    registration_id: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    team_name: Mapped[str] = mapped_column(String(100))
    manager_name: Mapped[str] = mapped_column(String(100))
    contact_phone: Mapped[str] = mapped_column(String(15))
    contact_email: Mapped[str] = mapped_column(String(254))
    player_count: Mapped[int] = mapped_column(Integer)
    address: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    logo_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    players: Mapped[List["Player"]] = relationship(back_populates="team", cascade="all, delete-orphan")
    payment_proof: Mapped[Optional["PaymentProof"]] = relationship(back_populates="team", uselist=False, cascade="all, delete-orphan")
