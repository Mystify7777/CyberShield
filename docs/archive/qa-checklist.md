# QA Checklist (Commit 9)

Purpose: run a full end-to-end manual QA pass before external demo/interview.

## Quick Start

Run API smoke checks (automated subset):

```bash
npm --prefix server run qa:smoke
```

Optional target override:

```bash
QA_BASE_URL=http://localhost:5000 npm --prefix server run qa:smoke
```

Output artifact:

- `docs/qa-report.md` (latest smoke execution snapshot)

Latest smoke snapshot:

- Date: 2026-04-11
- Result: 6 PASS / 3 FAIL
- Failures observed on deployed API: `/api/system/health` timeout, `/api/system/version` 404, `/api/ai/predict` 500

## Test Matrix

| Area | Scenario | Steps | Expected | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Guest | Home landing loads | Open `/` | Hero, nav, and CTA render without console/API errors | TODO | |
| Guest | AI quick analyze from home | Enter sample suspicious text and continue to `/ai` | Input prefilled and analyze action enabled | TODO | |
| Guest | AI analysis | Submit text on `/ai` | Label + confidence + explanation render | FAIL (SMOKE) | `/api/ai/predict` returned 500 on deployed backend |
| Guest | Reports browsing | Open `/reports` | Paginated list loads, no sensitive fields leaked | PASS (SMOKE) | `/api/reports` returned 200 |
| Guest | Articles browsing | Open `/articles` and detail page | Approved content only | PASS (SMOKE) | `/api/articles` returned 200 |
| User | Register | Submit valid registration form | Success response + verification required state | TODO | |
| User | Verify OTP | Submit valid OTP | Verification success | TODO | |
| User | Login | Login with verified user | Token stored and redirect to dashboard | TODO | |
| User | Submit report | Create report with valid payload/file | Report stored and success UI shown | TODO | |
| User | View dashboard | Open `/dashboard` after login | Metrics + user data load | TODO | |
| User | Edit profile | Update profile fields | Changes persist and show after reload | TODO | |
| Admin | Login admin | Login with admin account | Admin routes accessible | TODO | |
| Admin | Moderate content | Review pending article/video/meme item | Status update persists | TODO | |
| Admin | Review reports | Open `/admin/reports` | Admin table loads with pagination controls | TODO | |
| Admin | Suspend/unsuspend user | Run suspend then unsuspend | User status changes are reflected | TODO | |
| Failure | Expired/invalid token | Use stale token and call protected page | User redirected/blocked safely | PASS (SMOKE) | `/api/users/profile` returned 401 with invalid token |
| Failure | Empty form | Submit empty auth/report forms | Validation errors shown with no crash | PASS (SMOKE) | `/api/auth/login` empty payload returned 400 |
| Failure | Invalid file upload | Upload unsupported file type | Request rejected with clear message | TODO | |
| Failure | AI timeout/down service | Stop AI service and run predict | Graceful error state + retry shown | PARTIAL | Service failure observed via 500 from deployed `/api/ai/predict`; local outage scenario pending |
| Failure | Bad network | Simulate offline/interrupted request | Retry/error UX shown, no broken state | TODO | |

## Suggested Evidence Collection

- Capture one screenshot or short clip per major flow (guest, user, admin).
- Save browser console + network logs for failed scenarios.
- Record server log snippets for auth, AI, and moderation actions.

## Exit Criteria

- All P0/P1 scenarios are PASS.
- No blocker bugs remain in auth, report submission, AI predict, or admin moderation.
- Core flows are demo-safe on both desktop and mobile viewport sizes.

## Sign-off

- QA run date:
- Tested by:
- Build/commit reference:
- Result summary:
- Smoke report link: `docs/qa-report.md`
