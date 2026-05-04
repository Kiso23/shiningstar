import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class PageView(Base):
    __tablename__ = "page_views"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    page: Mapped[str] = mapped_column(String(100), index=True)          # e.g. "home", "fixtures"
    visitor_hash: Mapped[str] = mapped_column(String(64), index=True)   # hashed IP — no PII stored
    device: Mapped[str] = mapped_column(String(20), default="unknown")  # "mobile" | "desktop"
    visited_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        Index("ix_page_views_visited_at_page", "visited_at", "page"),
    )
