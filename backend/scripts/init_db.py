"""
Initialize the database and optionally seed the first admin account.
Run from the backend/ directory:
    python -m scripts.init_db
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import create_tables
from app.models import Team, Player, Admin, PaymentProof  # noqa: F401 — register models


async def main():
    print("Creating database tables...")
    await create_tables()
    print("Done.")

    # Optionally seed admin
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    if email and password:
        from sqlalchemy import select
        from app.database import AsyncSessionLocal
        from app.services.auth_service import hash_password

        async with AsyncSessionLocal() as session:
            result = await session.execute(select(Admin).where(Admin.email == email))
            if result.scalar_one_or_none():
                print(f"Admin {email} already exists.")
            else:
                admin = Admin(email=email, password_hash=hash_password(password))
                session.add(admin)
                await session.commit()
                print(f"Admin account created: {email}")


if __name__ == "__main__":
    asyncio.run(main())
