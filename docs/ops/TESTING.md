# CyberShield Testing Strategy

## Test Layers
- Smoke tests: validate critical endpoints and service connectivity
- Manual scenario matrix: user and admin workflows
- Regression checks: known sensitive paths after each release

## Smoke Tests
Run backend smoke suite:
- npm --prefix server run qa:smoke

Validate minimum checks:
- system health/version/uptime endpoints
- auth register/login/validate baseline
- report create/list flow
- AI predict endpoint behavior

## Manual Test Matrix

### User path
- register, verify OTP, login
- submit report with/without evidence
- view personal reports and filter states
- run AI detector flow

### Admin path
- review reports
- manage users (suspend/unsuspend)
- moderate content
- view notifications and client error logs

### TrustScan QA scenarios (V3)
- valid URL submission and successful completion
- malformed URL rejection
- denied target handling by policy
- job status transition accuracy
- scorecard factor consistency
- polling behavior under slow scans
- public shareable report route returns read-only content
- PDF export action works from the TrustScan report page

## Release Gate
A release is green only if:
- smoke suite passes
- no critical manual flow regression
- API base URL and deployment targets verified
- docs updates included for changed behavior

## Incident-Focused Retest Rules
After any report filtering or API-target incident:
- verify request host correctness in browser network tab
- verify /api/system/health on intended backend
- verify /api/reports/me with expected query params
- verify latest-response-wins behavior in report list UI
