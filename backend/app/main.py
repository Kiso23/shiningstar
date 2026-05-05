import logging
import os
from contextlib import asynccontextmanager
from typing import Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import create_tables, engine


async def _run_migrations() -> None:
    """Inline schema migrations — safe to run on every startup (idempotent)."""
    async with engine.begin() as conn:
        # Widen otp_codes.code from VARCHAR(6) to VARCHAR(64) for SHA-256 hashes
        await conn.execute(
            __import__('sqlalchemy').text(
                "ALTER TABLE otp_codes ALTER COLUMN code TYPE VARCHAR(64)"
            )
        )
    logger.info("Migrations complete.")
# Import all models so create_tables picks them up
import app.models.team  # noqa: F401
import app.models.player  # noqa: F401
import app.models.payment_proof  # noqa: F401
import app.models.match  # noqa: F401
import app.models.standing  # noqa: F401
import app.models.admin  # noqa: F401
import app.models.page_view  # noqa: F401
import app.models.setting  # noqa: F401
import app.models.otp  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create DB tables and ensure uploads directory exists
    await create_tables()
    # Run inline migrations for column changes
    await _run_migrations()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "logos"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "payment_proofs"), exist_ok=True)
    yield
    # Shutdown: nothing to clean up for now


app = FastAPI(
    title="Shining Star United — Tournament Registration API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
from app.routers import matches, standings, analytics  # noqa: E402
from app.routers import settings as settings_router  # noqa: E402
from app.routers import password as password_router  # noqa: E402
app.include_router(auth.router, prefix="/api/v1")
app.include_router(password_router.router, prefix="/api/v1")
app.include_router(registrations.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(matches.router, prefix="/api/v1")
app.include_router(standings.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(settings_router.router, prefix="/api/v1")


@app.get("/health", tags=["health"])
async def health_check():
    """Simple liveness probe."""
    return {"status": "ok"}
