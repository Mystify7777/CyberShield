# Variables & Constants

## Backend Environment Variables

- PORT=5000
- MONGO_URI=your_mongodb_uri
- JWT_SECRET=supersecretkey
- JWT_EXPIRES_IN=24h
- AI_SERVICE_URL=`http://localhost:8000`
- ALLOWED_ORIGINS=`http://localhost:3000,http://localhost:5173`
- DEBUG_REQUEST_LOGS=false
- REPORT_PUBLIC_LIST_WINDOW_MS=60000
- REPORT_PUBLIC_LIST_MAX=60
- ADMIN_REPORTS_PAGE_LIMIT_MAX=50
- AUTH_VERIFY_OTP_WINDOW_MS=900000
- AUTH_VERIFY_OTP_MAX=10
- AUTH_RESET_PASSWORD_WINDOW_MS=3600000
- AUTH_RESET_PASSWORD_MAX=5
- AI_PREDICT_WINDOW_MS=900000
- AI_PREDICT_MAX=50
- AI_PREDICT_TEXT_MAX_CHARS=10000
- UPLOAD_MAX_FILE_SIZE_MB=50
- OTP_HASH_SECRET=strong_random_secret_for_otp_hmac
- ENCRYPTION_KEY=your_64_char_hex_key
- ENCRYPTION_LEGACY_KEYS=comma_separated_old_keys
- EMAIL_USER=your_gmail_address
- EMAIL_PASS=your_gmail_app_password
- EMAIL_MOCK=false

Encryption migration helper:

- `npm --prefix server run migrate:encryption`

DEBUG logging toggle:

- Set `DEBUG_REQUEST_LOGS=true` in development to print structured HTTP and auth flow diagnostics.
- Keep `DEBUG_REQUEST_LOGS=false` in production to reduce noise and avoid sensitive operational traces.

---

## Backend API Routes

### Auth

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify-otp
- POST /api/auth/resend-otp
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET /api/auth/validate (protected; token/session validation)

JWT behavior:

- Access tokens default to 24 hours via `JWT_EXPIRES_IN`
- A refresh token flow is not implemented yet

### Users

- GET /api/users/profile (protected)
- PUT /api/users/profile (protected)
- PUT /api/users/change-password (protected)
- DELETE /api/users/me (protected)

### Reports

- POST /api/reports (protected, multipart/form-data)
- GET /api/reports (public, safe feed; hides sensitive details and excludes contact/evidence/history)
- GET /api/reports/user (protected, own detailed reports)
- GET /api/reports/me (protected, own detailed reports)
- PUT /api/reports/:id (admin)

Report listing response shape (`GET /api/reports`, `GET /api/reports/me`):

- `items`: report array
- `pagination`: `{ page, limit, total, totalPages, hasNextPage }`

Upload validation behavior:

- Max file size is controlled by `UPLOAD_MAX_FILE_SIZE_MB` (default 50MB)
- Reports accept image files and PDFs only
- Meme uploads accept image files only

### AI

- POST /api/ai/predict (public, optional auth for XP rewards)

AI predict validation behavior:

- `text` is required and must be a non-empty string
- `text` length is capped by `AI_PREDICT_TEXT_MAX_CHARS` (default 10000)
- Predict endpoint throttling is configured by `AI_PREDICT_WINDOW_MS` and `AI_PREDICT_MAX`

### Articles

- POST /api/articles (protected)
- GET /api/articles (public, approved only)
- GET /api/articles/user (protected, own article list)
- GET /api/articles/:id (public, approved only)
- GET /api/articles/admin/pending (admin)
- PUT /api/articles/:id/status (admin)

### Forum

- GET /api/forum (public)
- GET /api/forum/user (protected, own forum posts)
- POST /api/forum (protected)
- POST /api/forum/:id/reply (protected)

Forum listing response shape (`GET /api/forum`):

- `items`: forum post array
- `pagination`: `{ page, limit, total, totalPages, hasNextPage }`

Forum pagination behavior:

- `page` defaults to 1 if missing or invalid
- `limit` defaults to 10 and is capped server-side at 50
- Posts are sorted by `createdAt` descending before pagination

### Videos

- GET /api/videos (public, approved only)
- POST /api/videos (protected)
- GET /api/videos/pending (admin)
- PUT /api/videos/:id (admin)

### Memes

- GET /api/memes (public, visible only)
- POST /api/memes (protected, multipart/form-data)
- POST /api/memes/:id/vote (protected, up/down)
- GET /api/memes/admin/flagged (admin)
- PUT /api/memes/:id (admin)

