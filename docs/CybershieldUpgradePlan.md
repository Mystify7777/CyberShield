# CyberShield — Upgrade Plan
> See also: [ConsolidatedDependencyGraph.md](ConsolidatedDependencyGraph.md) for full backend dependency graph and review legend.
> Last updated: Current session — 17 tasks completed (Tasks 1-10 plus phase 1 PR-ready fixes). See [CHANGELOG.md](CHANGELOG.md) for details.
> Prior status: README, package.json, server.js, app.js, all middlewares, all utils, all routes reviewed.

---

## ✅ Completed This Session

**Security Hardening:**
- ✅ Server-side game answer validation (phishingQuestionBank.js)
- ✅ Upload filename sanitization (randomUUID + extension whitelist)
- ✅ TrustScan URL validation (isURL, TLD, rejects localhost/private IPs)
- ✅ Error message masking (5xx errors hidden from clients)
- ✅ Middleware ordering fix (express.json before sanitizers)
- ✅ Path variable shadowing fix (path → urlPath)

**Reliability:**
- ✅ TrustScan per-user rate limit (5 scans/hour max)
- ✅ Comprehensive DB indexing (Article, Report, ForumPost, Meme, Video, User, TrustScanJob)
- ✅ Pagination limit safeguards (capped at 100 items)

**Configuration:**
- ✅ .env.sample created with 13 required variables
- ✅ Prestart env validation added for server startup and root `dev` launch path

**Verification:**
- ✅ Auth endpoint tests added for register and login flows
- ✅ Game reward endpoint tests added for public questions, correct rewards, and incorrect answers
- ✅ httpOnly refresh-cookie auth flow added with refresh/logout coverage
- ✅ AES-256-GCM report encryption with random IV and legacy decrypt fallback
- ✅ OTP hardening: crypto.randomInt generation, mandatory OTP secret, hash-only verification
- ✅ Upload validation now checks magic bytes via file-type before persistence
- ✅ Asset URL sanitization now uses a shared safe helper for meme/report moderation views
- ✅ API client now avoids forced /500 redirects and only records real server/network failures
- ✅ Coin/XP updates now use atomic MongoDB writes instead of read-modify-save cycles

---

## 🔴 Security — Fix Before Any Public Demo

- [x] **`encryption.js`** — Migrate from `crypto-js` to Node native `crypto` with AES-256-GCM + random IV per encryption. ✅ Switched to AES-256-GCM with a random IV, auth tag, 32-byte key enforcement, and legacy decrypt compatibility.
- [x] **`errorMiddleware.js`** — Fix `res.statusCode || 500` fallback. ✅ Error middleware properly logs errors and masks 500s from clients; statusCode issue resolved in error handling flow.
- [ ] **`roleMiddleware.js`** — Add `if (!req.user) return res.status(401)` guard before role check, in case `protect` middleware is accidentally omitted from a route.
- [x] **`trustScanRoutes.js`** — Strengthen URL validation. ✅ Added isURL validator with length constraints (5-2048 chars); rejects localhost, private IPs, and invalid TLDs via custom validators.
- [x] **`uploadMiddleware.js`** — Sanitize uploaded filename using `randomUUID()` + extension only. ✅ Implemented randomUUID + extension whitelist (.jpg, .jpeg, .png, .gif, .webp, .pdf) to prevent path traversal.
- [x] **`uploadMiddleware.js`** — Verify actual file magic bytes using the `file-type` package, not just `file.mimetype` (which is a client-supplied header, trivially spoofed). ✅ Memory-backed upload validation now checks magic bytes before explicit persistence.
- [x] **`authRoutes.js` + `userRoutes.js`** — Increase minimum password length from 6 to 8+ characters. ✅ Backend and client validation updated to 8 characters.
- [x] **`app.js`** — Move `express.json()` before `xssMiddleware` and `sanitizeMiddleware`. ✅ Middleware reordered in app.js, fixes undefined req.body during sanitization.
- [x] **`app.js`** — Rename `path` variable to `urlPath` inside `shouldSkipGlobalRateLimit`. ✅ Path variable renamed to avoid shadowing Node's path module.
- [x] **`gameRoutes.js`** — Do not trust `{ correct: true }` from the client. ✅ Implemented server-side answer validation via phishingQuestionBank.js; client now sends questionId+answerId, server validates against authoritative answers.

---

## 🟡 Reliability — Fix Before Submission / Demo

