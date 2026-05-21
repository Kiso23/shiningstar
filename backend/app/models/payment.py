import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class RazorpayPayment(Base):
    __tablename__ = "razorpay_payments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("teams.id"), index=True)
    razorpay_order_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    razorpay_payment_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, unique=True)
    razorpay_signature: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    amount: Mapped[float] = mapped_column(Float, default=80100)  # Amount in paise (₹801 = 80100 paise)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    status: Mapped[str] = mapped_column(String(20), default="created", index=True)  # created, authorized, captured, failed, refunded
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    team: Mapped["Team"] = relationship(back_populates="razorpay_payment")
