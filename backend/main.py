from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import review, history, repo
from models.database import init_db
from contextlib import asynccontextmanager

# ✅ Lifespan function (replaces on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    await init_db()
    yield
    # Shutdown logic (optional)

app = FastAPI(
    title="Code Review Agent",
    version="1.0.0",
    lifespan=lifespan   # ✅ NEW WAY
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(review.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(repo.router, prefix="/api/repo")

@app.get("/")
def root():
    return {"status": "Code Review Agent running"}