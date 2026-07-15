# CyberShield Deployment Guide

## Runtime Topology
- Frontend: Vercel (client)
- Backend API: Render (server)
- AI Service: Render (ai-service)
- TrustScan Worker: planned deployment target (Render worker or equivalent)

## Deployment Order
1. Deploy backend API.
2. Deploy AI service.
3. Set frontend environment variables to backend host.
4. Deploy frontend.
5. Run health checks and smoke tests.

## Environment Variables

### Frontend (Vercel)
- VITE_API_URL
- optional frontend-only feature flags

### Backend (Render)
- NODE_ENV
- PORT
- MONGO_URI
- JWT_SECRET
- OTP_HASH_SECRET
- ENCRYPTION_KEY
- ALLOWED_ORIGINS
- AI_SERVICE_URL
- GOOGLE_SAFE_BROWSING_API_KEY
- EMAIL_USER
- EMAIL_PASS
- EMAIL_MOCK
- DEBUG_REQUEST_LOGS
- rate limit tuning variables

### AI Service (Render)
- PORT
- model/runtime configuration variables

### Planned Worker
- queue connection settings
- job concurrency
- retry and timeout settings

## Health Checks
- GET /api/system/health
- GET /api/system/version
- GET /api/system/uptime

## Release Verification Checklist
- frontend points to intended backend host
- backend can reach AI service
- authenticated report listing works (/api/reports/me)
- rate-limit behavior verified for protected endpoints
- logs are readable and do not expose secrets

## Rollback Strategy
- keep last known good deployment for frontend and backend
- rollback backend first if API contract regression appears
- rollback frontend if API link mismatch or severe client regression appears
- annotate docs/CHANGELOG.md with rollback reason
