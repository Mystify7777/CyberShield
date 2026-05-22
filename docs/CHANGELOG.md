# CHANGELOG

This file is the active, canonical development changelog for CyberShield.

Legacy and overlapping logs were archived to docs/archive.

## Current Session — Security & Reliability Hardening

### 🔐 Security Fixes
- **Game exploit elimination**: Moved phishing game answer validation server-side via `phishingQuestionBank.js`. Clients now submit `questionId+answerId` instead of client-controlled `correct` boolean; server validates against authoritative answers. Prevents XP/coin farming via direct API manipulation.
- **Upload filename hardening**: Replaced user-controlled filename generation with `randomUUID() + extension` validation. Eliminates path traversal and directory enumeration risks. Extension whitelist: `.jpg, .jpeg, .png, .gif, .webp, .pdf`.
- **TrustScan URL validation**: Enhanced input validation with `isURL`, TLD verification, and rejection of localhost/private IPs (`10.x`, `172.16-31.x`, `192.168.x`). Prevents internal network reconnaissance and abuse of external API quotas.
- **Auth refresh-cookie migration**: Replaced localStorage JWT storage with in-memory access tokens + httpOnly refresh cookies. Added `/api/auth/refresh` and `/api/auth/logout`, rotated refresh tokens on use, and reduced access token lifetime to 15 minutes.
- **Error message masking**: Updated `sendError()` and error middleware to mask all 5xx errors with generic messages; real errors logged server-side only. Prevents information disclosure via stack traces and internal system details.
- **Middleware ordering fix**: Moved `express.json()` before sanitizer middleware in app.js. Ensures `req.body` is available during sanitization; fixes undefined reference bug in xssMiddleware and sanitizeMiddleware.
- **Path variable shadowing fix**: Renamed `path` local variable to `urlPath` in shouldSkipGlobalRateLimit helper to avoid shadowing Node's path module.
- **Report encryption hardening**: Switched report payload encryption to AES-256-GCM with a random IV, auth tag, and legacy decrypt compatibility.
- **OTP hardening**: Replaced Math.random-based OTP generation with `crypto.randomInt`, made `OTP_HASH_SECRET` mandatory, and removed plaintext OTP verification fallback.
- **Upload validation hardening**: Moved uploads to memory-backed validation so magic bytes can be checked with `file-type` before explicit persistence.
- **Asset URL sanitization**: Added a shared safe asset helper for report and meme images to block protocol injection and malformed paths.
- **API stability cleanup**: Removed the forced `/500` redirect and narrowed client error logging to unexpected server/network failures.

### 📊 Reliability Improvements
- **TrustScan rate limiting**: Implemented per-user rate limit of **max 5 scans/hour**. Added duplicate scan deduplication (prevents simultaneous scans on same domain). Protects against external API quota exhaustion.
- **Database indexing**: Added comprehensive indexes across models:
  - **Article**: `createdBy`, `status`, compound `status+createdAt`
  - **Report**: `user`, `status`, compound `user+createdAt`, `status+createdAt`, `severity+createdAt`
  - **ForumPost**: `user`, compound `user+createdAt`
  - **Meme**: `createdBy`, `status`, compound `status+createdAt`, `createdBy+createdAt`, `category+status`
  - **Video**: `createdBy`, `status`, compound `status+createdAt`, `createdBy+createdAt`, `category+status`
  - **User**: `email`, `role`, `isSuspended` (support for role queries and suspension checks)
  - **TrustScanJob**: Already had indexes; verified existing coverage
- **Pagination safeguards**: Capped maximum page limit to 100 items (from unlimited) in systemController. Prevents resource exhaustion via oversized limit parameters.
- **Atomic reward updates**: Moved coin and XP progression writes to atomic MongoDB updates to avoid read-modify-write race conditions.

### 📝 Configuration
- **`.env.sample`**: Created comprehensive environment template with 13 key variables: `MONGO_URI`, `JWT_SECRET`, `OTP_HASH_SECRET`, `ENCRYPTION_KEY`, `AI_SERVICE_URL`, email credentials, `ALLOWED_ORIGINS`, `UPLOAD_MAX_FILE_SIZE_MB`, `LOG_LEVEL`, `API_PORT`, node env settings.
- **Startup env validation**: Added `server/src/scripts/validateEnv.js`, wired it into `server` `prestart` and the root startup chain so missing required env vars fail fast before the app launches.
- **Auth policy update**: Increased password minimum length to 8 characters on register/reset flows and aligned the client-side validation with the backend.

### 🧪 Tests
- Added route-level Vitest coverage for `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/game/questions`, and `POST /api/game/reward`.
- Added route-level Vitest coverage for `POST /api/auth/refresh` and `POST /api/auth/logout` cookie handling.
- Verified the new tests pass locally.

### 📊 Metrics
- 8 tasks completed (Tasks 1-4, 6-7, 9)
- 11 model schema updates
- 5 controller/middleware updates
- 0 breaking changes to client APIs
- All changes backward compatible with existing deployments

### 🧩 Recent Auth Addendum
- **Auth hardening commit**: `92c5dfc`
- **Auth middleware**: Added strict bearer token parsing, response-based auth failures, and observability for suspended or invalid token attempts.
- **Auth flows**: Hardened login, OTP, refresh, logout, and password-reset flows with anti-enumeration responses, atomic refresh-token rotation, and security logging.
- **Limiter updates**: Added refresh limiter protection and enabled `skipSuccessfulRequests` for login, OTP verification, and refresh requests.
- **Docs merge**: Consolidated the duplicate summary previously kept in `docs/logs.md` into this canonical changelog.

### 🔑 JWT Helper Hardening
- **Token generation**: Hardened `server/src/utils/generateToken.js` with fail-fast env checks for `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- **Validation**: Added strict user-id validation, refresh-token version checks, and HS256 signing with `issuer: "cybershield"` for both access and refresh tokens.
- **Reliability**: Reduced accidental misconfiguration risk by failing immediately when required JWT settings are missing.

### 🍪 Refresh Cookie Policy
- **Cookie scope**: Tightened refresh-token cookies to `sameSite: "strict"` and `priority: "high"` in `server/src/utils/authCookies.js`.
- **Logout consistency**: Updated cookie clearing to use explicit options so logout clears the refresh cookie with the same hardened scope.
- **Exposure reduction**: The stricter cookie policy reduces cross-site refresh-token exposure while keeping the existing `/api/auth` path boundary.

### 🧪 QA Smoke Snapshot
- **Report**: `docs/qa-report.md`
- **Latest result**: 8 passed, 1 failed, 9 total
- **Failure**: `POST /api/ai/predict` returned HTTP 500 with masked message `AI service failed` during the production smoke run.

---

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
