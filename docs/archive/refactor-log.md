# Refactor Log

## Commit 4 - Entropy Audit + Cleanup

Date: 2026-04-11

### Audit findings

- Oversized frontend files detected (>250 lines):
  - `client/src/pages/knowledge/Articles.jsx` (~442 lines)
  - `client/src/pages/admin/ErrorLogs.jsx` (~281 lines)
- Duplicate runtime URL helper logic existed in multiple places:
  - `client/src/App.jsx`
  - `client/src/services/api.js`
  - `client/src/utils/errorReporter.js`
- Duplicate filter parameter construction logic existed in:
  - `client/src/pages/admin/ErrorLogs.jsx` (`fetchLogs` and `exportCsv`)
- No unresolved merge markers were found in project source/docs during the latest merge sweep.

### Cleanup performed

- Added shared runtime config helper:
  - `client/src/utils/runtimeConfig.js`
  - Exposes `getApiBaseUrl()` and `getAiServiceBaseUrl()`
- Rewired runtime URL consumers to use shared helper:
  - `client/src/App.jsx`
  - `client/src/services/api.js`
  - `client/src/utils/errorReporter.js`
- Standardized fallback API base behavior to `http://localhost:5000/api` via shared helper.
- Extracted repeated error-log filter builder into one function:
  - `buildFilterParams()` in `client/src/pages/admin/ErrorLogs.jsx`

### Follow-up targets (not changed in this commit)

- Break down `client/src/pages/knowledge/Articles.jsx` into smaller presentational modules.
- Break down `client/src/pages/admin/ErrorLogs.jsx` into table/filter/export subcomponents.
- Extend route-config usage beyond navbar/app routes to high-traffic pages for path consistency.

## Commit 5 - Shared UI System Expansion

Date: 2026-04-11

### Commit 6 changes

- Added reusable UI primitives to reduce page-level duplication:
  - `client/src/components/ui/Input.jsx`
  - `client/src/components/ui/Badge.jsx`
  - `client/src/components/ui/Modal.jsx`
  - `client/src/components/ui/EmptyState.jsx`
  - `client/src/components/ui/Loader.jsx`
- Updated existing modal usage to align with shared primitives.
- Began adoption in admin error-log interfaces.

## Commit 6 - Async UX Reliability Pass

Date: 2026-04-11

### Commit 7 changes

- Strengthened loading/error/retry surfaces in `client/src/pages/dashboard/Dashboard.jsx`.
- Added safer input guards, disabled submit paths, and retry affordances in `client/src/pages/ai/ScamDetector.jsx`.
- Standardized state transitions for async actions to reduce ambiguous UI outcomes.

## Commit 7 - Home to AI to Report Handoff

Date: 2026-04-11

### Commit 8 changes

- Added quick-analyze CTA flow from home hero into AI detector with prefilled input support.
- Added report handoff path from AI results into report creation with navigation state prefill.
- Reduced friction for first-time users moving from detection to incident reporting.

## Commit 8 - Security and Reliability Sweep

Date: 2026-04-11

### Work performed

- Added/tightened endpoint-level rate limits for:
  - OTP verification
  - Password reset
  - AI prediction
- Removed unnecessary auth/debug logging in sensitive request paths.
- Updated server environment templates with limiter controls:
  - `AUTH_VERIFY_OTP_WINDOW_MS`, `AUTH_VERIFY_OTP_MAX`
  - `AUTH_RESET_PASSWORD_WINDOW_MS`, `AUTH_RESET_PASSWORD_MAX`
  - `AI_PREDICT_WINDOW_MS`, `AI_PREDICT_MAX`
