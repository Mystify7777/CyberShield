# CyberShield — Upgrade Plan
> See also: [ConsolidatedDependencyGraph.md](ConsolidatedDependencyGraph.md) for full backend dependency graph and review legend.
> Last updated after reviewing: README, package.json, server.js, app.js, all middlewares, all utils, all routes.

---

## 🔴 Security — Fix Before Any Public Demo

- [ ] **`encryption.js`** — Migrate from `crypto-js` to Node native `crypto` with AES-256-GCM + random IV per encryption. Current implementation has no IV, meaning identical values produce identical ciphertext (pattern attack risk).
- [ ] **`errorMiddleware.js`** — Fix `res.statusCode || 500` fallback — Express defaults `statusCode` to `200`, so unhandled errors silently return HTTP 200 with an error body.
- [ ] **`roleMiddleware.js`** — Add `if (!req.user) return res.status(401)` guard before role check, in case `protect` middleware is accidentally omitted from a route.
- [ ] **`trustScanRoutes.js`** — Strengthen URL validation: `body("url").isURL({ require_protocol: true, protocols: ["http", "https"] })`. Current check accepts any non-empty string including `"hello"` or `"javascript:alert(1)"`.
- [ ] **`uploadMiddleware.js`** — Sanitize uploaded filename using `randomUUID()` + extension only. Current `Date.now() + file.originalname` is user-controlled and path-traversal-prone.
- [ ] **`uploadMiddleware.js`** — Verify actual file magic bytes using the `file-type` package, not just `file.mimetype` (which is a client-supplied header, trivially spoofed).
- [ ] **`authRoutes.js` + `userRoutes.js`** — Increase minimum password length from 6 to 8+ characters. 6 is below current security baselines for any web app.
- [ ] **`app.js`** — Move `express.json()` before `xssMiddleware` and `sanitizeMiddleware`. Currently `req.body` is `undefined` when sanitizers run — they are not sanitizing the body.
- [ ] **`app.js`** — Rename `path` variable to `urlPath` inside `shouldSkipGlobalRateLimit` to fix shadowing of the imported Node `path` module.
- [ ] **`adminRoutes.js`** — Move `promoteToAdmin` from `adminOnly` to `superAdminOnly`. Admins should not be able to create peer admins — only the owner (super admin) should.
- [ ] **`gameRoutes.js`** — Do not trust `{ correct: true }` from the client. Verify the answer server-side using `questionId` + `answerId`. Current implementation lets anyone farm coins/XP by POSTing `correct: true`.

---

## 🟡 Reliability — Fix Before Submission / Demo

- [ ] **`economy.js` + `gamification.js`** — Fix race condition in `addCoins`, `spendCoins`, `addXP`. All use read-modify-write (`findById` → mutate → `save()`). Replace with atomic MongoDB `$inc` operations.
- [ ] **`metrics.js`** — Wrap `incrementMetric` in `try/catch`. A metric write failure currently bubbles up as an unhandled rejection and can crash requests.
- [ ] **`forumRoutes.js`** — Add input validation to `createPost` and `addReply`. No validation currently — users can submit empty posts or very long content.
- [ ] **`reportRoutes.js`** — Remove duplicate `/user` route. Both `/user` and `/me` call `getMyReports`. Keep `/me` (REST convention), remove `/user`.
- [ ] **`systemRoutes.js`** — Add rate limiting to `POST /client-errors`. It is an open unauthenticated write endpoint with no protection against abuse.
- [ ] **`aiRoutes.js` + `uploadMiddleware.js` + `authRoutes.js`** — Extract `parsePositiveNumber` into a shared `src/utils/parseEnv.js`. Currently duplicated in at least 3 files.
- [ ] **`trustScanRoutes.js`** — Add per-user scan rate limit. Each scan calls external APIs (DNS, TLS, Google Safe Browsing). Unlimited scans can exhaust external API quotas.
- [x] **`sendEmail.js`** — Migrated from Nodemailer/Gmail SMTP to Brevo transactional email; keep `maskEmail()` in logs for any recipient logging.
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
- [ ] **`errorMiddleware.js`** — Mask `err.message` for 500-level errors. Internal error messages can leak file paths, DB structure, or stack traces.
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
- [ ] Add MongoDB indexes at minimum on: `userId`, `createdAt`, `status` across report, scan, and notification collections.

### Email
- [x] Replace Gmail + nodemailer with Brevo transactional email for reliable OTP and reset delivery.
- [ ] Add retry logic / email queue for delivery failures.

### Auth
- [ ] Confirm JWT is stored in `httpOnly` cookies, not `localStorage` (XSS-safe).
- [ ] Add refresh token flow and shorten access token expiry to 15 minutes.
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
- [ ] **`User.js`** — Rename `verificationOTP` → `verificationOTPHash` to make hashed storage intent explicit, once the `authController` OTP hashing fix is applied.
- [ ] **`User.js`** — Remove `lastPlayedGame` — it duplicates `lastActions.game`. Standardise on `lastActions.game` throughout.
- [ ] **`User.js`** — Add `min: 0` to `coins` and `xp` to prevent negative balances at the DB level.
- [ ] **`User.js`** — Add `maxlength` to `name` (100), `bio` (500), `alias` (50).
- [ ] **`User.js`** — Add email format match validator.
- [ ] **`User.js`** — Add a badge deduplication guard (pre-save hook or validate function) as a model-level backstop alongside the application-logic check in `gamification.js`.

