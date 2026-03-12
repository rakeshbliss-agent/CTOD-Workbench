# CTOD Prototype - Part 1

This is the Part 1 foundation for a real CTOD curation prototype.

## What Part 1 includes
- Project creation
- PDF upload and persistence
- CTOD field/schema setup
- SQLite-backed backend
- Frontend dashboard wired to backend APIs

## Repo structure
- `frontend/` - Next.js UI
- `backend/` - FastAPI service
- `data/` - SQLite DB, uploaded PDFs, and future exports

## Run locally

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
Create `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Then run:
```bash
cd frontend
npm install
npm run dev
```

## Suggested Render deployment
Deploy as two services:

### Backend service
- Runtime: Python 3
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend service
- Runtime: Node
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Environment variable: `NEXT_PUBLIC_API_BASE_URL=https://<your-backend-service>.onrender.com`

## What comes in Part 2
- PDF text extraction
- Evidence snippets and page references
- Draft extraction results by section
- Review workbench