### Games

- POST /api/game/reward (protected, reward correct phishing answer)

### Notifications

- GET /api/notifications (admin)
- PUT /api/notifications/:id/read (admin)

### Admin

- GET /api/admin/stats
- GET /api/admin/users
- DELETE /api/admin/users/:id
- PUT /api/admin/promote/:id
- PUT /api/admin/suspend/:id
- PUT /api/admin/users/:id/unsuspend
- PUT /api/admin/demote/:id (super admin only)
- GET /api/admin/reports
- DELETE /api/admin/articles/:id

Admin report listing response shape (`GET /api/admin/reports`):

- `items`: report array
- `pagination`: `{ page, limit, total, totalPages, hasNextPage }`

Admin report pagination behavior:

- Request `limit` is capped server-side by `ADMIN_REPORTS_PAGE_LIMIT_MAX`.

### System (Error Observability)

- GET /api/system/health
- GET /api/system/version
- GET /api/system/uptime
- POST /api/system/client-errors
- GET /api/system/client-errors (admin)
- GET /api/system/client-errors/export (admin CSV)

Client error filter query params:

- `range`: `24h` or `7d`
- `type`: `5xx` (status codes 500-599)
- Existing filters remain supported: `source`, `statusCode`, `q`, `fromDate`, `toDate`

---

## Frontend Routes

Public:

- /
- /login
- /register
- /verify
- /forgot-password
- /reports
- /ai
- /articles
- /articles/:id
- /forum
- /videos
- /memes

Protected:

- /dashboard
- /profile
- /settings
- /create-report
- /forum/create
- /videos/submit
- /memes/upload
- /games

Admin Protected:

- /admin
- /admin/reports
- /admin/users
- /admin/articles
- /admin/videos
- /admin/memes
- /admin/notifications
- /admin/error-logs

Error pages:

- /500
- \* (404)

---

## Roles

- USER
- ADMIN
- SUPER_ADMIN

---

## Report Status

- PENDING
- REVIEWED
- RESOLVED

---

## AI Output Labels

- SAFE
- SUSPICIOUS
- MALICIOUS

---

## OTP Auth Lifecycle

- Register creates 6-digit OTP with 10-minute expiry
- Unverified duplicate email is overwritten on re-register
- Verify endpoint blocks after 5 failed attempts
- Verify error payload includes attempts remaining
- Verify endpoint throttling is configured by `AUTH_VERIFY_OTP_WINDOW_MS` and `AUTH_VERIFY_OTP_MAX`
- Resend OTP resets attempt counter and expiry
- Forgot password sends reset token with 15-minute expiry
- Reset-password endpoint throttling is configured by `AUTH_RESET_PASSWORD_WINDOW_MS` and `AUTH_RESET_PASSWORD_MAX`
- Reset password requires email + token + newPassword
- Email validator lowercases but preserves dot characters in local-part

---

## Security Middleware Stack

Global middleware (app.js):

- helmet()
- xssMiddleware() custom sanitizer
- sanitizeMiddleware() custom NoSQL operator key sanitizer
- express-rate-limit
- cors
- express.json
- morgan

Route-level validation:

- express-validator (auth, reports, system endpoint)

---

## Model Highlights

User:

- role, isSuspended
- isVerified
- verificationOTP
- otpExpires (TTL index)
- failedOtpAttempts
- passwordResetToken
- passwordResetExpires
- alias (unique, sparse)
- bio
- xp
- level
- streak
- coins
- dailyCoins
- lastCoinReset
- lastActions (`game`, `vote`, `meme` timestamps)
- lastPlayedGame
- lastActive
- badges[] (`name`, `earnedAt`)

---

## Economy Control Constants

- DAILY_COIN_CAP = 100
- Cooldowns:
  - GAME_CORRECT: 10000ms
  - VOTE: 2000ms
  - MEME_UPLOAD: 30000ms
- Diminishing reward floor multiplier: 0.2

---

## Identity Display Rule

- Default label shows `name`
- If `alias` exists, UI shows `alias`
- When alias is shown, username is exposed on hover (`title` hint)

---

## UI Theme State

- Current theme: light-only
- Dark mode switch: not implemented yet (tracked in TODO)

---

## Mobile Responsiveness Status

- Core user flows have responsive spacing/wrapping updates (navbar, profile, reports, forum, knowledge pages, AI)
- Additional QA remains for remaining admin/auth edge cases

---

## Dashboard Architecture (Planned)

Reusable component target path:

- `client/src/components/ui/DashboardCore.jsx`
- `client/src/pages/dashboard/Dashboard.jsx`
- `client/src/components/dashboard/Charts.jsx`
- `client/src/services/dashboardService.js`

Tab mapping:

- Client dashboard tabs: `overview`, `analytics`, `reports`
- Admin dashboard tabs: `overview`, `analytics`, `moderation`

Metrics replacement strategy:

- Replace generic SaaS placeholders (revenue/sessions/conversion) with CyberShield domain metrics
- Client overview metrics: reports, articles, forum posts, AI checks
- Admin overview metrics: users, reports, pending reports, active users

---

## Dashboard Data Contract (Current)

Client data sources:

- GET `/api/users/profile`
- GET `/api/reports` (current implementation + frontend ownership filter)
- GET `/api/articles` (current implementation + frontend ownership filter)
- GET `/api/forum` (current implementation + frontend ownership filter)

Admin data sources:

- GET `/api/admin/stats`
- GET `/api/reports`
- GET `/api/articles/admin/pending`

Calculated metrics pattern:

- Compute status and trend metrics in frontend from fetched collections (for example pending/resolved counts)

Chart loading strategy:

- Lazy-load analytics chart modules only when `activeTab === "analytics"`

State management strategy:

- Local component state with `useState` + `useEffect`
- Props-driven dashboard component input (`<Dashboard data={dashboardData} />`)

Profile payload highlights (current):

- `user`: name, alias, email, bio, xp, level, streak, badges
- `stats`: reports, articles, posts
- `recentReports`: latest user reports for dashboard feed

---

## Engagement Expansion (Current + Planned)

Core pillars:

- Protect
- Learn
- Community
- Engagement

Gamification XP actions (implemented):

- Report submitted: `+20 XP`
- Article posted: `+30 XP`
- AI check used: `+5 XP`
- Daily login: `+2 XP`
- Meme uploaded: `+10 XP`
- Meme upvoted (creator reward): `+2 XP`
- Meme voting participation: `+1 XP`
- Phishing game correct answer: `+5 XP`

Coin economy actions (implemented):

- Daily login: `+5 coins`
- Report submitted: `+10 coins`
- Meme uploaded: `+5 coins`
- Meme like received: `+2 coins`
- Phishing game correct answer: `+3 coins`

Coin costs (implemented):

- Meme upload: `-2 coins`
- Forum post: `-1 coin`
- Comment/reply: `-1 coin`
- Downvote: `-1 coin`

Current badges:

- `Rookie`
- `Cyber Warrior`
- `Elite Defender`
- `Meme Starter`
- `Meme Lord`
- `Consistent`

Planned engagement metrics:

- `xp`
- `level`
- `currentStreak`
- `longestStreak`
- `awarenessScore`

---

## Content Modules

Video hub object shape:

- `title`
- `url` (embed-ready link)
- `category` (`AWARENESS`, `SCAM`, `TIPS`)
- `status` (`PENDING`, `APPROVED`, `REJECTED`)

Meme object shape:

- `image` (file path or URL)
- `caption` (meme text)
- `category` (`SCAM`, `AWARENESS`, `FUN`)
- `createdBy` (ObjectId reference to User)
- `status` (`VISIBLE`, `FLAGGED`, `REMOVED`)
- `upvotes` (array of userId)
- `downvotes` (array of userId)
- `votingEnabled` (boolean)
- `commentsEnabled` (boolean)
- `createdAt`, `updatedAt` (timestamps)

Mini-games (planned):

- `Phishing Detector`
- `URL Checker`
- `Password Strength Challenge`

---

## Planned API Contracts (Roadmap)

Gamification:

- GET `/api/users/engagement`
- POST `/api/users/engagement/award`

Short content:

- GET `/api/shorts` (public approved)
- POST `/api/shorts` (admin create)

Memes:

- GET `/api/memes` (public visible)
- POST `/api/memes` (auth submit)
- POST `/api/memes/:id/vote` (auth vote)
- GET `/api/memes/admin/flagged` (admin)
- PUT `/api/memes/:id` (admin moderation)

Voting safeguards:

- Self-voting blocked
- Duplicate same-vote attempts do not grant XP
- Vote endpoint protected with rate limiter

Challenges and insights:

- GET `/api/challenges/weekly`
- GET `/api/users/insights`

Report:

- severity, contactEmail, evidence
- isAnonymous, isSensitive
- history[] timeline

Article:

- status: PENDING, APPROVED, REJECTED

ClientErrorLog:

- message, stack, source, path, method, statusCode
- createdAt for filtering/export
