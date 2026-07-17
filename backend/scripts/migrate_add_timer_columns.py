"""
Migration script to add match_start_time and match_end_time columns to matches table.
Run this once to update the database schema.
"""
import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

async def migrate():
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set")
        return False
    
    # Create async engine
    engine = create_async_engine(database_url, echo=True)
    
    async with engine.begin() as conn:
        try:
            # Check if columns already exist
            result = await conn.execute(text("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name='matches' AND column_name IN ('match_start_time', 'match_end_time')
            """))
            existing_columns = [row[0] for row in result]
            
            # Add match_start_time if it doesn't exist
            if 'match_start_time' not in existing_columns:
                print("Adding match_start_time column...")
                await conn.execute(text("""
                    ALTER TABLE matches ADD COLUMN match_start_time TIMESTAMP NULL
                """))
                # Create index
                await conn.execute(text("""
                    CREATE INDEX idx_matches_match_start_time ON matches(match_start_time)
                """))
                print("✓ Added match_start_time column with index")
            else:
                print("✓ match_start_time column already exists")
            
            # Add match_end_time if it doesn't exist
            if 'match_end_time' not in existing_columns:
                print("Adding match_end_time column...")
                await conn.execute(text("""
                    ALTER TABLE matches ADD COLUMN match_end_time TIMESTAMP NULL
                """))
                # Create index
                await conn.execute(text("""
                    CREATE INDEX idx_matches_match_end_time ON matches(match_end_time)
                """))
                print("✓ Added match_end_time column with index")
            else:
                print("✓ match_end_time column already exists")
            
            print("\n✅ Migration completed successfully!")
            await conn.commit()
            return True
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            await conn.rollback()
            return False
        finally:
            await engine.dispose()

if __name__ == "__main__":
    success = asyncio.run(migrate())
    exit(0 if success else 1)
