# Bug Tracker

## Bug 1

Description: Frontend redirected to `/500` too aggressively on non-5xx failures.

Status: Fixed

Fix: Axios interceptor updated to redirect only on explicit 5xx status codes.

---

## Bug 2

Description: Registration crashed with `Cannot set property query ... has only a getter` under Express 5.

Status: Fixed

Fix: Replaced incompatible sanitizers with custom `xssMiddleware` and `sanitizeMiddleware`.

---

## Bug 3

Description: Users could get stuck as unverified and blocked by duplicate email registration.

Status: Fixed

Fix: Register flow now removes prior unverified record and recreates fresh OTP state.

---

## Bug 4

Description: OTP brute-force risk due to unlimited verification attempts.

Status: Fixed

Fix: Added `failedOtpAttempts` limit (max 5), attempt counter reset on resend/verify success, and attempts-remaining feedback.

---

## Bug 5

Description: Public home page JSX failed due to missing closing section tag.

Status: Fixed

Fix: Added missing closing `</section>` tag in home page layout.

---

## Bug 6

Description: Emails with dots in local-part (e.g. `abc.def@gmail.com`) were being altered during auth validation.

Status: Fixed

Fix: Removed dot-pruning normalization behavior and replaced it with trim + lowercase sanitization that preserves local-part punctuation across register/login/verify/resend/reset flows.

---

## Operational Note: SMTP Credentials

Description: Gmail SMTP can reject credentials (`535 BadCredentials`) when not using App Password.

Status: Mitigated

Fix: Added `EMAIL_MOCK` mode for local dev and documented App Password requirement.

---

## Operational Note: Runtime QA

Description: Full runtime stabilization QA for medium-impact upgrades requires live DB-backed sessions with at least two seeded users and log fixtures.

Status: Partially Validated

Fix: Runtime matrix is now executed and passing for cross-user isolation, auth validate guard responses, and logs filter/CSV parity. Remaining item is token-expiry navigation verification that requires natural token expiry (or controlled short expiry in QA env).

---

## Bug 7

Description: Report filters/search appeared broken because the shared report list utility could not load at runtime after the taxonomy refactor.

Status: Fixed

Root Cause: The server-side filter utility imported `normalizeReportSourceChannel` from [server/src/constants/reportTaxonomy.js](../../server/src/constants/reportTaxonomy.js), but that export was missing. The report list route then failed before applying category/search/status filters.

Fix: Added the missing export to the server taxonomy constants and re-validated the shared report filter pipeline in [server/src/utils/reportList.js](../../server/src/utils/reportList.js).

Note: This is a common refactor bug when shared constants are split across client/server copies. Always re-run a runtime import check after moving normalization helpers.

---

## Bug 8

Description: Report filtering could silently fail for mixed-case or label-like query values because the server normalized report values but not incoming query values consistently.

Status: Fixed

Root Cause: [server/src/utils/reportList.js](../../server/src/utils/reportList.js) normalized stored report fields, but query values for `severity`, `source`, and `subcategory` were compared raw. That meant values like `High`, `WhatsApp`, or `otp theft` could miss valid records.

Fix: Added query-side normalization and validation for category, subcategory, status, severity, source, and sort values before filtering. Invalid values are now ignored instead of silently filtering everything out.

Note: This is a very common bug when URL-driven filters are wired to enum-backed data. Normalize both sides or validate query params against the enum set first.

---

## Bug 9

Description: Generic report search could leak contact emails and subcategory matching could fail when report values were stored in a different format than the URL query.

Status: Fixed

Root Cause: The shared filter utility included `contactEmail` in the generic search haystack and compared subcategory values raw on the report side. That created a privacy leak vector for generic search and brittle matching for values like `otp theft` vs `OTP_THEFT`.

Fix: Removed `contactEmail` from generic search and only enabled it for explicit admin/internal search requests. Also normalized report subcategory values before comparison so both query values and stored values use the same canonical token format.

Note: This is a common issue in shared search utilities. Keep public search fields narrowly scoped and normalize both query and stored values before comparing them.

---

## Bug 10

Description: My Reports could show broad or stale results after rapid multi-filter changes, even when the final selected filters were valid.

Status: Fixed

Root Cause: Multiple overlapping frontend requests were allowed to resolve out of order. Older responses could overwrite the latest filtered response state, causing UI/query mismatch symptoms.

Fix: Added request lifecycle controls in [client/src/pages/reports/ViewReports.jsx](../../client/src/pages/reports/ViewReports.jsx):
- cancel in-flight requests with `AbortController`
- apply request-id guard so only the latest response can call `setReports`
- debounce filter-triggered fetches by 250ms to reduce burst requests

Verification: Added temporary trace logs in [server/src/controllers/reportController.js](../../server/src/controllers/reportController.js) for `QUERY`, `BEFORE`, and `AFTER` counts to confirm backend filtering behavior matches incoming query params.

---

## Bug 11

Description: Frontend report views showed broad/stale-looking data because requests were pointed at the wrong backend host, so expected filtered responses never came from the active API.

Status: Fixed

Root Cause: Client API base URL was misconfigured and pointed to an unintended deployment target instead of the active backend environment.

Fix: Corrected the frontend API base configuration to the intended backend host and re-verified report filters against `/reports/me` with expected query params.

Prevention:
- Verify `VITE_API_URL` before each demo/release.
- Validate `GET /api/system/health` against the same host shown in browser network calls.
- Keep environment templates and onboarding docs aligned with current deployment targets.

---

## Rules

- Always log bugs immediately
- Include root cause and resolution
- Link to affected module when possible
