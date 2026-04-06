import pytest
import pytest_asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# ── In-memory SQLite engine for tests ──────────────────────────────────────────
# StaticPool is REQUIRED for in-memory SQLite with aiosqlite:
# Without it, each new connection gets a fresh empty DB.
# StaticPool reuses the same underlying connection throughout.
# This also fixes the MissingGreenlet error caused by SQLAlchemy trying
# to lazy-reload expired attributes via a sync path on the aiosqlite driver.
engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,   # Prevents lazy-reload of attributes after commit
    autocommit=False,
    autoflush=False,
)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

# ── Create / drop all tables before/after each test ────────────────────────────
@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    from models.models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

# ── Async HTTPX client wired to the FastAPI app ─────────────────────────────────
@pytest_asyncio.fixture
async def async_client():
    from main import app
    from models.database import get_db
    from unittest.mock import AsyncMock, patch

    app.dependency_overrides[get_db] = override_get_db

    # Patch init_db so the app lifespan doesn't connect to the real DB on startup
    with patch("main.init_db", new=AsyncMock()):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as ac:
            yield ac

    app.dependency_overrides.clear()
