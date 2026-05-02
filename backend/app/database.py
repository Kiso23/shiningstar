from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.config import settings

# Fix DATABASE_URL to use asyncpg driver
database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    database_url,
    echo=False,
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
