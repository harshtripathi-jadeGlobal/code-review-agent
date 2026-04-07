from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.rag_service import ingest_repository

router = APIRouter()

class IngestRequest(BaseModel):
    repo_path: str

@router.post("/ingest")
async def ingest_repo(req: IngestRequest):
    if not req.repo_path.strip():
        raise HTTPException(status_code=400, detail="Repository path cannot be empty")
        
    try:
        # Note: Ingestion is blocking compute. For scalable environments, this should be an async worker task.
        result = ingest_repository(req.repo_path)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