#### Video.js
- [ ] **`Video.js`** — Add `maxlength: 200` to `title`, `maxlength: 2048` to `url`.
- [ ] **`Video.js`** — Add URL format match validator on `url`.

- [ ] **`authController`** — Replace `Math.random()` OTP with `crypto.randomInt(100000, 999999)`.
- [ ] **`authController`** — Remove plaintext OTP fallback in `verifyOTP` comparison.
- [ ] **`authController`** — Throw if `OTP_HASH_SECRET` is missing; do not fall back to a hardcoded string.
- [ ] **`authController`** — Separate `OTP_HASH_SECRET` from `JWT_SECRET` in env config.
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
│           └── PrivateRoute.jsx      ⚠️ role from localStorage, shared module state
│
├── services/
│   ├── api.js                        🔴 JWT in localStorage, JSON.parse unsafe, 5xx hard redirect
│   └── dashboardService.js           ❓ not yet reviewed
│
├── utils/
│   ├── runtimeConfig.js              ⚠️ silent localhost fallback in production
│   ├── errorReporter.js              ⚠️ spoofable userId, JSON.parse unsafe
│   ├── sanitizer.js                  ⚠️ misleading XSS framing, no recursion
│   ├── economySync.js                ⚠️ localStorage-driven economy state, silent catch
│   ├── trustscanPdf.js               ⚠️ no try/catch, CORS asset blanking
│   └── logout.js                     ⚠️ localStorage.clear() too broad
│
├── routes/
│   ├── AppRoutes.jsx                 ⚠️ see above
│   └── routes.config.js              ⚠️ see above
│
├── components/
│   ├── ErrorBoundary.jsx             ⚠️ console.error in production
│   ├── PrivateRoute.jsx              ⚠️ see above
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

- [ ] **`api.js`** — JWT is stored in `localStorage`. Migrate to `httpOnly` cookie storage. Every XSS vulnerability on any page can steal the token from localStorage. Coordinate with backend cookie/CORS config.
- [ ] **`PhishingGame.jsx` + `phishingQuestions.js`** — Correct answer evaluated entirely client-side. `{ correct: true }` sent blindly to server. Anyone can POST `{ correct: true }` from DevTools and farm unlimited XP/coins. Fix requires: remove `answer` field from client data file, send `{ questionId, answerId }` to server, let server evaluate and return `{ correct, explanation }`.
- [ ] **`phishingQuestions.js`** — `answer` field is embedded in the production JS bundle. All correct answers are readable in the Network tab before playing.
- [ ] **`PhishingGame.jsx`** — No replay cooldown. Combined with the above exploit, replaying is a free XP/coin farm. Backend `lastPlayedGame` cooldown must be enforced server-side.


### Group 4 — Reports, Forum, Meme, AI, and Reliability Issues

- [ ] **`ViewReports.jsx`** — Evidence rendered without validation: path traversal/protocol injection in <img src> and <a href>.  
---
- [ ] **`ViewReports.jsx`** — `isAuthenticated` always false (wrong localStorage key): functional bug.  

- [ ] **`ViewReports.jsx`** — `contactEmail` shown publicly.  
### 🟡 Reliability — Fix Before Submission / Demo
- [ ] **`ViewReports.jsx`** — `console.error` in production.  

- [ ] **`CreateReport.jsx`** — No `maxLength` on title/description inputs.  
- [ ] **`api.js`** — Wrap `JSON.parse(localStorage.getItem("user"))` in try/catch. Malformed storage crashes the request interceptor.
- [ ] **`CreateReport.jsx`** — No client-side file size/type guard before upload.  
- [ ] **`api.js`** — Hard redirect `window.location.assign("/500")` fires on any 5xx including background polls. Replace with an event or global error state so the UI decides when to redirect.
- [ ] **`SubmitMeme.jsx`** — No file size validation.  
- [ ] **`api.js`** — `saveErrorContext` called on all errors including expected 4xx (401, 404, 422). Only call for unexpected 5xx or network failures.
- [ ] **`SubmitMeme.jsx`** — Caption has no `maxLength`.  
- [ ] **`logout.js`** — `localStorage.clear()` wipes all localStorage, not just the `"user"` key. Use `localStorage.removeItem("user")` to be precise.
- [ ] **`SubmitMeme.jsx`** — Hardcoded coin amounts in toast message.  
- [ ] **`PrivateRoute.jsx`** — Module-level `lastValidationAt` and `activeValidationPromise` are not reset on logout. A logout + login within 60 seconds will skip server re-validation.
- [ ] **`SubmitMeme.jsx`** — Category options hardcoded, not from constants.  
- [ ] **`PrivateRoute.jsx`** — `adminOnly` role check reads `user.role` from localStorage, not from the validated server session. A user can edit localStorage to pass the client guard (server will still 403 on API calls, but they'll see the admin UI).
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
- [ ] **`MemeModeration.jsx`** — API_HOST + meme.image path injection risk.  
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