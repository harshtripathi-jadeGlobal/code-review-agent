import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv("backend/.env")

async def update_db():
    url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./codesage.db")
    engine = create_async_engine(url, echo=True)
    
    async with engine.begin() as conn:
        try:
            if "sqlite" in url:
                await conn.execute(text("ALTER TABLE issues ADD COLUMN cited_files VARCHAR(255)"))
            else:
                # mysql or postgres
                await conn.execute(text("ALTER TABLE issues ADD COLUMN cited_files VARCHAR(255)"))
            print("Successfully added cited_files column.")
        except Exception as e:
            if "Duplicate column" in str(e) or "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                print("Column already exists.")
            else:
                print(f"Error adding column (might already exist): {e}")

if __name__ == "__main__":
    asyncio.run(update_db())
