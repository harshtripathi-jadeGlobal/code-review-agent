# Project Q&A: CodeSage (AI Code Review Agent)

This document provides high-value, critical analysis of the architectural and technical decisions made for the Code Review Agent project.

## 1. Architectural & Tech Stack Decisions

**Q: Why was FastAPI chosen for the backend over Flask or Django?**
* **Concurrency & Async Support:** The core bottleneck of this application is network I/O—specifically, waiting for external or internal LLM endpoints (Groq, OpenAI, Llama) to generate inferences. FastAPI natively supports `async`/`await` and uses `Starlette` underneath, which handles thousands of concurrent LLM requests without blocking the main OS thread (unlike traditional synchronous frameworks like Flask or Django).
* **Automatic Data Validation:** The app requires strict parsing of complex JSON outputs from LLMs. FastAPI's deep integration with Pydantic ensures that user code submissions and nested LLM issue schemas are validated instantly, throwing 422 errors automatically if data is malformed.
* **Speed:** It is one of the fastest Python frameworks available, matching NodeJS limits, which is highly optimal for an intermediate microservice sitting between a UI and an LLM.

**Q: Why React with Vite over Next.js?**
* **Deployment Simplicity:** Since the core application relies heavily on dynamic, client-side interactions (viewing syntax highlighting, real-time fetching), server-side rendering (SSR) brings unnecessary overhead. Vite provides ultra-fast Hot Module Replacement (HMR) for development and produces a tiny, statically hostable bundle that eliminates the need for a secondary Node server to handle front-end rendering.

**Q: How does the application handle LLM Provider switching so cleanly?**
* **Strategy Pattern:** The backend uses a router pattern where `run_review` acts as a coordinator. It reads environment variables at runtime (`LLM_PROVIDER`, `GROQ_API_KEY`) and routes the prompt generation payload to specialized client functions (`call_internal_llama`, `call_groq`, etc.). This isolates vendor-specific configurations—like custom headers, endpoint URIs (e.g., `/generate` vs `/v1/chat/completions`), and SSL verifications—without polluting the core application logic.

---

## 2. Database Design & Optimization

**Q: How normalized is the database architecture?**
The database strictly adheres to **Third Normal Form (3NF)**. Instead of dumping a giant JSON blob of LLM results into a single table, the schema is decomposed into three distinct relational tables:
1. **`submissions` table:** Stores the raw context (filename, language, the code string).
2. **`reviews` table:** Holds a foreign key to the submission and stores aggregated metadata (score, total issue counts, summary limits).
3. **`issues` table:** Holds a foreign key to the review and stores individual, atomic issue instances (severity, category, line number, fix suggestions).

*Why this is good:* If you want to query "How many `security` issues were found across all Python submissions this week?" the relational layout makes this a lightning-fast `JOIN` operation `O(1)` index scan rather than requiring slow, intensive parsing of JSON text columns. 

**Q: How optimized is the database for scale?**
* **Current State:** The database uses an abstract `SQLAlchemy` ORM layer, meaning it currently runs seamlessly on local memory/SQLite for development but can instantly scale up to PostgreSQL in production without changing any code.
* **O(1) Indexed Lookups:** All primary and foreign keys (`id`, `submission_id`, `review_id`) are explicitly mapped as `index=True` in the SQLAlchemy models. This enforces B-Tree index creation at the database engine level, turning lookup operations (like fetching all issues for a specific review) from an expensive `O(N)` table scan down to `O(log N)` or near `O(1)`.
* **Cascade Deletions:** The tables are tied together with `cascade="all, delete"`. Deleting a submission automatically sweeps and deletes the review and all underlying issues efficiently at the DB level, preventing orphaned ghost records without requiring multiple trips from the Python server.

---

## 3. API Endpoints

**Q: What is the current footprint of the API, and is it RESTful?**
The REST API footprint is kept deliberately lean, minimizing the surface area for security flaws. It features exactly four endpoints:

1. **`POST /api/review`**: Triggers the entire execution pipeline. It accepts code, hits the selected LLM, inserts into three distinct DB tables, and returns the aggregated data.
2. **`GET /api/history`**: Retrieves a paginated/chronological list of past submissions for the UI dashboard.
3. **`GET /api/history/{review_id}`**: Retrieves deep analytics and all 1-to-many issues for a specific historical review. 
4. **`GET /api/stats`**: Aggregates mathematical data (average scores, severity ratios) dynamically using SQLAlchemy aggregation functions.

**Q: Why separate `/stats` from `/history`?**
* **Bandwidth Optimization:** The `/history` endpoint needs to carry relatively heavy string payloads (file names, summaries). Calculating aggregates like overall score averages and severity counts requires hitting different columns. By decoupling `/stats`, we shrink the JSON weight payload over the wire and allow the React frontend to fetch and render the statistical overview widgets instantly and concurrently via `Promise.all()`, rather than waiting for heavy code strings to download.
