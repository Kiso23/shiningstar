import os
import hmac
import hashlib
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.team import Team
from app.models.payment import RazorpayPayment

try:
    import razorpay
except ImportError:
    razorpay = None


class RazorpayService:
    """Service for handling Razorpay payments"""

    def __init__(self):
        self.key_id = os.getenv("RAZORPAY_KEY_ID")
        self.key_secret = os.getenv("RAZORPAY_KEY_SECRET")
        self.amount = 80100  # ₹801 in paise

        if razorpay and self.key_id and self.key_secret:
            self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
        else:
            self.client = None

    async def create_order(self, db: AsyncSession, team_id: str) -> dict:
        """Create a Razorpay order"""
        if not self.client:
            raise ValueError("Razorpay is not configured")

        try:
            # Create order on Razorpay
            order_data = {
                "amount": self.amount,
                "currency": "INR",
                "receipt": f"team_{team_id}",
                "notes": {
                    "team_id": team_id,
                },
            }

            order = self.client.order.create(data=order_data)

            # Save order to database
            payment = RazorpayPayment(
                team_id=team_id,
                razorpay_order_id=order["id"],
                amount=self.amount,
                status="created",
            )
            db.add(payment)
            await db.commit()

            return {
                "id": order["id"],
                "amount": order["amount"],
                "currency": order["currency"],
            }
        except Exception as e:
            raise ValueError(f"Failed to create Razorpay order: {str(e)}")

    async def verify_payment(
        self,
        db: AsyncSession,
        team_id: str,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> bool:
        """Verify Razorpay payment signature"""
        if not self.client or not self.key_secret:
            raise ValueError("Razorpay is not configured")

        try:
            # Verify signature
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            expected_signature = hmac.new(
                self.key_secret.encode(),
                message.encode(),
                hashlib.sha256,
            ).hexdigest()

            if expected_signature != razorpay_signature:
                return False

            # Update payment record
            result = await db.execute(
                select(RazorpayPayment).where(
                    RazorpayPayment.razorpay_order_id == razorpay_order_id
                )
            )
            payment = result.scalar_one_or_none()

            if not payment:
                raise ValueError("Payment record not found")

            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = "captured"

            # Update team status
            result = await db.execute(select(Team).where(Team.id == team_id))
            team = result.scalar_one_or_none()

            if team:
                team.status = "payment_verified"

            await db.commit()
            return True

        except Exception as e:
            raise ValueError(f"Failed to verify payment: {str(e)}")

    async def get_payment_status(
        self, db: AsyncSession, team_id: str
    ) -> Optional[dict]:
        """Get payment status for a team"""
        result = await db.execute(
            select(RazorpayPayment).where(RazorpayPayment.team_id == team_id)
        )
        payment = result.scalar_one_or_none()

        if not payment:
            return None

        return {
            "razorpay_order_id": payment.razorpay_order_id,
            "razorpay_payment_id": payment.razorpay_payment_id,
            "status": payment.status,
            "amount": payment.amount,
            "created_at": payment.created_at.isoformat(),
        }
