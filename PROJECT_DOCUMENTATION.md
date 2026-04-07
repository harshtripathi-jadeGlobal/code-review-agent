# CodeSage Project Documentation

> An Enterprise-Grade AI-Powered Code Review Agent

## Executive Summary

**CodeSage** is a full-stack, AI-driven code analysis tool designed to streamline developer workflows. By leveraging advanced Large Language Models (LLMs) such as **Llama-3-70b (via Groq)**, **GPT-4o-mini (via OpenAI)**, and **Internal Corporate LLMs**, CodeSage performs near-instantaneous static analysis on Python and JavaScript/TypeScript code. The system enhances its intelligence via a local **Retrieval-Augmented Generation (RAG)** pipeline allowing it to cross-reference multi-file repositories for advanced context-aware reviews. It identifies bugs, security vulnerabilities, performance bottlenecks, and style violations—returning them as dynamically parsed, actionable items sorted by severity.

It features a high-performance **FastAPI** backend supporting asynchronous operations, paired with a modern, responsive **React 18** frontend, rendering beautiful interfaces with expandable issue diff-cards and real-time interactive score metrics.

---

## 1. System Architecture

The project employs a robust three-tier architecture augmented by local file indexing. It separates client, application, and data layers, deeply integrating with external LLM inference providers and internal vector stores.


![Architecture Diagram](diagrams/architecture%20diagram.png)

### Core Technologies
- **Frontend**: React 18, Vite, React Router, Axios, CSS Modules (Custom Design System).
- **Backend**: FastAPI, Pydantic, SQLAlchemy 2.0 (Async), Uvicorn.
- **Databases**: MySQL 8.0 (Relation persistence), ChromaDB (Vector Store for RAG).
- **AI Processing**: Groq (Llama-3-70b), OpenAI, Internal Llama Model integration, SentenceTransformers embeddings.

---

## 2. End-to-End Data Flow

The following sequence diagram maps the journey of a user's code submission from the browser to the database and back.


![Sequence Diagram](diagrams/sequence%20diagram.png)

---

## 3. Database Schema (Entity Relationship)

CodeSage stores submissions and their structured review outputs relationally. All references cascade upon deletion.


![ER Diagram](diagrams/er%20diagram.png)

---

## 4. Component Breakdown

### Frontend Components (`/frontend/src/`)
- **App.jsx**: The root component orchestrating `react-router-dom` and pre-fetching global history/stats.
- **Pages**:
  - `ReviewPage.jsx`: The primary dashboard capturing input via code editor or file dropping.
  - `HistoryPage.jsx` & `ReviewDetailPage.jsx`: Views to browse past submissions and drill down into prior AI feedback.
  - `StatisticDashboard.jsx`: Granular dashboard tracking issue category frequencies and overall code quality averages.
- **Components/UI Elements**:
  - `CodeEditor.jsx`: A high-performance text area with `highlight.js` syntax layering.
  - `IssueCard.jsx`: Reusable container showing issue details, severity badges, and specific line diffs (`code_before` / `code_after`).
  - `ScoreRing.jsx`: An animated SVG ring transitioning colors dynamically based on the final quality score (0-100).

### Backend Modules (`/backend/`)
- **`main.py`**: The application gateway. Defines CORS policies and mounts routers using the `lifespan` context manager for database initialization.
- **`routers/review.py`**: Handles incoming code and context ingestion, pushes to standard pipelines, manages relational database inserts for raw code and returned structured analysis.
- **`routers/history.py`**: Interfaces with the database to serve aggregate stats (`/api/stats`) and paginated historical entries.
- **`services/llm_service.py`**: The core AI logic engine. It constructs prompts integrating RAG context, enforces strict JSON formats, handles network requests to `groq`, `openai`, or an Internal LLM `generate` endpoint. Fallback strategies ("demo mode") handle missing keys.
- **`services/rag_service.py`**: Manages the ingestion of local repositories into ChromaDB and retrieval of cross-file context (similar code search) based on incoming developer code.
- **`models/models.py` & `models/database.py`**: Manages the `SQLAlchemy` async declarative base, session pools, and exact schema representations mapped to MySQL.

---

## 5. API Reference

The backend provides a RESTful contract ensuring straightforward integrations.

### `POST /api/repo/ingest`
Ingests a local repository folder to be used for LLM context via RAG.
* **Payload**:
  ```json
  {
    "repo_path": "C:/path/to/project/folder"
  }
  ```
* **Response**: Returns a success confirmation matching `{ "message": "Ingested 15 files successfully" }`

### `POST /api/review`
Submits code for static AI review with cross-referencing capabilities.
* **Payload**:
  ```json
  {
    "code": "def process(): return payment_client()",
    "filename": "app.py"
  }
  ```
* **Response**: Returns a structured `Review` object alongside arrays of typed `Issues`.

### `GET /api/history`
Fetches a chronological list of past analysis runs.

### `GET /api/history/{id}`
Returns details for a single specific historical submission and re-hydrates its issue payload.

### `GET /api/stats`
Returns aggregated data used for dashboards (average score, total issues handled by category).

---

## 6. Scalability & Best Practices Leveraged

1. **Strict AI Prompt Engineering**: LLM service enforces strict shape validation (`Prompt -> JSON -> Pydantic`), neutralizing hallucination risks and removing markdown wrapping.
2. **Asynchronous Throughput**: AI queries block on external I/O. The choice of `FastAPI` + `httpx.AsyncClient` + `aiomysql` prevents thread-pool starvation allowing high concurrency without node scaling.
3. **Resiliency**: Built-in fallback capabilities (Demo mode kicks in transparently on network failure or missing configuration).
4. **Graceful Error Handling**: Parsing pipelines include fallback regex extractors to salvage slightly malformed AI JSON.

---

