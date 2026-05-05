"""
Admin password management:
- POST /auth/forgot-password  → send OTP to admin email
- POST /auth/verify-otp       → verify OTP, return reset token
- POST /auth/reset-password   → set new password using reset token
- POST /auth/change-password  → change password when logged in (admin only)
"""
import random
import string
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_admin
from app.dependencies.db import get_db
from app.models.admin import Admin
from app.models.otp import OTPCode
from app.schemas.auth import TokenResponse
from app.services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

OTP_EXPIRY_MINUTES = 10


# ── Schemas ───────────────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: str


class VerifyOTPRequest(BaseModel):
    email: str
    code: str


class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class MessageResponse(BaseModel):
    message: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))


async def _send_otp_email(email: str, code: str) -> None:
    """Send OTP via the existing email service."""
    from app.services.email_service import _send, _base_html

    subject = "🔐 Password Reset OTP — Shining Star United Admin"
    html_content = f"""
      <h2 style="margin:0 0 8px;color:#fff;font-size:20px;">Password Reset Request</h2>
      <p style="margin:0 0 24px;color:#aaa;font-size:14px;">
        You requested a password reset for your admin account.
      </p>
      <div style="background:#111;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #2a2a2a;text-align:center;">
        <p style="margin:0 0 8px;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:2px;">Your OTP Code</p>
        <p style="margin:0;color:#f97316;font-size:40px;font-weight:900;font-family:monospace;letter-spacing:8px;">{code}</p>
        <p style="margin:8px 0 0;color:#555;font-size:12px;">Expires in {OTP_EXPIRY_MINUTES} minutes</p>
      </div>
      <p style="margin:0;color:#666;font-size:12px;">
        If you did not request this, please ignore this email. Your password will not change.
      </p>
    """
    text_content = f"""Password Reset OTP — Shining Star United Admin

Your OTP code is: {code}

This code expires in {OTP_EXPIRY_MINUTES} minutes.

If you did not request this, ignore this email."""

    await _send(email, subject, _base_html(html_content), text_content)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    body: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send OTP to admin email. Always returns success to prevent email enumeration."""
    result = await db.execute(select(Admin).where(Admin.email == body.email))
    admin = result.scalar_one_or_none()

    if admin:
        # Invalidate old OTPs
        old_otps = await db.execute(
            select(OTPCode).where(OTPCode.email == body.email, OTPCode.used == False)  # noqa: E712
        )
        for otp in old_otps.scalars().all():
            otp.used = True

        code = _generate_otp()
        db.add(OTPCode(email=body.email, code=code))
        await db.commit()

        try:
            await _send_otp_email(body.email, code)
        except Exception:
            pass  # Don't reveal email failures

    return MessageResponse(message="If that email is registered, an OTP has been sent.")


@router.post("/verify-otp", response_model=MessageResponse)
async def verify_otp(
    body: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verify OTP is valid (without consuming it yet)."""
    expiry = datetime.utcnow() - timedelta(minutes=OTP_EXPIRY_MINUTES)
    result = await db.execute(
        select(OTPCode).where(
            OTPCode.email == body.email,
            OTPCode.code == body.code,
            OTPCode.used == False,  # noqa: E712
            OTPCode.created_at >= expiry,
        )
    )
    otp = result.scalar_one_or_none()
    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )
    return MessageResponse(message="OTP verified")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Reset password using valid OTP."""
    if len(body.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters",
        )

    expiry = datetime.utcnow() - timedelta(minutes=OTP_EXPIRY_MINUTES)
    result = await db.execute(
        select(OTPCode).where(
            OTPCode.email == body.email,
            OTPCode.code == body.code,
            OTPCode.used == False,  # noqa: E712
            OTPCode.created_at >= expiry,
        )
    )
    otp = result.scalar_one_or_none()
    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    # Mark OTP as used
    otp.used = True

    # Update password
    admin_result = await db.execute(select(Admin).where(Admin.email == body.email))
    admin = admin_result.scalar_one_or_none()
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")

    admin.password_hash = hash_password(body.new_password)
    await db.commit()

    return MessageResponse(message="Password reset successfully")


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    body: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Change password when already logged in."""
    if len(body.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be at least 8 characters",
        )

    if not verify_password(body.current_password, current_admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_admin.password_hash = hash_password(body.new_password)
    await db.commit()
    return MessageResponse(message="Password changed successfully")
