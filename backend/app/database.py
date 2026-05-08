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
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def create_tables() -> None:
    """Create all database tables defined in the ORM models."""
    async with engine.begin() as conn:
        # Use checkfirst=True to avoid errors if tables already exist
        await conn.run_sync(Base.metadata.create_all, checkfirst=True)
