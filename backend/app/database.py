from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

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

engine = create_async_engine(
    database_url,
    echo=False,
    connect_args=connect_args,
    pool_size=20,  # Increase pool size for better concurrency
    max_overflow=10,  # Allow overflow connections
    pool_pre_ping=True,  # Test connections before using them
    pool_recycle=3600,  # Recycle connections every hour
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
