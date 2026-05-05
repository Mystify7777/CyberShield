# QA Smoke Report

- Date: 2026-04-11T08:39:02.102Z
- Base URL: https://cybershield-backend-inx9.onrender.com
- Timeout per request: 20000ms

| Area | Scenario | Method | Route | Expected | Actual | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Guest | System health | GET | /api/system/health | 200 | ERR | FAIL | Timeout |
| Guest | System version | GET | /api/system/version | 200 | 404 | FAIL | Unexpected status 404 |
| Guest | Public reports feed | GET | /api/reports?page=1&limit=5 | 200 | 200 | PASS | OK |
| Guest | Public articles feed | GET | /api/articles | 200 | 200 | PASS | OK |
| Guest | Public forum feed | GET | /api/forum?page=1&limit=5 | 200 | 200 | PASS | OK |
| Guest | AI prediction | POST | /api/ai/predict | 200 | 500 | FAIL | Unexpected status 500 |
| Failure | Invalid token on protected route | GET | /api/users/profile | 401/403 | 401 | PASS | OK |
| Failure | Empty login payload | POST | /api/auth/login | 400 | 400 | PASS | OK |
| Failure | Empty AI payload | POST | /api/ai/predict | 400 | 400 | PASS | OK |

- Summary: 6 passed, 3 failed, 9 total
- Scope: guest/failure API smoke only. Full user/admin UI flow remains manual via docs/qa-checklist.md.