- [x] **`economy.js` + `gamification.js`** — Fix race condition in `addCoins`, `spendCoins`, `addXP`. ✅ Replaced reward writes with atomic MongoDB updates (`$inc` / conditional `findOneAndUpdate`) to avoid read-modify-write races.
- [ ] **`metrics.js`** — Wrap `incrementMetric` in `try/catch`. A metric write failure currently bubbles up as an unhandled rejection and can crash requests.
- [ ] **`forumRoutes.js`** — Add input validation to `createPost` and `addReply`. No validation currently — users can submit empty posts or very long content.
- [ ] **`reportRoutes.js`** — Remove duplicate `/user` route. Both `/user` and `/me` call `getMyReports`. Keep `/me` (REST convention), remove `/user`.
- [ ] **`systemRoutes.js`** — Add rate limiting to `POST /client-errors`. It is an open unauthenticated write endpoint with no protection against abuse.
- [ ] **`aiRoutes.js` + `uploadMiddleware.js` + `authRoutes.js`** — Extract `parsePositiveNumber` into a shared `src/utils/parseEnv.js`. Currently duplicated in at least 3 files.
- [x] **`trustScanRoutes.js`** — Add per-user scan rate limit. ✅ Implemented max 5 scans/hour per user; added duplicate scan deduplication and strict URL validation (rejects localhost/private IPs).
- [ ] **`sendEmail.js`** — Create the nodemailer transporter once at module load, not inside every `sendEmail()` call.
- [ ] **`sendEmail.js`** — Use `maskEmail()` from `logger.js` when logging the recipient address.
- [ ] **`gamification.js`** — Fix badge XP threshold ordering: "Meme Starter" requires 50 XP but "Rookie" requires 100 XP. A starter badge should have a lower bar than a rookie badge.
- [ ] **`gamification.js`** — Make badge rules data-driven (array of `{ name, condition }` objects) instead of individual `if` blocks. Easier to extend and test.
- [ ] **`authMiddleware.js`** — Log JWT error type internally (e.g. `TokenExpiredError` vs `JsonWebTokenError`) for observability, even though the client always receives a generic 401.
- [ ] **`articleRoutes.js`** — Remove `.escape()` from `content` field if articles render formatted text on the frontend. Escaping at write time stores `&lt;p&gt;` literally — escape at render time instead, or use `sanitize-html` with an allowlist.
- [ ] **`db.js`** — Add `mongoose.connection.on('disconnected', ...)` handler to log mid-runtime DB drops.

---

## 🟢 Code Quality — Nice to Have

- [ ] **`server.js`** — Replace `await import()` pattern with `import "dotenv/config"` at the top. Cleaner ESM-native way to load env vars before other imports.
- [ ] **`authMiddleware.js`** — Consider embedding `role` and `isSuspended` in the JWT payload to avoid a DB lookup on every authenticated request.
- [ ] **`reportList.js`** — Move filtering and sorting into MongoDB queries instead of loading all reports into memory. Even for demo data, this is a bad habit to build on.
- [ ] **`xssMiddleware.js` + `sanitizeMiddleware.js`** — The `req.query` mutation pattern (delete all keys, re-assign) is fragile. Consider a cleaner approach using `Object.defineProperty` or simply reassigning `req.query`.

---

## 🆕 Features — Planned Additions

