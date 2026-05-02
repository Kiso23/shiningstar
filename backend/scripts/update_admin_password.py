"""
CLI script to update an admin account password.
Usage: python -m scripts.update_admin_password --email admin@example.com --password newpassword
"""
import asyncio
import argparse
import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.database import AsyncSessionLocal, create_tables
from app.models.admin import Admin
from app.services.auth_service import hash_password


async def update_admin_password(email: str, password: str) -> None:
    await create_tables()
    async with AsyncSessionLocal() as session:
        # Find the admin
        result = await session.execute(select(Admin).where(Admin.email == email))
        admin = result.scalar_one_or_none()
        
        if not admin:
            print(f"Error: Admin with email {email} not found.")
            print("Create a new admin with: python -m scripts.create_admin")
            return

        # Update password
        admin.password_hash = hash_password(password)
        await session.commit()
        print(f"Password updated for admin: {email}")


def main():
    parser = argparse.ArgumentParser(description="Update an admin account password")
    parser.add_argument("--email", required=True, help="Admin email address")
    parser.add_argument("--password", required=True, help="New password")
    args = parser.parse_args()

    asyncio.run(update_admin_password(args.email, args.password))


if __name__ == "__main__":
    main()
