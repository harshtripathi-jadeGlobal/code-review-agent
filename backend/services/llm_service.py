import httpx
import json
import re
import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Internal LLM Environment Config
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "").lower()
LLAMA_BASE_URL = os.getenv("LLAMA_BASE_URL")
LLAMA_MODEL = os.getenv("LLAMA_MODEL")
raw_ssl = os.getenv("LLAMA_VERIFY_SSL", "true")
LLAMA_VERIFY_SSL = raw_ssl.lower() in ("true", "yes", "1", "t") if raw_ssl else True

REVIEW_PROMPT = """You are a senior software engineer performing a thorough code review.
Analyze the following {language} code and return ONLY a valid JSON object (no markdown, no explanation).

The JSON must follow this exact structure:
{{
  "issues": [
    {{
      "category": "bug" | "security" | "performance" | "style",
      "severity": "critical" | "warning" | "info",
      "line_number": <integer or null>,
      "title": "<short title>",
      "description": "<detailed explanation of the problem>",
      "fix_suggestion": "<clear actionable fix>",
      "code_before": "<problematic code snippet>",
      "code_after": "<fixed code snippet>"
    }}
  ],
  "score": <integer 0-100, overall code quality>,
  "summary": "<2-3 sentence overall assessment>"
}}

Code to review:
```{language}
{code}
```

Return only the JSON object. No markdown fences. No extra text."""

async def call_internal_llama(code: str, language: str) -> dict:
    prompt = REVIEW_PROMPT.format(language=language, code=code)
    
    # Using /generate payload format
    base_url = LLAMA_BASE_URL if LLAMA_BASE_URL else ""
    endpoint = f"{base_url.rstrip('/')}/generate"
    
    async with httpx.AsyncClient(timeout=120, verify=LLAMA_VERIFY_SSL) as client:
        resp = await client.post(
            endpoint,
            json={
                "model": LLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1
                }
            },
        )
        print("INTERNAL LLM STATUS:", resp.status_code)
        resp.raise_for_status()
        
        data = resp.json()
        
        content = data.get("response") or data.get("generated_text") or data.get("text") or str(data)
        return parse_llm_response(content)


async def call_groq(code: str, language: str) -> dict:
    prompt = REVIEW_PROMPT.format(language=language, code=code)
    
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",  # current supported model
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "max_tokens": 3000,
            },
        )

        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        return parse_llm_response(content)


async def call_openai(code: str, language: str) -> dict:
    prompt = REVIEW_PROMPT.format(language=language, code=code)
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "max_tokens": 3000,
            },
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        return parse_llm_response(content)


def parse_llm_response(content: str) -> dict:
    # Strip markdown fences if present
    content = re.sub(r"```json\s*", "", content)
    content = re.sub(r"```\s*", "", content)
    content = content.strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # Attempt to extract JSON object
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError("Could not parse LLM response as JSON")


def detect_language(filename: str, code: str) -> str:
    if filename:
        ext = filename.rsplit(".", 1)[-1].lower()
        mapping = {
            "py": "python", "js": "javascript", "ts": "typescript",
            "jsx": "javascript", "tsx": "typescript",
        }
        if ext in mapping:
            return mapping[ext]
    # Heuristic fallback
    if "def " in code or "import " in code and "from " in code:
        return "python"
    return "javascript"


async def run_review(code: str, language: str) -> dict:
    if LLM_PROVIDER:
        return await call_internal_llama(code, language)
    elif GROQ_API_KEY:
        return await call_groq(code, language)
    elif OPENAI_API_KEY:
        return await call_openai(code, language)
    else:
        # Demo mode - return sample issues
        return demo_review(code, language)


# demo review for testing
def demo_review(code: str, language: str) -> dict:
    return {
        "score": 62,
        "summary": "The code has several issues including potential security vulnerabilities, performance bottlenecks, and style inconsistencies. Addressing the critical issues should be the priority.",
        "issues": [
            {
                "category": "security",
                "severity": "critical",
                "line_number": 5,
                "title": "SQL Injection Vulnerability",
                "description": "User input is directly interpolated into the SQL query string without sanitization or parameterization. An attacker can manipulate the query to access or destroy data.",
                "fix_suggestion": "Use parameterized queries or an ORM to handle user input safely.",
                "code_before": 'query = f"SELECT * FROM users WHERE id = {user_id}"',
                "code_after": 'query = "SELECT * FROM users WHERE id = %s"\ncursor.execute(query, (user_id,))'
            },
            {
                "category": "bug",
                "severity": "critical",
                "line_number": 12,
                "title": "Unhandled Exception",
                "description": "The function does not handle the case where the database connection fails, which will cause an unhandled exception and crash the application.",
                "fix_suggestion": "Wrap the database call in a try-except block and handle connection errors gracefully.",
                "code_before": "result = db.execute(query)",
                "code_after": "try:\n    result = db.execute(query)\nexcept Exception as e:\n    logger.error(f'DB error: {e}')\n    return None"
            },
            {
                "category": "performance",
                "severity": "warning",
                "line_number": 23,
                "title": "N+1 Query Problem",
                "description": "A database query is being executed inside a loop. For N items this produces N+1 total queries, which will degrade performance significantly as data grows.",
                "fix_suggestion": "Batch the query outside the loop using an IN clause or a JOIN.",
                "code_before": "for item in items:\n    user = db.get_user(item.user_id)",
                "code_after": "user_ids = [item.user_id for item in items]\nusers = db.get_users_batch(user_ids)"
            },
            {
                "category": "style",
                "severity": "info",
                "line_number": 31,
                "title": "Missing Type Annotations",
                "description": "Functions lack type annotations, making it harder to understand expected inputs/outputs and reducing IDE support and static analysis effectiveness.",
                "fix_suggestion": "Add type hints to function parameters and return values.",
                "code_before": "def process_data(data, config):\n    return data",
                "code_after": "def process_data(data: list[dict], config: dict) -> list[dict]:\n    return data"
            },
            {
                "category": "security",
                "severity": "warning",
                "line_number": 8,
                "title": "Hardcoded Secret Key",
                "description": "A secret key is hardcoded directly in the source code. This exposes the secret if the code is shared or version controlled.",
                "fix_suggestion": "Move secrets to environment variables and load them using os.environ.",
                "code_before": 'SECRET_KEY = "my-super-secret-key-123"',
                "code_after": 'import os\nSECRET_KEY = os.environ["SECRET_KEY"]'
            }
        ]
    }
