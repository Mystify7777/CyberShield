# CyberShield API Reference

Base URL: /api

Auth legend:
- Public: no token required
- Protected: valid JWT required
- Admin: ADMIN or SUPER_ADMIN
- Super Admin: SUPER_ADMIN only

## Auth
- POST /auth/register (Public)
- POST /auth/login (Public)
- POST /auth/verify-otp (Public)
- POST /auth/resend-otp (Public)
- POST /auth/forgot-password (Public)
- POST /auth/reset-password (Public)
- GET /auth/validate (Protected)

## Reports
- POST /reports (Protected)
- GET /reports (Public, rate-limited)
- GET /reports/user (Protected)
- GET /reports/me (Protected)
- PUT /reports/:id (Admin)

## AI
- POST /ai/predict (Public, optional auth, rate-limited)

## TrustScan
Current state:
- POST /trustscan (Protected)
- GET /trustscan/:id (Protected)
- GET /trustscan/report/:id/public (Public)
- GET /trustscan/history (Protected)

Behavior notes:
- POST /trustscan normalizes the URL and creates a TrustScan job.
- GET /trustscan/:id advances job state and returns the job plus report when completed.
- GET /trustscan/report/:id/public exposes a read-only report view for shared links.
- GET /trustscan/history returns authenticated report history.

## Articles
- GET /articles (Public)
- GET /articles/:id (Public)
- GET /articles/user (Protected)
- POST /articles (Protected)
- POST /articles/:id/vote (Protected)
- GET /articles/admin/pending (Admin)
- PUT /articles/:id/status (Admin)

## Forum
- GET /forum (Public)
- GET /forum/user (Protected)
- POST /forum (Protected)
- POST /forum/:id/reply (Protected)

## Videos
- GET /videos (Public)
- POST /videos (Protected)
- GET /videos/pending (Admin)
- PUT /videos/:id (Admin)

## Memes
- GET /memes (Public)
- POST /memes (Protected)
- POST /memes/:id/vote (Protected, rate-limited)
- GET /memes/admin/flagged (Admin)
- PUT /memes/:id (Admin)

## Users
- GET /users/profile (Protected)
- PUT /users/profile (Protected)
- PUT /users/change-password (Protected)
- DELETE /users/me (Protected)

## Admin
- GET /admin/stats (Admin)
- GET /admin/users (Admin)
- DELETE /admin/users/:id (Admin)
- PUT /admin/promote/:id (Admin)
- PUT /admin/suspend/:id (Admin)
- PUT /admin/users/:id/unsuspend (Admin)
- PUT /admin/demote/:id (Super Admin)
- GET /admin/reports (Admin)
- DELETE /admin/articles/:id (Admin)

## Notifications
- GET /notifications (Admin)
- PUT /notifications/:id/read (Admin)

## System
- GET /system/health (Public)
- GET /system/version (Public)
- GET /system/uptime (Public)
- GET /system/client-errors (Admin)
- GET /system/client-errors/export (Admin)
- POST /system/client-errors (Public)

## Game
- POST /game/reward (Protected)
