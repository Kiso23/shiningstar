import logging
import os
from contextlib import asynccontextmanager
from typing import Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from fastapi import FastAPI, Request, status, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from datetime import datetime, timedelta

from app.config import settings
from app.database import create_tables, engine, AsyncSessionLocal
from app.services.backup_service import start_daily_backup_scheduler
from app.services.redis_cache import init_cache, close_cache


async def _run_migrations() -> None:
    """Inline schema migrations — safe to run on every startup (idempotent)."""
    async with engine.begin() as conn:
        # Widen otp_codes.code from VARCHAR(6) to VARCHAR(64) for SHA-256 hashes
        await conn.execute(
            __import__('sqlalchemy').text(
                "ALTER TABLE otp_codes ALTER COLUMN code TYPE VARCHAR(64)"
            )
        )
        # Add knockout bracket columns to matches table
        for sql in [
            "ALTER TABLE matches ADD COLUMN IF NOT EXISTS bracket_slot INTEGER",
            "ALTER TABLE matches ADD COLUMN IF NOT EXISTS next_match_id UUID REFERENCES matches(id)",
            "ALTER TABLE matches ADD COLUMN IF NOT EXISTS next_match_slot VARCHAR(1)",
            # Allow NULL team IDs for TBD slots in bracket
            "ALTER TABLE matches ALTER COLUMN team_a_id DROP NOT NULL",
            "ALTER TABLE matches ALTER COLUMN team_b_id DROP NOT NULL",
            # Add address column to teams
            "ALTER TABLE teams ADD COLUMN IF NOT EXISTS address VARCHAR(300)",
            # Add manual team name columns for non-registered teams
            "ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_a_name VARCHAR(100)",
            "ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_b_name VARCHAR(100)",
        ]:
            await conn.execute(__import__('sqlalchemy').text(sql))
    logger.info("Migrations complete.")
# Import all models so create_tables picks them up
import app.models.team  # noqa: F401
import app.models.player  # noqa: F401
import app.models.payment_proof  # noqa: F401
import app.models.match  # noqa: F401
import app.models.match_event  # noqa: F401
import app.models.standing  # noqa: F401
import app.models.admin  # noqa: F401
import app.models.page_view  # noqa: F401
import app.models.setting  # noqa: F401
import app.models.otp  # noqa: F401
import app.models.contact  # noqa: F401
import app.models.player_recruitment  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create DB tables and ensure uploads directory exists
    await create_tables()
    # Run inline migrations for column changes
    await _run_migrations()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "logos"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "payment_proofs"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "player_photos"), exist_ok=True)

    # Initialize Redis cache (only if REDIS_URL is provided)
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        await init_cache(redis_url)
    else:
        logger.info("REDIS_URL not set, Redis caching disabled")

    # Start daily DB backup scheduler (emails admin every 24h)
    backup_email = os.getenv("BACKUP_EMAIL", settings.SMTP_FROM)
    if backup_email and settings.SMTP_HOST:
        start_daily_backup_scheduler(AsyncSessionLocal, backup_email)

    yield
    
    # Shutdown: close Redis connection
    await close_cache()


app = FastAPI(
    title="Shining Star United — Tournament Registration API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware - allow all origins (can be restricted later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Cache middleware for GET requests
@app.middleware("http")
async def add_cache_headers(request: Request, call_next):
    """Add cache headers to GET requests for better performance and log requests"""
    # Log incoming request
    logger.debug(f"{request.method} {request.url.path}")
    
    response = await call_next(request)
    
    # Add cache headers for GET requests (except admin routes)
    if request.method == "GET" and not request.url.path.startswith("/api/v1/admin"):
        # Cache public endpoints for 5 minutes
        if request.url.path.startswith("/api/v1/contact") and "admin" not in request.url.path:
            response.headers["Cache-Control"] = "public, max-age=300"  # 5 minutes
        # Cache fixtures, leaderboard, etc. for 15 minutes
        elif any(path in request.url.path for path in ["/fixtures", "/leaderboard", "/standings", "/analytics"]):
            response.headers["Cache-Control"] = "public, max-age=900"  # 15 minutes
        # Don't cache settings - they should always be fresh
        elif "/settings" in request.url.path:
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    
    # Add ETag for better cache validation (only for responses with body)
    if response.status_code == 200 and request.method == "GET" and hasattr(response, "body"):
        try:
            response.headers["ETag"] = f'"{hash(response.body)}"'
        except Exception:
            # Skip ETag if body is not accessible (streaming responses, etc.)
            pass
    
    # Log response status
    logger.debug(f"{request.method} {request.url.path} -> {response.status_code}")
    
    return response


def _safe_str(v: Any) -> Any:
    """Recursively convert bytes to a safe string so JSON serialisation never fails."""
    if isinstance(v, bytes):
        return f"<binary {len(v)} bytes>"
    if isinstance(v, dict):
        return {k: _safe_str(val) for k, val in v.items()}
    if isinstance(v, list):
        return [_safe_str(i) for i in v]
    return v


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom handler that safely serialises Pydantic validation errors.
    The default FastAPI handler crashes on multipart requests that contain
    binary file bytes (UnicodeDecodeError when encoding error details).
    All errors use "detail" field for consistency.
    """
    safe_errors = []
    for err in exc.errors():
        safe_errors.append({
            "loc": list(err.get("loc", [])),
            "msg": str(err.get("msg", "")),
            "type": str(err.get("type", "")),
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": safe_errors},
    )


# Router registration
from app.routers import auth, registrations, admin  # noqa: E402
from app.routers import matches, match_events, standings, analytics  # noqa: E402
from app.routers import settings as settings_router  # noqa: E402
from app.routers import password as password_router  # noqa: E402
from app.routers import contact as contact_router  # noqa: E402
from app.routers import player_recruitment as player_recruitment_router  # noqa: E402
from app.routers import news as news_router  # noqa: E402
app.include_router(auth.router, prefix="/api/v1")
app.include_router(password_router.router, prefix="/api/v1")
app.include_router(registrations.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(matches.router, prefix="/api/v1")
app.include_router(match_events.router, prefix="/api/v1")
app.include_router(standings.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(settings_router.router, prefix="/api/v1")
app.include_router(contact_router.router, prefix="/api/v1")
app.include_router(player_recruitment_router.router, prefix="/api/v1")
app.include_router(news_router.router, prefix="/api/v1")


@app.get("/health", tags=["health"])
async def health_check():
    """Simple liveness probe."""
    return {"status": "ok"}


@app.get("/uploads/{file_path:path}", tags=["files"])
async def serve_upload(file_path: str):
    """Serve uploaded files (photos, logos, payment proofs)."""
    full_path = os.path.join(settings.UPLOAD_DIR, file_path)
    
    # Security: prevent directory traversal
    full_path = os.path.abspath(full_path)
    upload_dir = os.path.abspath(settings.UPLOAD_DIR)
    if not full_path.startswith(upload_dir):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    if not os.path.exists(full_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    
    if not os.path.isfile(full_path):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not a file")
    
    return FileResponse(full_path, media_type="application/octet-stream")


# Mount static files for uploads (logos, payment proofs, player photos)
# This is a fallback - the /uploads/{file_path:path} endpoint above is the primary handler
upload_dir_abs = os.path.abspath(settings.UPLOAD_DIR)
if os.path.exists(upload_dir_abs):
    try:
        app.mount("/static/uploads", StaticFiles(directory=upload_dir_abs), name="static_uploads")
        logger.info(f"Static files mounted at /static/uploads from {upload_dir_abs}")
    except Exception as e:
        logger.warning(f"Could not mount static files: {e}")
