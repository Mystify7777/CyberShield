# CyberShield Security (V3)

## Current Controls

- JWT authentication for protected routes
- role-based authorization (USER, ADMIN, SUPER_ADMIN)
- OTP verification and password reset workflows
- request validation and sanitization middleware
- endpoint-level and global rate-limits
- CORS origin allowlist and Helmet headers
- client error logging for admin diagnostics

## Threat Model

Primary threats:
- credential abuse and account takeover attempts
- API abuse via bot traffic or flood patterns
- malicious input payloads (XSS/NoSQL injection)
- unsafe scanner usage beyond passive analysis
- moderation abuse from privileged accounts

Defensive assumptions:
- all external input is untrusted
- auth tokens can be stolen if mishandled
- noisy traffic spikes can occur during demos and releases

## Rate Limits

Implemented:
- auth-specific limiters (register, login, OTP, password reset)
- AI prediction limiter
- public report listing limiter
- vote limiter on meme endpoints
- global limiter with selective endpoint bypass for safe reads

Operational guidance:
- tune thresholds per environment
- observe 429 metrics before tightening limits
- protect critical write paths first

## Secrets Handling

- secrets are environment-managed, never hardcoded
- Google Safe Browsing requires `GOOGLE_SAFE_BROWSING_API_KEY` in the backend environment for reputation lookups
- production secrets must be strong and rotated periodically
- debug logging must stay redacted and disabled by default in production
- verify frontend API base URL and backend targets at release time

## TrustScan Safe Scanning Policy

TrustScan is constrained to passive checks:
- TLS and certificate inspection
- DNS and header analysis
- passive reputation and public intelligence correlation

TrustScan must not perform:
- brute force
- exploit attempts
- intrusive probing
- authenticated attack simulation

Policy details are defined in docs/security/TRUSTSCAN_POLICY.md.

## Legal Boundaries

- TrustScan is a defensive analysis capability, not an offensive testing tool
- scans must remain within passive, non-intrusive boundaries
- prohibited target classes and jurisdiction constraints must be respected
- any capability expansion requires security and legal review before release
