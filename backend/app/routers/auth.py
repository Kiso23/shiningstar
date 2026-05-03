from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies.db import get_db
from app.models.admin import Admin
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import verify_password, create_access_token, hash_password
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Admin login endpoint. Returns a JWT on valid credentials."""
    result = await db.execute(select(Admin).where(Admin.email == request.email))
    admin = result.scalar_one_or_none()

    if admin is None or not verify_password(request.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": admin.email})
    return TokenResponse(access_token=access_token)


@router.post("/test-email", tags=["setup"])
async def test_email():
    """Test endpoint to verify SMTP is working on production."""
    import os
    from app.config import settings
    api_key = os.getenv("BREVO_API_KEY", "")
    return {
        "smtp_host": settings.SMTP_HOST,
        "smtp_port": settings.SMTP_PORT,
        "smtp_user": settings.SMTP_USER,
        "smtp_from": settings.SMTP_FROM,
        "smtp_tls": settings.SMTP_TLS,
        "smtp_password_set": bool(settings.SMTP_PASSWORD),
        "brevo_key_length": len(api_key),
        "brevo_key_prefix": api_key[:20] if api_key else "NOT SET",
        "brevo_key_has_newline": "\n" in api_key,
        "brevo_key_stripped_length": len(api_key.strip()),
    }
async def setup_admin(db: AsyncSession = Depends(get_db)):
    """
    One-time setup endpoint to create the admin account.
    Uses ADMIN_EMAIL and ADMIN_PASSWORD environment variables.
    Disabled if ADMIN_SETUP_DONE env var is set.
    """
    import os
    # Safety check - disable if already done
    if os.getenv("ADMIN_SETUP_DONE", "").lower() == "true":
        raise HTTPException(status_code=403, detail="Setup already completed")

    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_email or not admin_password:
        raise HTTPException(
            status_code=400,
            detail="ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set"
        )

    # Check if admin already exists
    result = await db.execute(select(Admin).where(Admin.email == admin_email))
    existing = result.scalar_one_or_none()
    if existing:
        return {"message": f"Admin {admin_email} already exists"}

    admin = Admin(
        email=admin_email,
        password_hash=hash_password(admin_password),
    )
    db.add(admin)
    await db.commit()
    return {"message": f"Admin account created for {admin_email}"}
