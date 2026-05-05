# TrustScan Product Spec (V3)

## Objective
Enable users to submit a URL and receive a safe, explainable trust report without intrusive scanning.

## Primary Flow
1. User enters a URL.
2. Frontend validates basic format and submits scan request.
3. Backend creates async scan job.
4. Backend completes passive checks during the job completion path.
5. Results are stored and scored.
6. Frontend polls for job completion.
7. User sees scorecard, evidence timeline, and detailed report.
8. User can share a public read-only report link or export the report as PDF.

## User Experience Requirements
- Fast submission feedback (job accepted or rejected)
- Clear progress states: queued, running, completed, failed
- Explainable scorecard, not only a single numeric score
- Report detail sections for evidence and reasoning
- Scan history for authenticated users
- Clear messaging for limits and temporary throttling
- Public shareable report view with read-only access
- PDF export for finished reports

## Functional Scope
- URL normalization and canonicalization
- passive intelligence checks (TLS, DNS, headers, reputation)
- weighted scoring model
- AI summary overlay for non-technical users
- report persistence and retrieval
- scan evidence timeline and confidence framing
- public report sharing

## Non-Goals (V3)
- exploit execution
- brute force checks
- authenticated penetration workflows
- intrusive network probing

## Limits and Guardrails
- request rate limits per user and IP
- max scan frequency controls
- policy-based blocklist for prohibited targets
- legal-safe passive scanning boundary

## Success Metrics
- scan completion rate
- median completion time
- user return rate for repeated checks
- false-confidence incident count (should trend down)
- moderation incidents from misuse (should remain low)