- [ ] **User Notification System** — Build a separate user-facing notification panel distinct from the admin notification panel. Admin notifications and user notifications should have different models, routes, and controllers.
  - Suggested events to notify users on: report status change, article approved/rejected, account suspended/unsuspended, badge earned.
  - Suggested route: `GET /api/notifications/me` (user's own), keep `GET /api/notifications` for admin panel.

---

## 🚀 Production Upgrades — When Going Live

### Infrastructure
- [ ] Add Redis store to `express-rate-limit` via `rate-limit-redis` — in-memory counters reset on restart and don't sync across instances.
- [ ] Replace local `multer diskStorage` with S3 or Cloudinary — Render's filesystem is ephemeral and files are lost on redeploy.
- [ ] Add auth check to `/uploads/*` route for any user-private files.
- [ ] Implement async job queue for TrustScan using BullMQ + Redis — scans are currently synchronous and block the request thread.
- [x] Add MongoDB indexes at minimum on: `userId`, `createdAt`, `status` across collections. ✅ Added indexes to Article, Report, ForumPost, Meme, Video, User, and TrustScanJob models; added compound indexes for common query patterns.

### Email
- [ ] Replace Gmail + nodemailer with Resend, SendGrid, or Postmark for reliable transactional email delivery.
- [ ] Add retry logic / email queue for delivery failures.

### Auth
- [x] Confirm JWT is stored in `httpOnly` cookies, not `localStorage` (XSS-safe). ✅ Access token now stays in memory; refresh token is httpOnly cookie-backed.
- [x] Add refresh token flow and shorten access token expiry to 15 minutes. ✅ Login/refresh/logout endpoints now issue and rotate short-lived access tokens.
- [ ] Add password complexity requirements (uppercase, number, special character) beyond length alone.

### Observability
- [ ] Replace `console.*` with `pino` or `winston` — structured JSON logs with timestamps and log levels, shippable to Datadog/Logtail.
- [ ] Add graceful shutdown in `server.js` — handle `SIGTERM` to drain in-flight requests and close DB connection before exit.
- [ ] Hide `/api/system/version` npm package version in production — minor info disclosure.

### Scalability
- [ ] Replace in-memory report filtering (`reportList.js`) with DB-level queries, sort, and pagination.
- [ ] Consider exponential XP curve for leveling in `gamification.js` — linear (100 XP/level) is too easy to max out.
- [ ] Consider NestJS for a future rewrite if the team grows — enforced module boundaries, built-in DI, better structure at scale.

## 🔄 Updated TODO Additions

- No new TODO items were added in this session.

## 📝 Recommendations — ML Model Strategy

**For demo/submission:**
- Option 1: Use a pretrained HuggingFace model. One afternoon of work, real ML, real confidence scores.

**For production:**
- Option 2: Train on Indian scam data. The `Report.description` fields will become a valuable labeled training set after collecting a few hundred verified reports.

**Structural changes needed for both:**
- Load the model at startup (in `main.py` lifespan event), not per-request.
- Add `method: "heuristic" | "ml"` to every response so the frontend can display it.
- The `predict.py` route and `TextRequest` schema do not need to change — the interface stays identical.

### Student Project ✅

#### predictor.py
- [ ] **`predictor.py`** — Label the prediction method honestly: add `"method": "heuristic"` to the response shape so downstream clients don't present this as ML output.
- [ ] **`predictor.py`** — Switch from substring in matching to whole-word regex (`\bword\b`) to eliminate false positives on words like "window", "officer", "blink".
- [ ] **`predictor.py`** — Replace hardcoded confidence values with a score-proportional calculation capped at 0.95.

#### predict.py
- [ ] **`predict.py`** — Add `Pydantic Field(min_length=1, max_length=5000)` to `TextRequest.text` to reject empty and oversized inputs.
- [ ] **`predict.py`** — Wrap `predict_scam` call in try/except and raise `HTTPException(500)` on failure.

#### preprocess.py / predictor.py
- [ ] **`preprocess.py` / `predictor.py`** — Either use `clean_text` from `preprocess.py` in `predictor.py` (and add `.strip()`), or delete `preprocess.py`. Current state is dead code.

#### requirements.txt
- [ ] **`requirements.txt`** — Pin all dependency versions.

#### TrustScanReport.js
- [ ] **`TrustScanReport.js`** — Reconcile `verdict` enum with `constants.js` verdict bands; remove `RISKY`, `CAUTION`, `SAFE`, `STRONG` and write a one-time migration for any existing documents using deprecated values.
- [ ] **`TrustScanReport.js`** — Add `maxlength: 2048` to `url` and `maxlength: 1000` to `summary`.

#### User.js
- [ ] **`User.js`** — Remove TTL index from `otpExpires` — it would delete the entire user document, not just the OTP. Enforce expiry in application logic only.
- [x] **`User.js`** — Rename `verificationOTP` → `verificationOTPHash` to make hashed storage intent explicit, once the `authController` OTP hashing fix is applied. ✅ User model now stores the OTP hash only.
- [ ] **`User.js`** — Remove `lastPlayedGame` — it duplicates `lastActions.game`. Standardise on `lastActions.game` throughout.
- [ ] **`User.js`** — Add `min: 0` to `coins` and `xp` to prevent negative balances at the DB level.
- [ ] **`User.js`** — Add `maxlength` to `name` (100), `bio` (500), `alias` (50).
- [ ] **`User.js`** — Add email format match validator.
- [ ] **`User.js`** — Add a badge deduplication guard (pre-save hook or validate function) as a model-level backstop alongside the application-logic check in `gamification.js`.

#### Video.js
- [ ] **`Video.js`** — Add `maxlength: 200` to `title`, `maxlength: 2048` to `url`.
- [ ] **`Video.js`** — Add URL format match validator on `url`.

- [x] **`authController`** — Replace `Math.random()` OTP with `crypto.randomInt(100000, 999999)`. ✅ OTP generation now uses `crypto.randomInt(100000, 1000000)`.
- [x] **`authController`** — Remove plaintext OTP fallback in `verifyOTP` comparison. ✅ Verification is hash-only now.
- [x] **`authController`** — Throw if `OTP_HASH_SECRET` is missing; do not fall back to a hardcoded string. ✅ OTP secret is now mandatory.
- [x] **`authController`** — Separate `OTP_HASH_SECRET` from `JWT_SECRET` in env config. ✅ The OTP secret is configured independently in env validation and sample config.
- [ ] **`systemController`** — Escape `q` before using it in `$regex` to prevent ReDoS.
- [ ] **`systemController`** — Do not trust `userId` from unauthenticated request body in `logClientError`.
- [ ] **`trustScanController`** — Add `isPublic` flag or strip `userId` from public report response.
- [ ] **`trustScanController`** — Change initial job status to `queued`, not `running`, on creation.
- [ ] **`trustScanController`** — Replace `console.error` with `logError` for consistency.
- [ ] **All controllers** — Mask `error.message` in 500 catch blocks; do not send internal errors to clients.
- [ ] **`adminController`** — Add cascade delete to `deleteUser` (reports, articles, forum posts), matching `userController.deleteOwnAccount` behavior.
- [ ] **`adminController`** — Add self-suspend guard to `suspendUser`, matching the guard in `unsuspendUser`.
- [ ] **`adminController`** — Replace `console.log` in `unsuspendUser` with `logInfo`.
- [ ] **`articleController`** — Add pagination to public `getArticles` endpoint (currently unbounded).
- [ ] **`articleController`** — Notify article author when status changes (approved/rejected); wire to user notification system.
- [ ] **`adminController`** — Add pagination to `getAllUsers`.
- [ ] **`aiController`** — Wrap AI result in explicit response shape before sending to client.
- [ ] **`forumController`** — Return reply count in list view and full replies in a detail endpoint (separate route).
- [ ] **`notificationController`** — Add unread count endpoint `GET /api/notifications/count`.
- [ ] **`notificationController`** — Add ownership check to `markNotificationRead` (prep for user notifications).
- [ ] **`reportController`** — Remove redundant `report.user = null` after anonymous report creation.
- [ ] **`reportController`** — Notify report submitter when status changes (non-anonymous reports only).
- [ ] **`userController`** — Include `recentReports` query in `Promise.all` in `getProfile`.
- [ ] **`reportController`** — Consider encrypting `contactEmail` on sensitive reports, not just `description`.
- [ ] **All list endpoints** — Add pagination to `getArticles`, `getMemes`, `getVideos`, `getNotifications`, and `getAllUsers` (currently unbounded).
- [ ] **`headerSignal.js`** — Add max redirect count (5) to prevent infinite redirect loops.
- [ ] **`headerSignal.js`** — Unify score weights so `headerWeights` and `extractHeaderReport` do not use separate hardcoded values.
- [ ] **`scoringService.js`** — Import `getTrustScanConfidence` from `confidenceService.js` instead of re-implementing confidence logic.
- [ ] **`sslSignal.js`** — Return early with `service_unavailable` if protocol is `http:` (skip TLS checks on port 80).
- [ ] **`aiService.js`** — Add `timeout: 15000` to the axios call to prevent indefinite hangs.
- [ ] **`aiService.js`** — Replace `console.error` with `logError`.

#### reportTaxonomy.js
- [ ] **`reportTaxonomy.js`** — Fix `ESCALATED` priority rank; it should be ~2–3 (high priority), not 9 (lowest).
- [ ] **`reportTaxonomy.js`** — Add validation in `normalizeReport*` functions — unknown values should fall back to defaults, not pass through silently.
- [ ] **`reportTaxonomy.js`** — Add a `REPORT_PUBLIC_STATUS_DISPLAY_MAP` that maps internal statuses (e.g. `SENSITIVE_HOLD`) to their safe public-facing equivalents for use in the notification system.
- [ ] **`reportTaxonomy.js`** — Add a comment on `REPORT_STATUS_RANKS` explaining that `PENDING`/`REVIEWED` keys are intentional legacy inclusions, not bugs.

#### Article.js
- [ ] **`Article.js`** — Add `maxlength` on `title` (200), `content` (50000), and a max-length validator on the `tags` array (max 10 tags).
- [ ] **`Article.js`** — Add `required: true` to `createdBy` or add a comment if guest authorship is intentional.
- [ ] **`Article.js`** — Add a comment clarifying that article categories are intentionally distinct from report taxonomy categories.

#### ClientErrorLog.js
- [ ] **`ClientErrorLog.js`** — Add TTL index: `clientErrorLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 })` (30 days). Move the fix from controller-level note to here.
- [ ] **`ClientErrorLog.js`** — Add `maxlength: 2000` on `message` and `maxlength: 10000` on `stack`.

#### ForumPost.js
- [ ] **`ForumPost.js`** — Add `required: true` and `maxlength` to `title`, `content`, and reply text fields.
- [ ] **`ForumPost.js`** — Add `required: true` to `user` on both post and reply subdocument.

### Production 🚀

#### predict.py
- [ ] **`predict.py`** — Add shared-secret header authentication so only the Express backend can call the prediction endpoint.

#### predictor.py
- [ ] **`predictor.py`** — Replace keyword heuristic with a trained text classification model (e.g. fine-tuned distilbert-base-uncased on a scam SMS dataset) when moving to production. The current implementation is a viable placeholder for demo but not for real threat detection.

#### TrustScanReport.js
- [ ] **`TrustScanReport.js`** — Decide explicitly whether scan reports should have a TTL index matching `TrustScanJob`; add a code comment documenting the decision either way to avoid orphaned job references.

#### User.js
- [ ] **`User.js`** — Add `toJSON` transform stripping `password`, `verificationOTPHash`, and `passwordResetToken` from all serialised User documents.
- [ ] **`User.js`** — Hash `passwordResetToken` before storing (store sha256(token), send raw token in email, compare hash on reset).

#### Video.js
- [ ] **`Video.js`** — Add indexes: `{ status: 1, createdAt: -1 }` and `{ createdBy: 1 }`.


#### Article.js
- [ ] **`Article.js`** — Add `upvoteCount`/`downvoteCount` integer fields for DB-level sort and indexing (same pattern as `Meme.js`).
- [ ] **`Article.js`** — Add indexes: `{ status: 1, createdAt: -1 }` and `{ createdBy: 1 }`.

#### ForumPost.js
- [ ] **`ForumPost.js`** — Add `{ user: 1 }` index for profile queries and cascade delete.
- [ ] **`ForumPost.js`** — Move replies to a separate `ForumReply` collection to avoid hitting the 16MB BSON document limit on popular threads.

#### Meme.js
- [ ] **`Meme.js`** — Add indexes: `{ status: 1, createdAt: -1 }` and `{ createdBy: 1 }`.

#### Notification.js
- [ ] **`Notification.js`** — Add TTL index: `{ createdAt: 1 }` expiring after 90 days.

#### Report.js
- [ ] **`Report.js`** — Add indexes: `{ user: 1, createdAt: -1 }`, `{ status: 1, createdAt: -1 }`, `{ category: 1 }`.

#### TrustScanJob.js
- [ ] **`TrustScanJob.js`** — Add TTL index on `createdAt` (30 days) for automatic old job cleanup.
- [ ] **`TrustScanJob.js`** — Add `maxlength: 2048` to `url`.

---


## 🖥️ Frontend Upgrade Plan
> Frontend review in progress. Groups 1–3 complete. Groups 4–8 pending.

---

### Dependency Graph (Frontend)

```
client/src/
│
├── main.jsx                          ✅ entry point
│   └── App.jsx                       ⚠️ backend warm-up pattern (TBD)
│       ├── ErrorBoundary.jsx         ⚠️ console.error in production
│       └── AppRoutes.jsx             ⚠️ route conflicts, unprotected routes
│           ├── routes.config.js      ⚠️ incomplete admin nav, guest nav mismatch
│           └── PrivateRoute.jsx      ✅ validated server session drives role checks
│
├── services/
│   ├── api.js                        ✅ in-memory access token + refresh-cookie session handling
│   └── dashboardService.js           ❓ not yet reviewed
│
├── utils/
│   ├── runtimeConfig.js              ⚠️ silent localhost fallback in production
│   ├── errorReporter.js              ⚠️ spoofable userId, JSON.parse unsafe
│   ├── sanitizer.js                  ⚠️ misleading XSS framing, no recursion
│   ├── economySync.js                ⚠️ localStorage-driven economy state, silent catch
│   ├── trustscanPdf.js               ⚠️ no try/catch, CORS asset blanking
│   └── logout.js                     ✅ clears only app auth state
│
├── routes/
│   ├── AppRoutes.jsx                 ⚠️ see above
│   └── routes.config.js              ⚠️ see above
│
├── components/
│   ├── ErrorBoundary.jsx             ⚠️ console.error in production
│   ├── PrivateRoute.jsx              ✅ see above
│   ├── games/
│   │   └── PhishingQuestionCard.jsx  ✅ clean presentational component
│   ├── dashboard/                    ❓ not yet reviewed
│   ├── layout/                       ❓ not yet reviewed
│   ├── meme/                         ❓ not yet reviewed
│   ├── reports/                      ❓ not yet reviewed
│   ├── trustscan/                    ❓ not yet reviewed
│   └── ui/                           ❓ not yet reviewed
│
├── pages/
│   ├── games/
│   │   └── PhishingGame.jsx          🔴 client-trusted answer, answers in bundle, no cooldown
│   ├── reports/
│   │   └── CreateReport.jsx          ❓ not yet reviewed
│   ├── fun/
│   │   └── SubmitMeme.jsx            ❓ not yet reviewed
│   ├── forum/
│   │   └── CreatePost.jsx            ❓ not yet reviewed
│   ├── ai/
│   │   └── ScamDetector.jsx          ❓ not yet reviewed
│   ├── admin/                        ❓ not yet reviewed
│   ├── trustscan/                    ❓ not yet reviewed
│   └── [all others]                  ❓ not yet reviewed
│
├── data/
│   └── phishingQuestions.js          🔴 answer field ships in bundle
│
├── constants/
│   └── reportTaxonomy.js             ❓ not yet reviewed
│
└── hooks/
  └── useReportFilters.js           ❓ not yet reviewed
```

---

### 🔴 Critical — Fix Before Any Public Demo

- [x] **`api.js`** — JWT is stored in `localStorage`. Migrate to `httpOnly` cookie storage. ✅ Client now uses in-memory access tokens with httpOnly refresh cookies and no longer depends on localStorage JWT state.
- [ ] **`PhishingGame.jsx` + `phishingQuestions.js`** — Correct answer evaluated entirely client-side. `{ correct: true }` sent blindly to server. Anyone can POST `{ correct: true }` from DevTools and farm unlimited XP/coins. Fix requires: remove `answer` field from client data file, send `{ questionId, answerId }` to server, let server evaluate and return `{ correct, explanation }`.
- [ ] **`phishingQuestions.js`** — `answer` field is embedded in the production JS bundle. All correct answers are readable in the Network tab before playing.
- [ ] **`PhishingGame.jsx`** — No replay cooldown. Combined with the above exploit, replaying is a free XP/coin farm. Backend `lastPlayedGame` cooldown must be enforced server-side.


### Group 4 — Reports, Forum, Meme, AI, and Reliability Issues

- [x] **`ViewReports.jsx`** — Evidence rendered without validation: path traversal/protocol injection in <img src> and <a href>. ✅ Evidence URLs now flow through the shared safe asset helper.
---
- [x] **`ViewReports.jsx`** — `isAuthenticated` always false (wrong localStorage key): functional bug. ✅ Auth gating now keys off the validated user session.

- [ ] **`ViewReports.jsx`** — `contactEmail` shown publicly.  
### 🟡 Reliability — Fix Before Submission / Demo
- [ ] **`ViewReports.jsx`** — `console.error` in production.  

- [ ] **`CreateReport.jsx`** — No `maxLength` on title/description inputs.  
- [x] **`api.js`** — Wrap `JSON.parse(localStorage.getItem("user"))` in try/catch. ✅ Shared auth-session helpers now own user profile parsing and avoid crashing the interceptor on malformed storage.
- [ ] **`CreateReport.jsx`** — No client-side file size/type guard before upload.  
- [x] **`api.js`** — Hard redirect `window.location.assign("/500")` fires on any 5xx including background polls. ✅ Removed the forced redirect; the UI can now decide how to surface failures.
- [ ] **`SubmitMeme.jsx`** — No file size validation.  
- [x] **`api.js`** — `saveErrorContext` called on all errors including expected 4xx (401, 404, 422). ✅ Error context is now captured only for unexpected server/network failures.
- [ ] **`SubmitMeme.jsx`** — Caption has no `maxLength`.  
- [x] **`logout.js`** — `localStorage.clear()` wipes all localStorage, not just the `"user"` key. Use `localStorage.removeItem("user")` to be precise.
- [ ] **`SubmitMeme.jsx`** — Hardcoded coin amounts in toast message.  
- [x] **`PrivateRoute.jsx`** — Module-level `lastValidationAt` and `activeValidationPromise` are not reset on logout. ✅ Client auth bootstrap now revalidates against the server per session instead of relying on stale shared module state.
- [ ] **`SubmitMeme.jsx`** — Category options hardcoded, not from constants.  
- [x] **`PrivateRoute.jsx`** — `adminOnly` role check reads `user.role` from localStorage, not from the validated server session. ✅ Admin gating now uses the validated server session user.
- [ ] **`CreatePost.jsx`** — No `maxLength` on title/content.  
- [ ] **`AppRoutes.jsx`** — Verify `/trustscan/report/:id/public` doesn't collide with `/trustscan/:id` in React Router v6 matching. Test explicitly.
- [ ] **`CreatePost.jsx`** — Duplicate of inline form in `Forum.jsx` — two code paths.  
- [ ] **`AppRoutes.jsx`** — `/admin` route renders `<Dashboard />` (user dashboard), not an admin view. Intentional placeholder or oversight — confirm before demo.
- [ ] **`Forum.jsx`** — All replies rendered inline, no pagination/truncation.  
- [ ] **`AppRoutes.jsx`** — `/reports` (`ViewReports`) is unprotected. Confirm intentional — if reports contain sensitive incident data, authentication should be required.
- [ ] **`Forum.jsx`** — `fetchPosts` missing from `useEffect` dependency array.  
- [ ] **`AppRoutes.jsx`** — `/ai` (`ScamDetector`) is unprotected. Anonymous users can hit the AI endpoint freely. Ties to backend lack of per-user rate limiting on the AI route.
- [ ] **`MemeHub.jsx`** — No pagination — unbounded meme list.  
- [ ] **`routes.config.js`** — `guestCommunity` nav section shows "Phishing Game" to unauthenticated users, but the route is `PrivateRoute`-protected. Remove from guest nav or make route public.
- [ ] **`MemeHub.jsx`** — Double error feedback (toast + PageState).  
- [ ] **`routes.config.js`** — Admin nav section missing 4 routes: `/admin/articles`, `/admin/memes`, `/admin/notifications`, `/admin/error-logs`.
- [ ] **`ScamDetector.jsx`** — `aiChecksCount` in localStorage — client-side only, manipulable.  
- [ ] **`errorReporter.js`** — `userId` read from localStorage and sent to `/system/client-errors`. Spoofable — any value can be planted in localStorage. Backend should derive userId from JWT only.
- [ ] **`ScamDetector.jsx`** — Confidence displayed as raw float, not formatted.  
- [ ] **`errorReporter.js`** — `JSON.parse` in `sendErrorReport` without try/catch.
- [ ] **`ScamDetector.jsx`** — `SUSPICIOUS` not handled in report prefill logic.  
- [ ] **`runtimeConfig.js`** — Silent fallback to `http://localhost:5000/api` if `VITE_API_URL` is missing in production. Should throw or loudly warn in non-dev builds.
- [ ] **`vite.config.js`** — Dev proxy targets port `5001` but `runtimeConfig.js` fallback is port `5000`. One is wrong — verify and align.
- [ ] **`economySync.js`** — Empty `catch` block with no comment. Add `// intentional — UI resilience` so it's not mistaken for an oversight during review.
- [ ] **`trustscanPdf.js`** — No try/catch around `html2canvas` or `pdf.save`. Large report DOM at `scale: 2` can exceed browser memory limits and crash silently. Wrap and show user-facing error.
- [ ] **`sanitizer.js`** — `sanitizeObject` does not recurse into nested objects. Nested fields bypass cleaning entirely.
- [ ] **`sanitizer.js`** — Comment frames tag-stripping as XSS protection. React already escapes JSX values. Update comment to accurately describe what this does and doesn't protect against.

### Group 5 — Admin Panel, Moderation, and Reliability Issues

- [ ] **`ManageUsers.jsx`** — "Make Admin" button available to all admins, should be SUPER_ADMIN only.  
  ⚠️ Student
- [ ] **`ManageUsers.jsx`** — No self-action guard — admin can see suspend/delete on own account.  
  ⚠️ Student
- [ ] **`ManageUsers.jsx`** — Client-side search on unbounded user list.  
  ⚠️ Student
- [ ] **`ManageReports.jsx`** — Uncontrolled select — doesn't reset after status update.  
  ⚠️ Student
- [ ] **`ManageReports.jsx`** — No confirmation for destructive status changes.  
  ⚠️ Student
- [ ] **`ManageArticles.jsx`** — No pagination on either tab.  
  ⚠️ Student
- [ ] **`ManageArticles.jsx`** — "Published" tab hits public endpoint — may hide non-approved articles.  
  ⚠️ Student
- [x] **`MemeModeration.jsx`** — API_HOST + meme.image path injection risk. ✅ Meme images now use the shared safe asset helper.
  🔴 Fix before demo
- [ ] **`MemeModeration.jsx`** — No error state or retry on fetch failure.  
  ⚠️ Student
- [ ] **`MemeModeration.jsx`** — No pagination.  
  ⚠️ Student
- [ ] **`VideoModeration.jsx`** — No error state or retry.  
  ⚠️ Student
- [ ] **`VideoModeration.jsx`** — No video URL/preview shown — admin can't watch before approving.  
  ⚠️ Student
- [ ] **`Notifications.jsx`** — No loading state — flashes "No notifications" before data arrives.  
  ⚠️ Student
- [ ] **`Notifications.jsx`** — No pagination.  
  ⚠️ Student
- [ ] **`ErrorLogs.jsx`** — CSV export failure is silent — no user-facing error.  
  ⚠️ Student
- [ ] **`ErrorLogs.jsx`** — Stack trace <pre> has no max-height — can fill the page.  
  ⚠️ Student
- [ ] **All admin pages** — console.error in all catch blocks — runs in production.

#### Updated entry:

- [ ] **`ManageUsers.jsx`** — "Make Admin" button available to all admins, should be SUPER_ADMIN only → ✅ Intentional — any ADMIN can promote users; SUPER_ADMIN is a dev-only recovery backdoor, not a public role tier. Add a code comment in ManageUsers.jsx and adminController noting this decision so future maintainers don't "fix" it.

### Group 6 — TrustScan, Evidence, and Report UI Issues

- [ ] **`TrustScanLanding.jsx`** — No client-side URL format check before submission.  
  ⚠️ Student
- [ ] **`TrustScanProgress.jsx`** — Progress is time-based cosmetic only — needs comment.  
  ⚠️ Student
- [ ] **`TrustScanProgress.jsx`** — Polling at fixed 1200ms with no backoff or max count.  
  ⚠️ Student
- [ ] **`TrustScanReport.jsx`** — No loading state on mount.  
  ⚠️ Student
- [ ] **`TrustScanReport.jsx`** — shareReport uses report._id — verify this matches public route param.  
  ⚠️ Student
- [ ] **`TrustScanReport.jsx`** + **`PublicTrustScanReport.jsx`** — Factor breakdown JSX duplicated in both files.  
  ⚠️ Student
- [ ] **`PublicTrustScanReport.jsx`** — Raw API error message rendered in public UI.  
  ⚠️ Student
- [ ] **`TrustScanHistory.jsx`** — item.jobId used for navigation without undefined guard.  
  ⚠️ Student
- [ ] **`ConfidenceBadge.jsx`** — Case-sensitive confidence string match — silently falls back on casing mismatch.  
  ⚠️ Student
- [ ] **`EvidenceTimeline.jsx`** — event.durationMs not null-guarded — renders NaN s.  
  ⚠️ Student
- [ ] **`EvidenceTimeline.jsx`** — Composite key may not be unique for same-key same-timestamp events.  
  ⚠️ Student
- [ ] **`ScoreRing.jsx`** — Deprecated verdict values still in verdictClasses — add migration TODO.  
  ⚠️ Student

---

### 🟢 Code Quality — Nice to Have

- [ ] **`ErrorBoundary.jsx`** — `console.error` runs in production. `saveErrorContext` already handles persistence — remove the console call or gate it on `import.meta.env.DEV`.
- [ ] **`errorReporter.js`** — `saveErrorContext` overwrites on each call — only the last error in a cascade is kept. Add a `// TODO` noting this limitation.
- [ ] **`economySync.js`** — Economy display state is driven by localStorage and only updated on explicit sync calls. Can drift from server state. Note as a known limitation.
- [ ] **`trustscanPdf.js`** — Add a comment noting `useCORS: true` will silently blank cross-origin assets in the PDF output.
- [ ] **`phishingQuestions.js`** — Only 5 questions. Add `// TODO: expand question bank` comment.
- [ ] **`vite.config.js`** — Explicitly set `build.sourcemap: false` to make the production source map policy a conscious decision.
- [ ] **`PrivateRoute.jsx`** — Add a comment explaining why `user?.token` is used as the `useEffect` dependency rather than the full `user` object.

---

## ✅ Already Resolved / Good Decisions (for reference)

- CORS implementation uses hostname-level comparison with env-configurable allowlist — correct and robust.
- `xss-clean` (abandoned package) replaced with custom `xssMiddleware.js` — good call.
- `express-mongo-sanitize` supplemented with custom `sanitizeMiddleware.js` — more explicit and covers all three of body/params/query.
- `trust proxy` set to `1` in `app.js` — required for correct IP detection behind Render's proxy.
- `optionalProtect` middleware pattern — clean way to handle endpoints that work for both guests and logged-in users.
- Per-endpoint rate limiting on auth routes with env-configurable values — more thoughtful than most production apps.
- `EMAIL_MOCK=true` pattern for local dev — avoids accidental email sends during development.
- `metrics.js` uses atomic `$inc` with upsert — race-condition safe by design.
- `startedAt` stored at module load in `systemRoutes.js` — gives true server uptime.
- Route ordering is correct throughout (specific routes before param routes).
- `app.js` / `server.js` split — allows tests to import `app` without starting the HTTP server.
- Error handler registered last in `app.js` — correct Express pattern.