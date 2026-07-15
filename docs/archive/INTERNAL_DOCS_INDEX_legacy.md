# CyberShield Internal Docs

Internal engineering documentation for **CyberShield**.
This folder exists to help maintain, extend, debug, and ship the platform without descending into ritual chaos.

> Public-facing overview lives in the root `README.md`
> This docs folder is for developers, maintainers, reviewers, and future-you.

---

## Quick Navigation

### Live Deployments

| Service | URL |
| --- | --- |
| Frontend | [cyber-shield-eight.vercel.app](https://cyber-shield-eight.vercel.app) |
| Preview Frontend | [cyber-shield-nzeoni1oj-mystifys-projects.vercel.app](https://cyber-shield-nzeoni1oj-mystifys-projects.vercel.app) |
| Backend API | [cybershield-backend-inx9.onrender.com](https://cybershield-backend-inx9.onrender.com) |
| AI Service | [cybershield-ai-sm3o.onrender.com](https://cybershield-ai-sm3o.onrender.com) |

---

### Core Docs

| File | Purpose |
| --- | --- |
| `onboarding.md` | Setup + local development |
| `../public/SYSTEM_DESIGN.md` | Architecture + flow |
| `../public/SECURITY.md` | Security model + controls |
| `ROADMAP.md` | Future direction |
| `todo.md` | Task tracker |
| `logs.md` | Change history |
| `bugs.md` | Known issues + fixes |
| `qa-checklist.md` | Test matrix |
| `interview-pack.md` | Viva / interview prep |

---

## Release Preflight

Before any demo, preview handoff, or production deploy, run the API-target preflight in `onboarding.md`:

- Verify `VITE_API_URL` points to the intended backend host
- Confirm browser network requests hit that same host
- Validate `<VITE_API_URL>/system/health` returns `{"status":"ok"}`
- Run one authenticated `/reports/me` request and confirm expected filter query params are present

Reference: `onboarding.md` -> "Quick preflight before demo/release"

---

## Current Product State

CyberShield is in a **release-ready functional state** with live deployments.

## Implemented Pillars

```text
1. Protect     -> AI detection + incident reporting
2. Learn       -> Knowledge Hub + awareness content
3. Community   -> Forum + memes + videos
4. Govern      -> Admin moderation + observability
5. Engage      -> XP / coins / streak systems
```

---

## Module Status

---

## 1. Authentication and Identity

### Backend Auth Flows

- Register and login
- Email OTP verification
- OTP resend
- Forgot password
- Reset password
- JWT auth
- Role model:
  - USER
  - ADMIN
  - SUPER_ADMIN

### Frontend Identity Flows

- Login page
- Register page
- Verification page
- Protected route validation
- Settings page
- Profile page

---

## 2. AI Threat Detection

### Implemented

- FastAPI prediction service
- Backend proxy route
- Tiered outputs:

```text
SAFE
SUSPICIOUS
MALICIOUS
```

- Confidence scoring
- Explanation card UI
- Public access flow

### Planned

- ML model upgrade
- Historical scoring
- Explainability improvements

---

## 3. Incident Reporting

### Implemented Reporting Capabilities

- Threat report submission
- Severity levels
- File evidence upload
- Safe public feed
- Private owner-scoped reports
- Admin moderation and report views
- Pagination contract

### Frontend Pages

- Create report
- View reports
- Report details
- Dashboard integration

---

## 4. Knowledge Hub

### Implemented Knowledge Workflows

- Public approved articles
- User submissions
- Approval workflow
- Admin review queue

### Frontend Pages (Knowledge Hub)

- Articles list
- Detail page
- Submit article

---

## 5. Community Layer

### Forum

- Public read
- Authenticated posting
- Replies

### Video Hub

- Submission system
- Approved public feed
- Admin moderation

### Meme Hub

- Image upload
- Voting
- Auto-flagging
- Admin moderation
- Reward hooks

---

## 6. Gamification and Economy

### Implemented Economy Systems

- XP
- Levels
- Badges
- Streaks
- Coins
- Daily earn caps
- Spend controls (anti-spam)

### Integrated With

- Reports
- Meme actions
- Forum actions
- Mini games

---

## 7. Admin Governance

### Implemented Governance Tools

- Dashboard
- User list
- Promote and demote
- Suspend and unsuspend
- Report management
- Article moderation
- Meme moderation
- Video moderation
- Notifications
- Error logs

---

## 8. Observability

### Implemented Observability Tools

- Client-side error reporting
- Error log filters
- CSV export
- Health endpoint
- Version endpoint
- Uptime endpoint

---

## Architecture Summary

```text
React Client
   ->
Express API
   ->
MongoDB Atlas

Express API
   ->
FastAPI AI Service
```

### Responsibilities

| Layer | Responsibility |
| --- | --- |
| client | UI, routing, user flow |
| server | auth, APIs, validation, moderation |
| ai-service | classification engine |

More detail in `../public/SYSTEM_DESIGN.md`.

---

## Frontend Route Map

### Public

```text
/
/login
/register
/verify
/forgot-password
/reports
/ai
/articles
/articles/:id
/forum
/videos
/memes
```

### Protected User

```text
/dashboard
/profile
/settings
/create-report
/forum/create
/videos/submit
/memes/upload
/games
```

### Admin

```text
/admin
/admin/reports
/admin/users
/admin/articles
/admin/videos
/admin/memes
/admin/notifications
/admin/error-logs
```

### Error Routes

```text
/500
*
```

---

## Backend API Summary

### Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
POST /api/auth/resend-otp
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/validate
```

### Reports

```text
GET  /api/reports
GET  /api/reports/me
POST /api/reports
PUT  /api/reports/:id
```

### AI

```text
POST /api/ai/predict
```

### Forum API

```text
GET  /api/forum
POST /api/forum
POST /api/forum/:id/reply
```

### Articles

```text
GET  /api/articles
POST /api/articles
PUT  /api/articles/:id/status
```

### Admin API

```text
GET    /api/admin/stats
GET    /api/admin/users
PUT    /api/admin/promote/:id
PUT    /api/admin/suspend/:id
PUT    /api/admin/users/:id/unsuspend
DELETE /api/admin/users/:id
```

### System

```text
GET  /api/system/health
GET  /api/system/version
GET  /api/system/uptime
GET  /api/system/client-errors
GET  /api/system/client-errors/export
POST /api/system/client-errors
```

---

## Environment Reference

### Backend Env

```env
PORT=5000
MONGO_URI=
JWT_SECRET=
AI_SERVICE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
ENCRYPTION_KEY=
EMAIL_USER=
EMAIL_PASS=
EMAIL_MOCK=false
```

### Frontend Env

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Recommended Dev Workflow

### Start All

```bash
npm run dev
```

### Before Every Merge

```text
frontend runs
backend runs
build passes
no merge markers
auth works
key flows tested
```

---

## Current Priorities

### Short-Term

```text
1. Demo polish
2. Analytics visuals
3. Stronger onboarding
4. AI model improvements
5. Monitoring
```

### Medium-Term

```text
1. Search and filter upgrades
2. Better moderation workflows
3. Notification improvements
4. Better retention loops
```

---

## Tracking Files

| File | Use |
| --- | --- |
| `todo.md` | task progress |
| `logs.md` | implementation history |
| `bugs.md` | issues and fixes |
| `variables.md` | constants and routes |
| `context.md` | project scope |

---

## Maintainer Rules

```text
1. Update docs after meaningful changes
2. Keep controllers thin
3. Prefer reusable UI primitives
4. No random feature sprawl
5. Test before merge
```

---

## Internal Status Verdict

```text
Engineering maturity: strong student / junior+
Architecture quality: good
Scope control: historically chaotic, now improving
Deployment readiness: achieved
Portfolio value: high
```

---

## Suggested Next Focus

- Presentation quality
- Metrics dashboards
- Case study write-up
- Interview storytelling
- Selective polish over expansion

---

## Maintained By

@Mystify7777
