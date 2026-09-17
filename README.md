# MUJI Clone

React로 구현한 MUJI 온라인 스토어 클론 프로젝트입니다.
프론트엔드는 GitHub Pages, API는 Render의 FastAPI, 데이터베이스는 Supabase PostgreSQL을 사용합니다.

## Architecture

```text
GitHub Pages (React)
        ↓ REST
Render (FastAPI)
        ↓ SQLAlchemy
Supabase (PostgreSQL)
```

## Local frontend

```bash
npm install
npm start
```

기본 API 주소는 `http://127.0.0.1:8000`이며, 배포 시 `REACT_APP_API_BASE_URL`로 Render API 주소를 주입합니다.

## Local backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python -m app.seed
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

`backend/.env`에는 Supabase Session Pooler용 `DATABASE_URL`과 `FRONTEND_ORIGIN`이 필요합니다.
자세한 내용은 `backend/README.md`를 참고하세요.

## Verification

```bash
npm test -- --watchAll=false
npm run build
```

배포 설정은 `.github/workflows/deploy-pages.yml`과 `render.yaml`에 있습니다.
이 저장소는 학습 및 포트폴리오 목적의 클론 프로젝트입니다.
