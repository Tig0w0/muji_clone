# MUJI Clone Backend

FastAPI + Supabase PostgreSQL backend for the clone project.

## Data flow

`src/json/*.json` files are import sources only. The React app never reads them at runtime.

1. `app.seed` loads the source JSON into PostgreSQL.
2. FastAPI reads catalog data from PostgreSQL.
3. React loads `/api/catalog/bootstrap` from FastAPI before rendering.

## Local setup

1. Create a virtual environment: `python -m venv .venv`
2. Install dependencies: `.venv\Scripts\pip install -r requirements.txt`
3. Copy `.env.example` to `.env`.
4. In Supabase, open **Connect > Session pooler** and copy the connection string.
5. Replace `[YOUR-PASSWORD]` and save it as `DATABASE_URL` in `.env`.
6. Load an empty database: `.venv\Scripts\python -m app.seed`
7. Start the API: `.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000`

The seed command refuses to overwrite existing seed data by default.
Use `python -m app.seed --reset` only when you intentionally want to replace the catalog tables.
