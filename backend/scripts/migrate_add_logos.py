"""
Migration script to add team_a_logo and team_b_logo columns to matches table.
Run from the backend/ directory:
    python -m scripts.migrate_add_logos
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import AsyncSessionLocal


async def main():
    async with AsyncSessionLocal() as session:
        try:
            # Check if columns already exist
            result = await session.execute(
                text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'matches' 
                    AND column_name IN ('team_a_logo', 'team_b_logo')
                """)
            )
            existing_columns = {row[0] for row in result.fetchall()}
            
            # Add team_a_logo if it doesn't exist
            if 'team_a_logo' not in existing_columns:
                print("Adding team_a_logo column...")
                await session.execute(
                    text("ALTER TABLE matches ADD COLUMN team_a_logo TEXT NULL")
                )
                print("✓ team_a_logo column added")
            else:
                print("✓ team_a_logo column already exists")
            
            # Add team_b_logo if it doesn't exist
            if 'team_b_logo' not in existing_columns:
                print("Adding team_b_logo column...")
                await session.execute(
                    text("ALTER TABLE matches ADD COLUMN team_b_logo TEXT NULL")
                )
                print("✓ team_b_logo column added")
            else:
                print("✓ team_b_logo column already exists")
            
            await session.commit()
            print("\nMigration completed successfully!")
            
        except Exception as e:
            await session.rollback()
            print(f"Migration failed: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(main())
