# CyberShield Onboarding Guide

This guide helps a new contributor run the full stack locally, including the AI service.

## 1) What runs in this project

CyberShield has 3 runtime apps:

1. Client (React + Vite) on port 3000
1. Server (Node + Express + MongoDB) on port 5000
1. AI Service (FastAPI) on port 8000

Important:

- Manual startup requires all 3 apps in separate terminals.
- Launcher scripts (`npm run dev`, `scripts/start-all.ps1`, `scripts/start-all.cmd`, `scripts/start-all.sh`) can start all 3 together.

## 2) Prerequisites

Install these first:

- Node.js 18+ (LTS recommended)
- npm
- Python 3.10+ (3.11+ recommended)
- MongoDB connection string (Atlas or local)

Optional but useful:

- Git
- VS Code

## 3) Project setup

From the repository root:

1. Install server dependencies.

```powershell
cd server
npm install
```

1. Install client dependencies.

```powershell
cd ../client
npm install
```

1. Prepare Python environment for AI service.

```powershell
cd ../ai-service
python -m venv .venv
```

1. Activate the virtual environment.

```powershell
.\.venv\Scripts\Activate.ps1
```

1. Install AI service packages.

```powershell
pip install -r requirements.txt
```

## 4) Server environment configuration

Create or update `server/.env` with these keys:

- `PORT=5000`
- `MONGO_URI=<your_mongodb_connection_string>`
- `JWT_SECRET=<your_secret>`
- `AI_SERVICE_URL=http://localhost:8000`
- `ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173`
- `DEBUG_REQUEST_LOGS=false`
- `AUTH_VERIFY_OTP_WINDOW_MS=900000`
- `AUTH_VERIFY_OTP_MAX=10`
- `AUTH_RESET_PASSWORD_WINDOW_MS=3600000`
- `AUTH_RESET_PASSWORD_MAX=5`
- `AI_PREDICT_WINDOW_MS=900000`
- `AI_PREDICT_MAX=50`
- `ENCRYPTION_KEY=<your_64_char_hex_key>`
- `EMAIL_MOCK=true`

Copy-paste template:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
AI_SERVICE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
DEBUG_REQUEST_LOGS=false
AUTH_VERIFY_OTP_WINDOW_MS=900000
AUTH_VERIFY_OTP_MAX=10
AUTH_RESET_PASSWORD_WINDOW_MS=3600000
AUTH_RESET_PASSWORD_MAX=5
AI_PREDICT_WINDOW_MS=900000
AI_PREDICT_MAX=50
ENCRYPTION_KEY=your_64_char_hex_key
EMAIL_MOCK=true
```

Email notes:

- Use `EMAIL_MOCK=true` for local development to avoid SMTP setup.
- If you want real OTP/reset emails, configure `EMAIL_USER` and `EMAIL_PASS` too.

Optional email config for real inbox delivery:

```env
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

## 5) Start the full stack

You can use a launcher or manual 3-terminal startup.

Recommended startup path by OS:

- Windows: `scripts/start-all.ps1`
- macOS/Linux: `bash scripts/start-all.sh`
- Fallback for Windows CMD environments: `scripts/start-all.cmd`

Recommended CI/CD approach:

- Start each service explicitly rather than using the multi-process launcher.
- Use `npm --prefix server run dev`, `npm --prefix client run build`, and the AI service uvicorn command in separate jobs or steps.
- This keeps logs, health checks, and failures isolated per service.

Launcher options:

- Windows PowerShell: `scripts/start-all.ps1`
- Windows CMD: `scripts/start-all.cmd`
- macOS/Linux: `bash scripts/start-all.sh`
- Cross-platform node launcher: `npm run dev` from repo root

Manual terminal startup:

Terminal A (server):

```powershell
cd server
npm run dev
```

Terminal B (client):

```powershell
cd client
npm run dev
```

Terminal C (ai-service):

```powershell
cd ai-service
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 6) Verify everything is healthy

1. AI service health:

- Open `http://localhost:8000/`
- Expected: `{"message":"AI Service Running"}`

1. Server health:

- Open `http://localhost:5000/api/system/health`
- Expected: `{"status":"ok"}`

Optional root check:

- Open `http://localhost:5000/`
- Expected: `API is running...`

1. Client:

- Open `http://localhost:3000`

1. AI flow from app:

- Go to AI detector page and submit text
- Expect one of: `SAFE`, `SUSPICIOUS`, `MALICIOUS`

## 7) Auth quick map

- Register: creates account + OTP email
- Verify OTP: activates account
- Resend OTP: sends new OTP and resets attempt counter
- Forgot password: sends reset token by email
- Reset password: applies new password with email + token

## 8) How AI integration works

- Client calls Node server API.
- Server endpoint `/api/ai/predict` forwards text to AI service `/api/predict`.
- If AI service is down or `AI_SERVICE_URL` is wrong, server returns AI service failed.
- Backend health and diagnostics endpoints are under `/api/system/*` (`health`, `version`, `uptime`).

## 9) Route ownership map

- Frontend route constants and nav section paths are centralized in `client/src/routes/routes.config.js`.
- Update route config first, then consume constants in routing and navigation components.

## 10) Common startup issues and fixes

Issue: AI service failed in server logs

- Cause: AI service not running, wrong `AI_SERVICE_URL`, or wrong port.
- Fix: Start FastAPI service and verify `http://localhost:8000/`.

Issue: DB error on server start

- Cause: invalid or missing `MONGO_URI`.
- Fix: update `server/.env` with a working MongoDB connection string.

Issue: OTP or reset-email errors while testing auth

- Cause: SMTP not configured.
- Fix: set `EMAIL_MOCK=true` in `server/.env` for local onboarding.

Issue: Client cannot call backend

- Cause: server not running on port 5000.
- Fix: run `npm run dev` in `server` and confirm `http://localhost:5000/`.

Issue: UI works but data looks wrong or filters appear ignored

- Cause: frontend is calling the wrong backend host (stale/incorrect `VITE_API_URL`).
- Fix: confirm client env points to intended API base and verify `GET /api/system/health` on that same host.

Quick preflight before demo/release:

- Check `client/.env` and deployed environment variables for `VITE_API_URL`.
- Open browser network tab and confirm requests target the expected host.
- Hit `<VITE_API_URL>/system/health` and confirm response is `{"status":"ok"}`.
- Run one authenticated report request (`/reports/me`) and confirm filters are present in query string.

## 11) First-day sanity checklist

- Server dependencies installed
- Client dependencies installed
- AI venv created and activated
- AI packages installed
- `server/.env` configured
- `client/.env` API host verified (`VITE_API_URL`)
- Server running on 5000
- Client running on 3000
- AI service running on 8000
- AI detector returns classification successfully
- Forgot-password flow sends token (or logs mock email)

## 12) Recommended daily workflow

1. Start AI service first
1. Start server second
1. Start client last
1. Keep all 3 terminals active while developing

## 13) Quick copy-paste startup pack

Use this when dependencies are already installed.

Terminal A (server):

```powershell
cd server
npm run dev
```

Terminal B (client):

```powershell
cd client
npm run dev
```

Terminal C (ai-service):

```powershell
cd ai-service
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 14) One-command startup (Windows)

From the repository root, run one of these:

```powershell
.\start-dev.ps1
```

or:

```cmd
start-dev.cmd
```

What it does:

- Opens 3 separate PowerShell windows
- Starts server (`npm run dev`)
- Starts client (`npm run dev`)
- Starts AI service (`uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`)

To stop all services, close each service window (or press Ctrl+C in each).
