import pytest
from unittest.mock import AsyncMock

# ------------------------------------------------------------------
# MOCK LLM DATA: This is the mock interactions you requested to see!
# Instead of doing a real httpx call to openai/groq, we supply this fake response.
# ------------------------------------------------------------------
MOCK_LLM_RESPONSE = {
    "score": 90,
    "summary": "This is a great piece of code from the mock LLM.",
    "issues": [
        {
            "category": "style",
            "severity": "info",
            "line_number": 1,
            "title": "Mock Issue",
            "description": "This is a forged issue from the test mock.",
            "fix_suggestion": "Add a comment.",
            "code_before": "def my_func():\n  pass",
            "code_after": "# A comment\ndef my_func():\n  pass"
        }
    ]
}

@pytest.mark.asyncio
def test_submit_review_success(client, mocker):
    """
    Test scenario: 
    A user submits a valid piece of code.
    Wait! We mock the `run_review` async function from services.
    """
    # --> THIS IS WHERE WE MOCK THE INTERACTION <-- #
    # We replace the imported `run_review` function inside the router with a fakeAsyncMock.
    mock_run_review = mocker.patch(
        "routers.review.run_review", 
        new_callable=AsyncMock,
        return_value=MOCK_LLM_RESPONSE
    )

    request_payload = {
        "code": "print('Hello World')",
        "filename": "hello.py",
        "language": "python"
    }

    # Make the simulated POST request to our FastAPI app endpoints
    response = client.post("/api/review", json=request_payload)

    # 1. Assert we didn't crash
    assert response.status_code == 200
    
    # 2. Extract JSON response
    data = response.json()
    
    # 3. Verify our fake mock data got passed cleanly directly to the API consumer
    assert data["score"] == 90
    assert data["summary"] == "This is a great piece of code from the mock LLM."
    assert len(data["issues"]) == 1
    assert data["issues"][0]["title"] == "Mock Issue"

    # 4. Verify that our Mock was truly called behind the scenes!
    mock_run_review.assert_called_once_with("print('Hello World')", "python")

@pytest.mark.asyncio
def test_submit_review_empty_code(client):
    """
    Test scenario:
    The user submits nothing but spaces. The backend must reject it without calling the LLM.
    """
    request_payload = {
        "code": "   ",
        "filename": "empty.py"
    }
    response = client.post("/api/review", json=request_payload)

    # Fast API should reject with HTTP 400 Bad Request defined in router
    assert response.status_code == 400
    assert response.json()["detail"] == "Code cannot be empty"

@pytest.mark.asyncio
def test_submit_review_llm_failure(client, mocker):
    """
    Test scenario:
    The LLM service crashes (e.g. Rate Limits reached). 
    The endpoint should catch and return 500 error gracefully.
    """
    # --> AGAIN: Mock the function but force it to THROW AN EXCEPTION instead! <-- #
    mocker.patch(
        "routers.review.run_review", 
        new_callable=AsyncMock,
        side_effect=Exception("Rate Limit Exceeded!")
    )

    request_payload = {
        "code": "def failing_code():\n  pass"
    }
    response = client.post("/api/review", json=request_payload)

    # Expecting graceful inner app crash -> 500 Internal Error
    assert response.status_code == 500
    assert "Review failed: Rate Limit Exceeded!" in response.json()["detail"]
