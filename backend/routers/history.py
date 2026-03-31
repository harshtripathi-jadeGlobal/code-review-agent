from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from models.database import get_db
from models.models import Submission, Review, Issue

router = APIRouter()


@router.get("/history")
async def get_history(limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review, Submission)
        .join(Submission, Review.submission_id == Submission.id)
        .order_by(desc(Review.created_at))
        .limit(limit)
    )
    rows = result.all()
    return [
        {
            "review_id": rev.id,
            "submission_id": sub.id,
            "filename": sub.filename,
            "language": sub.language,
            "score": rev.score,
            "total_issues": rev.total_issues,
            "critical_count": rev.critical_count,
            "warning_count": rev.warning_count,
            "info_count": rev.info_count,
            "created_at": rev.created_at.isoformat(),
        }
        for rev, sub in rows
    ]


@router.get("/history/{review_id}")
async def get_review_detail(review_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review, Submission)
        .join(Submission, Review.submission_id == Submission.id)
        .where(Review.id == review_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Review not found")

    rev, sub = row
    issues_result = await db.execute(
        select(Issue).where(Issue.review_id == review_id)
    )
    issues = issues_result.scalars().all()

    return {
        "review_id": rev.id,
        "filename": sub.filename,
        "language": sub.language,
        "code": sub.code,
        "score": rev.score,
        "total_issues": rev.total_issues,
        "critical_count": rev.critical_count,
        "warning_count": rev.warning_count,
        "info_count": rev.info_count,
        "created_at": rev.created_at.isoformat(),
        "issues": [
            {
                "id": i.id,
                "category": i.category,
                "severity": i.severity,
                "line_number": i.line_number,
                "title": i.title,
                "description": i.description,
                "fix_suggestion": i.fix_suggestion,
                "code_before": i.code_before,
                "code_after": i.code_after,
            }
            for i in issues
        ],
    }


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import func
    total_reviews = await db.scalar(select(func.count(Review.id)))
    total_issues  = await db.scalar(select(func.sum(Review.total_issues))) or 0
    avg_score     = await db.scalar(select(func.avg(Review.score))) or 0
    critical_total = await db.scalar(select(func.sum(Review.critical_count))) or 0

    cat_result = await db.execute(
        select(Issue.category, func.count(Issue.id)).group_by(Issue.category)
    )
    categories = {row[0]: row[1] for row in cat_result.all()}

    return {
        "total_reviews": total_reviews or 0,
        "total_issues": int(total_issues),
        "avg_score": round(float(avg_score), 1),
        "critical_total": int(critical_total),
        "by_category": categories,
    }
