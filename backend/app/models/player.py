import uuid
from typing import Optional
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"]


class Player(Base):
    __tablename__ = "players"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("teams.id"), index=True)
    full_name: Mapped[str] = mapped_column(String(100))
    age: Mapped[int] = mapped_column(Integer)
    jersey_number: Mapped[int] = mapped_column(Integer)
    position: Mapped[str] = mapped_column(String(20))
    position_index: Mapped[int] = mapped_column(Integer)  # order in roster

    team: Mapped["Team"] = relationship(back_populates="players")
