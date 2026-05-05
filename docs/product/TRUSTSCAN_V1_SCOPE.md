# TrustScan V1 Scope

## Goal
Ship a usable, safe, end-to-end TrustScan flow with mocked and then incremental real checks.

## User Input
- URL pasted manually

## In Scope (V1)
- URL normalization
- DNS resolve
- SSL certificate check
- HTTP security headers check
- domain age / WHOIS basic data
- blacklist/reputation lookup (mock acceptable for initial release)
- final risk score
- AI plain-English summary

## Out of Scope (V1)
- login testing
- brute force
- active vulnerability exploitation
- deep port scans
- scheduled monitoring
- browser extension
- alerts
- team dashboards

## Backend API Endpoints (V1 Skeleton)
- POST /api/trustscan
- GET /api/trustscan/:id
- GET /api/trustscan/history

Behavior:
- return mocked data first
- preserve contract while replacing internal checks incrementally

## Data Model (V1)

### trustscan_jobs
Purpose: lifecycle tracking.

Fields:
- userId
- url
- normalizedDomain
- status: queued | running | completed | failed
- startedAt
- completedAt
- error
- createdAt
- updatedAt

### trustscan_reports
Purpose: final assessment artifact.

Fields:
- jobId
- userId
- url
- normalizedDomain
- score
- verdict
- factors
- summary
- createdAt
- updatedAt

## Launch Metrics
- scan completion rate
- median scan time
- user retry rate on failed scans
- % scans with actionable factor breakdown
- week-1 repeat usage

## Non-Negotiable V1 Rule
No expansion beyond this scope until V1 flow is stable in production and user behavior validates demand.
