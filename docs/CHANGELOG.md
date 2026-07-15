# CHANGELOG

This file is the active, canonical development changelog for CyberShield.

Legacy and overlapping logs were archived to docs/archive.

## Day 61

- Added TrustScan completion-path stack logging and hardened report generation against malformed signal payloads.
- Calibrated TrustScan DNS scoring to avoid over-penalizing legitimate domains when MX/NS are absent or DNS is transiently unavailable.
- Added confidence-based score caps and softened header penalties to reduce false STRONG verdicts on medium/low-confidence scans.
- Updated TrustScan documentation, deployment notes, and security references to match the current public report and Safe Browsing configuration.
- Verified backend TrustScan test suite passes with 55 tests.

## Day 60

- Stabilized My Reports filtering under rapid multi-filter changes.
- Implemented frontend request lifecycle guards in ViewReports.jsx:
  - in-flight request cancellation with AbortController
  - latest-request-only state updates via request-id guard
  - 250ms debounce on filter-triggered fetches
- Preserved existing reports API contract (/reports/me and existing query params unchanged).
- Added backend trace logs in reportController.getMyReports (QUERY, BEFORE, AFTER) to validate incoming params and filtered result counts during runtime debugging.

## Day 59

- Added demo showcase seeding workflow via seed:demo and seed:demo:reset.
- Implemented deterministic demo dataset generation (10 reports, 5 articles, 5 forum posts, 5 memes, 2 users, 1 admin).
- Added docs/demo-showcase.md with commands, seeded account credentials, and cleanup behavior.

## Day 58

- Added backend analytics counter layer with persistent metric storage.
- Wired counters for reports submitted, AI scans, threats flagged, article views, and moderation actions.
- Extended admin dashboard stats API and frontend mapping to surface activity counters and active-user count.

## Day 57

- Implemented automated QA smoke suite (npm --prefix server run qa:smoke).
- Added generated proof artifact docs/qa-report.md with endpoint-by-endpoint results.
- Updated QA checklist with quick-start commands and latest smoke snapshot.

## Day 56

- Entered ship-mode documentation phase focused on proof, polish, and presentation.
- Upgraded root README with architecture, corrected system endpoints, expanded env coverage, and interview positioning sections.
- Added release-facing docs and a manual end-to-end QA matrix.

## Day 55

- Added shared runtime config helper and rewired API/AI URL consumers to reduce duplicate base URL logic.
- Expanded UI primitives and improved async UX in high-traffic flows.
- Hardened endpoint protections with dedicated throttles for OTP verify, password reset, and AI predict flows.

## Day 54

- Refactored navbar architecture into focused layout components.
- Added centralized frontend route registry.
- Consolidated system runtime endpoints under /api/system/*.
- Updated frontend warm-up ping from /api/health to /api/system/health.

## Historical Timeline

Day 1 to Day 53 entries remain available in docs/archive/logs_legacy.md.
