# CyberShield

CyberShield is a trust intelligence platform that helps users assess suspicious digital targets, report incidents, and act with clearer risk context.

## V3 Focus

CyberShield is now documentation-first around TrustScan V3:

- passive URL trust scanning
- explainable risk scoring
- async scan lifecycle
- governance and safe-use policy controls

## Live Services

| Service | URL |
| --- | --- |
| Frontend | https://cyber-shield-eight.vercel.app |
| Backend API | https://cybershield-backend-inx9.onrender.com |
| AI Service | https://cybershield-ai-sm3o.onrender.com |

## Core Capabilities

- AI-assisted scam triage
- Incident report submission and moderation
- Knowledge and awareness content
- Admin governance and system observability
- TrustScan architecture and policy framework (V3)

## TrustScan Proof

- Real TLS certificate checks
- Security header analysis
- DNS and domain intelligence
- Reputation signal checks (Google Safe Browsing)
- Historical scan reports
- Public shareable reports
- PDF export for finished TrustScan reports
- Confidence-aware score calibration
- Evidence timeline and factor breakdown
- Explainable scoring
- 55 automated backend tests passing
- CI on push / PR

## Architecture Snapshot

```text
Frontend (React + Vite)
   -> Backend API (Express)
      -> MongoDB
      -> AI Service (FastAPI)
      -> TrustScan Worker (planned)
```

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- AI: FastAPI (Python)
- Security controls: JWT, Helmet, CORS allowlist, sanitization middleware, route-level validation, rate limits

## Documentation Map

### Product

- docs/product/VISION.md
- docs/product/ROADMAP.md
- docs/product/TRUSTSCAN_PRODUCT_SPEC.md

### Engineering

- docs/engineering/SYSTEM_DESIGN.md
- docs/engineering/API_REFERENCE.md
- docs/engineering/DB_SCHEMA.md
- docs/engineering/TRUSTSCAN_ARCHITECTURE.md

### Security

- docs/security/SECURITY.md
- docs/security/TRUSTSCAN_POLICY.md
- docs/security/TRUSTSCAN_SCORING.md

### Operations

- docs/ops/DEPLOYMENT.md
- docs/ops/TESTING.md

### Archive

- docs/archive (historical and legacy documents)

## Quick Start

Prerequisites:

- Node.js 18+
- Python 3.10+
- MongoDB URI

Install:

```bash
npm install
```

Run local stack:

```bash
npm run dev
```

## Environment Baseline

Frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

Backend:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
AI_SERVICE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:5173
GOOGLE_SAFE_BROWSING_API_KEY=your_google_safe_browsing_api_key
DEBUG_REQUEST_LOGS=false
```

## License

MIT
