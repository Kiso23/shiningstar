from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text

from app.config import settings

# Fix DATABASE_URL to use asyncpg driver and handle SSL params
database_url = settings.DATABASE_URL

# Convert postgresql:// to postgresql+asyncpg://
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# asyncpg doesn't support sslmode/channel_binding query params — strip them and use connect_args
import re
ssl_required = "sslmode=require" in database_url or "ssl=require" in database_url
# Remove unsupported query params
database_url = re.sub(r'[?&]sslmode=[^&]*', '', database_url)
database_url = re.sub(r'[?&]channel_binding=[^&]*', '', database_url)
database_url = re.sub(r'[?&]ssl=[^&]*', '', database_url)
# Clean up trailing ? or &
database_url = database_url.rstrip('?').rstrip('&')

connect_args = {"ssl": "require"} if ssl_required else {}

# Get pool configuration from environment or use defaults
import os
pool_size = int(os.getenv("DB_POOL_SIZE", "20"))
max_overflow = int(os.getenv("DB_MAX_OVERFLOW", "10"))
pool_recycle = int(os.getenv("DB_POOL_RECYCLE", "3600"))

# Validate pool configuration
if pool_size < 1:
    raise ValueError("DB_POOL_SIZE must be at least 1")
if max_overflow < 0:
    raise ValueError("DB_MAX_OVERFLOW must be non-negative")
if pool_recycle < 60:
    raise ValueError("DB_POOL_RECYCLE must be at least 60 seconds")

engine = create_async_engine(
    database_url,
    echo=False,
    connect_args=connect_args,
    pool_size=pool_size,  # Configurable pool size
    max_overflow=max_overflow,  # Allow overflow connections
    pool_pre_ping=True,  # Test connections before using them
    pool_recycle=pool_recycle,  # Recycle connections periodically
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def create_tables() -> None:
    """Create all database tables defined in the ORM models."""
    try:
        async with engine.begin() as conn:
            # Use checkfirst=True to avoid errors if tables already exist
            await conn.run_sync(Base.metadata.create_all, checkfirst=True)
            
            # Add timer columns if they don't exist
            try:
                await conn.execute(
                    text("""
                        ALTER TABLE matches 
                        ADD COLUMN IF NOT EXISTS match_start_time TIMESTAMP NULL,
                        ADD COLUMN IF NOT EXISTS match_end_time TIMESTAMP NULL,
                        ADD COLUMN IF NOT EXISTS current_minute INTEGER DEFAULT 0,
                        ADD COLUMN IF NOT EXISTS is_extra_time BOOLEAN DEFAULT FALSE,
                        ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT FALSE
                    """)
                )
                import logging
                logging.getLogger(__name__).info("Timer columns ensured in matches table")
            except Exception as e:
                # Columns might already exist - ignore
                if "already exists" not in str(e):
                    import logging
                    logging.getLogger(__name__).warning(f"Could not add timer columns: {e}")
            
    except Exception as e:
        # Neon PostgreSQL sometimes raises a duplicate type error on pooled connections
        # when tables already exist — this is safe to ignore
        err_str = str(e)
        if "pg_type_typname_nsp_index" in err_str or "already exists" in err_str:
            import logging
            logging.getLogger(__name__).warning(
                "create_tables: ignoring known Neon duplicate type error (tables already exist)"
            )
        else:
            raise
