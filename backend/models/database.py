from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get DATABASE_URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback for local/dev when MySQL isn't configured.
# Keeps the app runnable out of the box (demo mode still works),
# while still allowing MySQL via DATABASE_URL.
if not DATABASE_URL:
    DATABASE_URL = "sqlite+aiosqlite:///./codesage.db"

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set True for debugging, False for production
    future=True
)

# Create session
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency (used in routes)
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Initialize DB (create tables)
async def init_db():
    from models.models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)