from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies.auth import get_current_admin
from app.dependencies.db import get_db
from app.models.admin import Admin
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import verify_password, create_access_token
from app.middleware.rate_limit import login_limiter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(request: Request, body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Admin login — returns a signed JWT on valid credentials. Rate limited to 5/min per IP."""
    # Rate limit check
    ip = login_limiter.get_client_ip(request)
    login_limiter.check(ip)

    result = await db.execute(select(Admin).where(Admin.email == body.email))
    admin = result.scalar_one_or_none()

    # Constant-time comparison: always call verify_password to prevent timing attacks
    if admin is None or not verify_password(body.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": admin.email})
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=dict)
async def get_me(current_admin: Admin = Depends(get_current_admin)):
    """Return the currently authenticated admin's email."""
    return {"email": current_admin.email}
