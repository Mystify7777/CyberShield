# CyberShield System Design (V3)

## Frontend

Stack:
- React + Vite
- route-based UI for auth, reports, AI, community, admin

Responsibilities:
- collect user input and enforce basic client validation
- call backend APIs through configured runtime base URL
- render moderation, reporting, and intelligence workflows
- handle async states, retries, and user-visible error boundaries

## Backend API

Stack:
- Node.js + Express
- modular route/controller structure

Responsibilities:
- auth and role-based authorization
- report lifecycle management
- moderation and admin operations
- policy and rate-limit enforcement
- API aggregation for AI and TrustScan report orchestration

## AI Service

Stack:
- FastAPI

Responsibilities:
- classify suspicious text content
- return risk label and reasoning payload to backend
- remain isolated from main API runtime for independent scaling and deployment

## TrustScan Worker

Status:
- current implementation is controller-driven during TrustScan status polling; dedicated worker remains planned

Responsibilities:
- run passive URL checks (TLS, DNS, headers, reputation)
- persist factor evidence, scan metadata, and summary payloads
- cache repeated normalized URL scans for short windows
- keep completion behavior aligned with the public report route and history views

## MongoDB

Primary persistence layer for:
- identity and role data
- reports and moderation state
- community content
- notification and observability records
- TrustScan jobs and reports

## Redis (Planned)

Planned usage:
- queue transport and worker coordination
- request deduplication
- short-lived cache for repeated trust lookups
- burst protection support for high-traffic endpoints

## Queue Jobs

Planned job classes:
- trustscan.execute
- trustscan.recompute-score
- trustscan.enrich-signals

Lifecycle model:
- queued -> running -> completed or failed

## Service Interaction Overview

```text
Client UI
  -> Express API
     -> MongoDB
     -> FastAPI AI
     -> Queue (planned)
        -> TrustScan Worker (planned)
```

## Reliability Principles

- latest-response-wins behavior in high-frequency frontend fetch flows
- strict API base URL discipline across environments
- rate limits on abuse-sensitive routes
- observability endpoints for health, version, and uptime
- explicit policy boundaries for any scanning functionality
