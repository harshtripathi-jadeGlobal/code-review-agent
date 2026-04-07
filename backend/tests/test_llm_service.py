import pytest
from services.llm_service import parse_llm_response, detect_language

def test_parse_llm_response_clean_json():
    clean_json = '{"score": 90, "summary": "Good", "issues": []}'
    result = parse_llm_response(clean_json)
    assert result["score"] == 90
    assert result["summary"] == "Good"
    assert result["issues"] == []

def test_parse_llm_response_markdown():
    markdown_json = '```json\n{"score": 85, "summary": "Ok", "issues": []}\n```'
    result = parse_llm_response(markdown_json)
    assert result["score"] == 85

def test_detect_language():
    assert detect_language("app.py", "") == "python"
    assert detect_language("index.js", "") == "javascript"
    assert detect_language("component.tsx", "") == "typescript"
    # Fallback heuristics
    assert detect_language("", "def process(): pass") == "python"
