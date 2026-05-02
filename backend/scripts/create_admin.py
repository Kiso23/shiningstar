"""
CLI script to create the first admin account.
Usage: python -m scripts.create_admin --email admin@example.com --password secret
Or set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.
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


async def create_admin(email: str, password: str) -> None:
    await create_tables()
    async with AsyncSessionLocal() as session:
        # Check if admin already exists
        result = await session.execute(select(Admin).where(Admin.email == email))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"Admin with email {email} already exists.")
            return

        admin = Admin(
            email=email,
            password_hash=hash_password(password),
        )
        session.add(admin)
        await session.commit()
        print(f"Admin account created for {email}")


def main():
    parser = argparse.ArgumentParser(description="Create an admin account")
    parser.add_argument("--email", default=os.getenv("ADMIN_EMAIL"), required=False)
    parser.add_argument("--password", default=os.getenv("ADMIN_PASSWORD"), required=False)
    args = parser.parse_args()

    if not args.email or not args.password:
        print("Error: --email and --password are required (or set ADMIN_EMAIL and ADMIN_PASSWORD env vars)")
        sys.exit(1)

    asyncio.run(create_admin(args.email, args.password))


if __name__ == "__main__":
    main()
