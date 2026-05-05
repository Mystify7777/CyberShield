# CyberShield Full Scan

This document records the highest-signal findings from a deep review of the CyberShield repository.

Status note:

- Several findings below were originally reported during the scan and have since been resolved in code.
- The encryption fallback note is now historical only; current code requires a strong `ENCRYPTION_KEY` and supports legacy key rotation instead of falling back to `secret123`.

## Critical Findings

### Auth middleware can emit duplicate responses

- File: [server/src/middlewares/authMiddleware.js](../server/src/middlewares/authMiddleware.js)
- Risk: a missing `return` after the no-token branch can trigger double responses and unstable auth failures.
- Recommendation: return immediately from every response path.

### Encryption utility falls back to a weak default secret

- File: [server/src/utils/encryption.js](../server/src/utils/encryption.js)
- Risk: sensitive data is protected by `secret123` when `ENCRYPTION_KEY` is missing.
- Recommendation: fail fast if the secret is missing or too short.

### Public report listing can expose sensitive data

- File: [server/src/routes/reportRoutes.js](../server/src/routes/reportRoutes.js)
- Risk: report listing is not protected, which can expose user data and submission metadata.
- Recommendation: protect the route or split public read from private ownership views.

## High Findings

### OTP values are stored in plaintext

- File: [server/src/models/User.js](../server/src/models/User.js)
- Risk: a database leak can reveal active verification codes.
- Recommendation: hash OTPs or store only a token fingerprint.

### Password reset tokens are emailed in plaintext

- File: [server/src/controllers/authController.js](../server/src/controllers/authController.js)
- Risk: anyone with mailbox access can reset passwords.
- Recommendation: shorten TTL, avoid exposing raw tokens where possible, and consider a reset-link flow.

### Password reset clears suspension state

- File: [server/src/controllers/authController.js](../server/src/controllers/authController.js)
- Risk: an admin suspension can be bypassed by resetting a password.
- Recommendation: keep suspension separate from password recovery.

### Upload handling lacks a file-size limit

- File: [server/src/middlewares/uploadMiddleware.js](../server/src/middlewares/uploadMiddleware.js)
- Risk: oversized uploads can lead to denial of service.
- Recommendation: set multer limits and validate file type and size.

### AI endpoints need explicit input caps

- File: [server/src/controllers/aiController.js](../server/src/controllers/aiController.js)
- Risk: oversized text payloads can cause memory pressure and slow processing.
- Recommendation: validate maximum input length on all AI routes.

## Medium Findings

### Auth routes need rate limiting

- File: [server/src/routes/authRoutes.js](../server/src/routes/authRoutes.js)
- Risk: brute-force and OTP spam attacks are easier.
- Recommendation: add route-specific limiters for register, resend-otp, forgot-password, and reset-password.

### JWT expiry is relatively long

- File: [server/src/utils/generateToken.js](../server/src/utils/generateToken.js)
- Risk: leaked tokens remain valid for a week.
- Recommendation: shorten expiry or introduce refresh-token flow.

### Forum listing may need pagination

- File: [server/src/controllers/forumController.js](../server/src/controllers/forumController.js)
- Risk: large datasets can slow the response and increase memory use.
- Recommendation: add paging and query limits.

### Frontend auth state relies too much on localStorage

- File: [client/src/components/PrivateRoute.jsx](../client/src/components/PrivateRoute.jsx)
- Risk: tampered client state can mislead the UI.
- Recommendation: validate token or session state with the backend on sensitive flows.

### Legacy dashboard component is still present

- File: [client/src/pages/dashboard/UserDashboard.jsx](../client/src/pages/dashboard/UserDashboard.jsx)
- Risk: dead code creates maintenance confusion.
- Recommendation: delete or archive it; the active dashboard is [client/src/pages/dashboard/Dashboard.jsx](../client/src/pages/dashboard/Dashboard.jsx).

### Logout behavior is inconsistent

- Files: [client/src/components/layout/Navbar.jsx](../client/src/components/layout/Navbar.jsx), [client/src/components/layout/AdminNavbar.jsx](../client/src/components/layout/AdminNavbar.jsx)
- Risk: mixed cleanup logic can leave stale state behind.
- Recommendation: centralize logout behavior.

## Low Findings and Improvements

### Missing `.env.example` files

- Risk: new contributors lack configuration guidance.
- Recommendation: add example env files for server, client, and AI service.

### Client API URL is undocumented

- File: [client/src/services/api.js](../client/src/services/api.js)
- Risk: developers may not realize `VITE_API_URL` is configurable.
- Recommendation: document it in onboarding and env setup files.

### Multiple startup scripts need a canonical recommendation

- Risk: contributors may not know which launcher to use.
- Recommendation: document a single recommended path per OS and keep fallback launchers clearly labeled.

## Positive Findings

- Security middleware exists and is layered reasonably well.
- OTP attempt limiting is already implemented.
- The dashboard architecture is modular.
- The repo has unusually strong docs discipline compared with most student projects.

## Quick Wins

- Fix auth middleware response flow.
- Remove the weak encryption fallback.
- Add upload and AI input limits.
- Protect sensitive report access.
- Make password reset safer and keep suspension control separate.
