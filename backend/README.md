# MUJI Clone Backend

FastAPI + MySQL backend for the clone project.

## Data flow

`src/json/*.json` files are import sources only. The React app never reads them at runtime.

1. `app.seed` loads the source JSON into MySQL.
2. FastAPI reads catalog data from MySQL.
3. React loads `/api/catalog/bootstrap` from FastAPI before rendering.

## Local setup

1. Create a virtual environment: `python -m venv .venv`
2. Install dependencies: `.venv\Scripts\pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and set the MySQL credentials.
4. Load an empty database: `.venv\Scripts\python -m app.seed`
5. Start the API: `.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000`

The seed command creates the configured database if needed. It refuses to overwrite existing seed data by default.
Use `python -m app.seed --reset` only when you intentionally want to replace the catalog tables.
