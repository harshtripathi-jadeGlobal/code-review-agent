import pytest
from unittest.mock import AsyncMock
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_submit_review_empty_code(async_client: AsyncClient):
    response = await async_client.post(
        "/api/review",
        json={"code": "", "filename": "app.py", "language": "python"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Code cannot be empty"

@pytest.mark.asyncio
async def test_submit_review_success(async_client: AsyncClient, mocker):
    mock_review_data = {
        "score": 85,
        "summary": "Mock summary",
        "issues": [
            {
                "category": "style",
                "severity": "info",
                "line_number": 1,
                "title": "Mock Issue",
                "description": "Mock description",
                "fix_suggestion": "Mock fix",
                "code_before": "foo",
                "code_after": "bar"
            }
        ]
    }
    # run_review is an async function — must use AsyncMock so `await run_review()`
    # returns the mock value instead of hanging waiting on a coroutine.
    mocker.patch("routers.review.run_review", new=AsyncMock(return_value=mock_review_data))
    
    response = await async_client.post(
        "/api/review",
        json={"code": "def foo(): pass", "filename": "app.py", "language": "python"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 85
    assert data["summary"] == "Mock summary"
    assert data["total_issues"] == 1
    assert data["issues"][0]["title"] == "Mock Issue"
