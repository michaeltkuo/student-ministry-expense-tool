# Student Ministry Expense Tool

Students snap a photo of a receipt, AI extracts the data, and an admin reviews submissions and exports a CSV for Concur expense reporting.

## CI Status

[![CI](https://github.com/michaeltkuo/student-ministry-expense-tool/actions/workflows/ci.yml/badge.svg)](https://github.com/michaeltkuo/student-ministry-expense-tool/actions/workflows/ci.yml)

## Prerequisites

- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.ai) installed and running

## Ollama Setup

```bash
ollama pull llava
```

## Setup

1. **Clone and configure:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env to set a strong ADMIN_PASSWORD and JWT_SECRET
   ```

2. **Install dependencies** (creates a Python venv in `backend/venv`):
   ```bash
    make install
    ```

## Create GitHub Repo and Push

The repository `michaeltkuo/student-ministry-expense-tool` has been created.  
From the project root, run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:michaeltkuo/student-ministry-expense-tool.git
git push -u origin main
```

## Running Locally

Open **two terminals**:

```bash
# Terminal 1 — Backend (uses backend/venv automatically)
make backend

# Terminal 2 — Frontend
make frontend
```

- Student submit page: http://localhost:5173
- Admin portal: http://localhost:5173/admin/login

## Mobile Testing

Find your local IP address:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Then open `http://YOUR_IP:5173` on your phone (must be on the same WiFi network).

## Admin Access

Go to http://localhost:5173/admin/login and enter the password from `backend/.env` (default: `changeme`).

## Project Structure

```
backend/    FastAPI + SQLite backend
frontend/   React + TypeScript + Vite frontend
```

## Features

- 📸 Mobile-friendly receipt photo capture
- 🤖 AI-powered data extraction (Ollama llava)
- ✏️ Editable extracted data before submission
- 📊 Admin dashboard with filtering and bulk export
- 📁 CSV export compatible with Concur expense reporting
- 🏛️ Ministry management


## Testing

Run all backend unit/integration tests:

```bash
cd backend
source venv/bin/activate
pytest -q
```

Run frontend unit tests (Vitest):

```bash
cd frontend
npm run test
```

Run frontend end-to-end tests (Playwright):

```bash
cd frontend
npx playwright install --with-deps chromium
npm run test:e2e
```

## GitHub Actions

CI is configured in `.github/workflows/ci.yml` and runs on every push/PR.

- Backend job: installs Python deps and runs `pytest -q`
- Frontend job: installs Node deps, runs `npm run test`, then `npm run build`
- Playwright job: installs Chromium and runs `npm run test:e2e`

If you already have local dev servers running on ports `8000` or `5173`, stop them before running Playwright so the test runner can start clean isolated servers.
