# CodeSage — AI Code Review Agent

A full-stack AI-powered code review tool. Paste or upload Python / JavaScript code and get instant analysis covering bugs, security vulnerabilities, performance issues, and style violations — with severity ratings and actionable fix suggestions.

---

## Tech Stack

| Layer    | Tech                                              |
|----------|---------------------------------------------------|
| Frontend | React 18 + Vite + CSS Modules                     |
| Styling  | Custom design system (DM Mono + Syne fonts)       |
| Syntax   | highlight.js                                      |
| Backend  | FastAPI + async SQLAlchemy + aiomysql             |
| Database | MySQL 8                                           |
| AI       | Groq (llama3-70b) or OpenAI (gpt-4o-mini)         |

---

## Project Structure

```
code-review-agent/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── create_db.py             # Script to initialize database
│   ├── codesage.db             # Local SQLite fallback database
│   ├── models/
│   │   ├── models.py            # SQLAlchemy ORM models
│   │   └── database.py          # Async DB engine & session
│   ├── routers/
│   │   ├── review.py            # POST /api/review
│   │   └── history.py           # GET /api/history, /api/stats
│   └── services/
│       └── llm_service.py       # LLM calls + demo fallback
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css            # Global design tokens
│       ├── Requirements/
│       │   └── Language.js      # Highlight.js definitions mapping
│       ├── components/
│       │   ├── CodeEditor.jsx   # Syntax-highlighted editor
│       │   ├── IssueCard.jsx    # Expandable issue cards
│       │   ├── ReviewResults.jsx # Component rendering parsed issues
│       │   └── ScoreRing.jsx    # Animated SVG score ring
│       ├── pages/
│       │   ├── AboutPage.jsx    # Project info & team details
│       │   ├── Navbar.jsx       # Application navigation header
│       │   ├── ReviewPage.jsx   # Main review workspace
│       │   ├── HistoryPage.jsx  # Past reviews list view
│       │   ├── StatisticDashboard.jsx # Analytics and stats dashboard
│       │   └── ReviewDetailPage.jsx # Individual review detailed view
│       └── utils/
│           └── exportPdf.js     # Code logic to export reviews to PDF
└── schema.sql                   # MySQL schema
```

---

## Setup

### 1. MySQL

```bash
mysql -u root -p < schema.sql
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill in your env
cp .env.example .env
# Edit .env — set DATABASE_URL and at least one of GROQ_API_KEY / OPENAI_API_KEY

uvicorn main:app --reload --port 8000
```

> **No API key?** The app runs in **demo mode** automatically, returning realistic sample issues so you can explore the full UI.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

| Method | Path                  | Description                        |
|--------|-----------------------|------------------------------------|
| POST   | `/api/review`         | Submit code for review             |
| GET    | `/api/history`        | List all past reviews              |
| GET    | `/api/history/{id}`   | Get detailed review with issues    |
| GET    | `/api/stats`          | Aggregate stats across all reviews |

### POST /api/review — Request body

```json
{
  "code": "def foo(): pass",
  "filename": "main.py",
  "language": "python"
}
```

### Response

```json
{
  "review_id": 1,
  "score": 62,
  "summary": "...",
  "total_issues": 5,
  "critical_count": 2,
  "warning_count": 2,
  "info_count": 1,
  "issues": [
    {
      "category": "security",
      "severity": "critical",
      "line_number": 5,
      "title": "SQL Injection Vulnerability",
      "description": "...",
      "fix_suggestion": "...",
      "code_before": "...",
      "code_after": "..."
    }
  ]
}
```

---

## Features

- **Multi-category analysis** — bugs, security, performance, style
- **Severity levels** — critical / warning / info with colour coding
- **Expandable issue cards** — before/after code diffs with syntax highlighting
- **Score ring** — animated 0–100 quality score
- **Filter panel** — filter by category and severity simultaneously
- **Review history** — full searchable history with stats dashboard
- **Language detection** — auto-detects Python vs JavaScript
- **Demo mode** — works without an API key for UI exploration
- **Drag & drop** — drop `.py` / `.js` / `.ts` files directly onto the editor

---

## Environment Variables

| Variable       | Description                                  |
|----------------|----------------------------------------------|
| `DATABASE_URL` | MySQL connection string (aiomysql driver)     |
| `GROQ_API_KEY` | Groq API key (recommended, faster + cheaper) |
| `OPENAI_API_KEY` | OpenAI API key (fallback)                  |

---

## Getting a Free API Key

**Groq** (recommended — free tier, very fast):
1. Sign up at [console.groq.com](https://console.groq.com)
2. Create an API key
3. Add to `.env` as `GROQ_API_KEY=gsk_...`
