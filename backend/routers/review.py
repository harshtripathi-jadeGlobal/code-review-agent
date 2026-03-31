from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from models.database import get_db
from models.models import Submission, Review, Issue
from services.llm_service import run_review, detect_language

router = APIRouter()


class CodeSubmitRequest(BaseModel):
    code: str
    filename: Optional[str] = "code.py"
    language: Optional[str] = None


@router.post("/review")
async def submit_review(req: CodeSubmitRequest, db: AsyncSession = Depends(get_db)):
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    lang = req.language or detect_language(req.filename or "", req.code)

    # Save submission
    submission = Submission(filename=req.filename, language=lang, code=req.code)
    db.add(submission)
    await db.flush()

    # Run LLM review
    try:
        result = await run_review(req.code, lang)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review failed: {str(e)}")

    issues_data = result.get("issues", [])
    critical = sum(1 for i in issues_data if i.get("severity") == "critical")
    warning  = sum(1 for i in issues_data if i.get("severity") == "warning")
    info     = sum(1 for i in issues_data if i.get("severity") == "info")

    review = Review(
        submission_id=submission.id,
        total_issues=len(issues_data),
        critical_count=critical,
        warning_count=warning,
        info_count=info,
        score=result.get("score", 100),
    )
    db.add(review)
    await db.flush()

    saved_issues = []
    for iss in issues_data:
        issue = Issue(
            review_id=review.id,
            category=iss.get("category", "style"),
            severity=iss.get("severity", "info"),
            line_number=iss.get("line_number"),
            title=iss.get("title", "Issue"),
            description=iss.get("description", ""),
            fix_suggestion=iss.get("fix_suggestion", ""),
            code_before=iss.get("code_before"),
            code_after=iss.get("code_after"),
        )
        db.add(issue)
        saved_issues.append(issue)

    await db.commit()

    return {
        "review_id": review.id,
        "submission_id": submission.id,
        "language": lang,
        "score": review.score,
        "summary": result.get("summary", ""),
        "total_issues": review.total_issues,
        "critical_count": critical,
        "warning_count": warning,
        "info_count": info,
        "issues": [
            {
                "id": iss.id if hasattr(iss, "id") else idx,
                "category": iss.category if hasattr(iss, "category") else issues_data[idx]["category"],
                "severity": iss.severity if hasattr(iss, "severity") else issues_data[idx]["severity"],
                "line_number": iss.line_number if hasattr(iss, "line_number") else issues_data[idx].get("line_number"),
                "title": iss.title if hasattr(iss, "title") else issues_data[idx]["title"],
                "description": iss.description if hasattr(iss, "description") else issues_data[idx]["description"],
                "fix_suggestion": iss.fix_suggestion if hasattr(iss, "fix_suggestion") else issues_data[idx]["fix_suggestion"],
                "code_before": iss.code_before if hasattr(iss, "code_before") else issues_data[idx].get("code_before"),
                "code_after": iss.code_after if hasattr(iss, "code_after") else issues_data[idx].get("code_after"),
            }
            for idx, iss in enumerate(saved_issues)
        ],
    }
