# CyberShield — Frontend Upgrade Plan
> Frontend review complete. All 8 groups reviewed.
> Backend review: see consolidated backend upgrade plan.

---

## Dependency Graph (Frontend)

```
client/src/
│
├── main.jsx                              ✅ entry point
│   └── App.jsx                           ❓ not reviewed (backend warm-up)
│       ├── ErrorBoundary.jsx             ⚠️ console.error in production
│       └── AppRoutes.jsx                 ⚠️ route conflicts, unprotected routes
│           ├── routes.config.js          ⚠️ incomplete admin nav, guest nav mismatch
│           └── PrivateRoute.jsx          ⚠️ role from localStorage, shared module state
│
├── services/
│   ├── api.js                            🔴 JWT in localStorage, JSON.parse unsafe, 5xx hard redirect
│   └── dashboardService.js               ⚠️ oversized fetches, client-side meme filter, wrong endpoint
│
├── utils/
│   ├── runtimeConfig.js                  ⚠️ silent localhost fallback in production
│   ├── errorReporter.js                  ⚠️ spoofable userId, JSON.parse unsafe
│   ├── sanitizer.js                      ⚠️ misleading XSS framing, no recursion
│   ├── economySync.js                    ⚠️ localStorage-driven economy state, silent catch
│   ├── trustscanPdf.js                   ⚠️ no try/catch, CORS asset blanking
│   └── logout.js                         ⚠️ localStorage.clear() too broad
│
├── routes/
│   ├── AppRoutes.jsx                     ⚠️ see above
│   └── routes.config.js                  ⚠️ see above
│
├── components/
│   ├── ErrorBoundary.jsx                 ⚠️ console.error in production
│   ├── PrivateRoute.jsx                  ⚠️ see above
│   ├── games/
│   │   └── PhishingQuestionCard.jsx      ✅ clean presentational component
│   ├── reports/
│   │   └── ReportFiltersToolbar.jsx      ⚠️ no debounce on search input
│   ├── meme/
│   │   └── MemeCard.jsx                  🔴 path injection risk (API_HOST + path)
│   ├── dashboard/
│   │   └── Charts.jsx                    ❓ not reviewed (lazy-loaded)
│   ├── layout/
│   │   ├── Navbar.jsx                    ⚠️ inner components remount, no memo
│   │   ├── AdminNavbar.jsx               ⚠️ full list poll for unread count, missing links
│   │   ├── PublicLayout.jsx              ⚠️ footer links 404, uses <a> not <Link>
│   │   └── navbar/
│   │       ├── NavDropdown.jsx           ⚠️ details/summary hybrid, no ARIA
│   │       ├── AccountMenu.jsx           ⚠️ hardcoded fallback paths
│   │       ├── AdminMenu.jsx             ⚠️ hardcoded fallback paths
│   │       ├── MobileMenu.jsx            ✅ clean
│   │       └── NavGroup.jsx              ✅ clean
│   ├── trustscan/
│   │   ├── ConfidenceBadge.jsx           ⚠️ case-sensitive string match
│   │   ├── DomainCard.jsx                ✅ clean
│   │   ├── EvidenceTimeline.jsx          ⚠️ durationMs null guard, composite key
│   │   ├── HeadersCard.jsx               ✅ clean
│   │   ├── ReportActions.jsx             ✅ clean
│   │   ├── ReputationCard.jsx            ✅ clean
│   │   └── ScoreRing.jsx                 ⚠️ deprecated verdict values
│   └── ui/
│       ├── Badge.jsx                     ✅ clean
│       ├── Button.jsx                    ✅ clean
│       ├── Card.jsx                      ✅ clean
│       ├── cn.js                         ✅ clean
│       ├── ConfirmActionModal.jsx         ✅ clean
│       ├── DashboardCore.jsx             ⚠️ hardcoded dailyCap, dark mode stub, redundant state
│       ├── EmptyState.jsx                ⚠️ thin wrapper adds indirection
│       ├── FeatureCard.jsx               ✅ clean
│       ├── Input.jsx                     ✅ clean
│       ├── Loader.jsx                    ✅ clean
│       ├── Modal.jsx                     ⚠️ no focus trap, no Escape key handler
│       └── PageState.jsx                 ✅ clean
│
├── pages/
│   ├── games/
│   │   └── PhishingGame.jsx              🔴 client-trusted answer, no cooldown
│   ├── reports/
│   │   ├── CreateReport.jsx              ⚠️ no maxLength, no file size guard
│   │   └── ViewReports.jsx               🔴 path injection + isAuthenticated bug
│   ├── fun/
│   │   ├── MemeHub.jsx                   ⚠️ no pagination, double error feedback
│   │   └── SubmitMeme.jsx                ⚠️ no file size check, hardcoded categories
│   ├── forum/
│   │   ├── Forum.jsx                     ⚠️ duplicate create form, unbounded replies
│   │   └── CreatePost.jsx                ⚠️ duplicate of Forum.jsx inline form
│   ├── ai/
│   │   └── ScamDetector.jsx              ⚠️ localStorage counter, raw confidence value
│   ├── admin/
│   │   ├── ManageUsers.jsx               ⚠️ client-side search on unbounded list
│   │   ├── ManageReports.jsx             ⚠️ uncontrolled select, no confirm on status change
│   │   ├── ManageArticles.jsx            ⚠️ no pagination, wrong endpoint for published tab
│   │   ├── MemeModeration.jsx            🔴 path injection risk, no error state
│   │   ├── VideoModeration.jsx           ⚠️ no error state, no video preview
│   │   ├── Notifications.jsx             ⚠️ no loading state, no pagination
│   │   └── ErrorLogs.jsx                 ⚠️ silent CSV export failure, no pre height
│   ├── trustscan/
│   │   ├── TrustScanLanding.jsx          ⚠️ no client-side URL check
│   │   ├── TrustScanProgress.jsx         ⚠️ cosmetic-only progress, fixed 1200ms poll
│   │   ├── TrustScanReport.jsx           ⚠️ no loading state, shareReport ID mismatch risk
│   │   ├── PublicTrustScanReport.jsx     ⚠️ raw API error in public UI, duplicated JSX
│   │   └── TrustScanHistory.jsx          ⚠️ jobId undefined guard missing
│   ├── auth/
│   │   ├── Login.jsx                     ⚠️ submit button not disabled during loading
│   │   ├── Register.jsx                  ⚠️ tempEmail in localStorage, strength threshold
│   │   ├── VerifyOTP.jsx                 ⚠️ attempts count client-initialised, no numeric input
│   │   └── ForgotPassword.jsx            ⚠️ Enter submits full reset, not token request
│   ├── knowledge/
│   │   ├── Articles.jsx                  ❓ not uploaded — assume unbounded list, console.error
│   │   └── ArticleDetail.jsx             ⚠️ console.error, missing useEffect dep
│   ├── dashboard/
│   │   └── Dashboard.jsx                 ⚠️ isAdmin from localStorage, missing useCallback
│   ├── profile/
│   │   └── Profile.jsx                   ⚠️ duplicate forms with Settings, min password 6
│   ├── account/
│   │   └── Settings.jsx                  ⚠️ notificationsEnabled no-op, fragile error check
│   ├── video/
│   │   ├── VideoHub.jsx                  🔴 new URL() crash, iframe without allowlist
│   │   └── SubmitVideo.jsx               ⚠️ no URL validation, hardcoded categories
│   └── public/
│       └── Home.jsx                      ⚠️ /admin link exposed to public
│
├── data/
│   └── phishingQuestions.js              🔴 answer field ships in production bundle
│
├── constants/
│   └── reportTaxonomy.js                 ⚠️ no sync comment, unknown values pass through
│
└── hooks/
    └── useReportFilters.js               ✅ best file in the codebase — removeFilter needs useCallback
```

---

**Legend:**
- ✅ Good — correct design
- ⚠️ Needs attention — fix when possible
- 🔴 Critical — security or correctness issue, fix before demo
- ❓ Not reviewed / pending

---

## 🔴 Critical — Fix Before Any Public Demo

- [ ] **`api.js`** — JWT stored in `localStorage`. Readable by any JavaScript on the page (XSS). Migrate to `httpOnly` cookie. Coordinate with backend CORS + cookie config.

- [ ] **`PhishingGame.jsx` + `phishingQuestions.js`** — Correct answer evaluated entirely client-side. `{ correct: true }` sent blindly to server. Anyone can POST it from DevTools to farm unlimited XP/coins. Fix: remove `answer` field from client data, send `{ questionId, answerId }` to server, let server evaluate and return `{ correct, explanation }`.

- [ ] **`phishingQuestions.js`** — `answer` field ships in the production JS bundle. All correct answers readable in the Network tab before playing.

- [ ] **`PhishingGame.jsx`** — No replay cooldown. Combined with the above, replaying is a free XP/coin farm. Backend `lastPlayedGame` cooldown must be enforced server-side.

- [ ] **`ViewReports.jsx`** — `isAuthenticated` always `false` — reads `localStorage.getItem("token")` but token is stored inside the `"user"` object, not as a standalone key. Authenticated users always hit the public `/reports` endpoint instead of `/reports/me`. Functional bug — fix immediately.

- [ ] **`ViewReports.jsx`** — `r.evidence` concatenated with `ASSET_HOST` and rendered in `<img src>` and `<a href>` without path validation. A `//evil.com/path` or `javascript:` value in `r.evidence` bypasses the host prefix. Validate path starts with `/` and contains no protocol before rendering.

- [ ] **`MemeCard.jsx` + `MemeModeration.jsx` + `ViewReports.jsx`** — Same `API_HOST + path` pattern in three separate files. Extract a shared `getAssetUrl(path)` utility that validates the path before concatenation and use it in all three.

- [ ] **`VideoHub.jsx`** — `new URL(url)` throws a `TypeError` on malformed URLs. If any approved video has a non-parseable URL, the entire video grid crashes to an unhandled error. Wrap in try/catch and return the raw `url` as fallback.

---

## 🟡 Reliability — Fix Before Submission / Demo

### Auth & Token Layer

- [ ] **`api.js`** — Wrap `JSON.parse(localStorage.getItem("user"))` in try/catch in the request interceptor. Malformed storage crashes all API requests.
- [ ] **`api.js`** — Hard redirect `window.location.assign("/500")` fires on any 5xx including background polls. Replace with an event or global error state so the UI decides when to redirect.
- [ ] **`api.js`** — `saveErrorContext` called on all errors including expected 4xx (401, 404, 422). Only call for unexpected 5xx or network failures.
- [ ] **`logout.js`** — `localStorage.clear()` wipes all localStorage. Use `localStorage.removeItem("user")` to be precise and avoid clearing unrelated third-party state.
- [ ] **`PrivateRoute.jsx`** — Module-level `lastValidationAt` and `activeValidationPromise` are not reset on logout. A logout + login within 60 seconds skips server re-validation.
- [ ] **`PrivateRoute.jsx`** — `adminOnly` role check reads `user.role` from localStorage, not from the validated session. A user can edit localStorage to pass the client guard (server will 403 on API calls, but they see the admin UI).

### Routing

- [ ] **`AppRoutes.jsx`** — Verify `/trustscan/report/:id/public` doesn't collide with `/trustscan/:id` in React Router v6 matching. Test explicitly.
- [ ] **`AppRoutes.jsx`** — `/admin` route renders `<Dashboard />` (user dashboard), not an admin view. Confirm intentional placeholder or fix before demo.
- [ ] **`AppRoutes.jsx`** — `/reports` (`ViewReports`) is unprotected. Confirm intentional — if reports contain sensitive incident data, require authentication.
- [ ] **`AppRoutes.jsx`** — `/ai` (`ScamDetector`) is unprotected. Anonymous users hit the AI endpoint freely. Ties to backend lack of per-user rate limiting on the AI route.
- [ ] **`routes.config.js`** — `guestCommunity` nav section shows "Phishing Game" to unauthenticated users, but the route is `PrivateRoute`-protected. Remove from guest nav or make route public.
- [ ] **`routes.config.js`** — Admin nav section missing 4 routes: `/admin/articles`, `/admin/memes`, `/admin/notifications`, `/admin/error-logs`.

### Error Reporting

- [ ] **`errorReporter.js`** — `userId` read from localStorage and sent to `/system/client-errors`. Spoofable — any value can be planted. Backend should derive userId from JWT only (primary fix is backend).
- [ ] **`errorReporter.js`** — `JSON.parse` in `sendErrorReport` without try/catch.

### Config & Build

- [ ] **`runtimeConfig.js`** — Silent fallback to `http://localhost:5000/api` if `VITE_API_URL` is missing in production. Should throw or loudly warn in non-dev builds. Gate on `import.meta.env.DEV`.
- [ ] **`vite.config.js`** — Dev proxy targets port `5001` but `runtimeConfig.js` fallback is port `5000`. Verify and align.

### Utils

- [ ] **`economySync.js`** — Empty `catch` block with no comment. Add `// intentional — UI resilience`.
- [ ] **`trustscanPdf.js`** — No try/catch around `html2canvas` or `pdf.save`. Large DOM at `scale: 2` can exceed browser memory limits and crash silently. Wrap and show a user-facing error.
- [ ] **`sanitizer.js`** — `sanitizeObject` does not recurse into nested objects. Nested fields bypass cleaning.
- [ ] **`sanitizer.js`** — Comment frames tag-stripping as XSS protection. React already escapes JSX values by default. Update comment to accurately describe what this does and doesn't protect against.

### Write Operations (Forms)

- [ ] **`CreateReport.jsx`** — No `maxLength` on title (add 200) or description (add 10000) to match backend model limits.
- [ ] **`CreateReport.jsx`** — No client-side file size or type guard before upload. Add `file.size` check (e.g. max 5MB) on change.
- [ ] **`SubmitMeme.jsx`** — No file size validation before upload.
- [ ] **`SubmitMeme.jsx`** — Caption has no `maxLength` (add 500 to match backend).
- [ ] **`SubmitMeme.jsx`** — Hardcoded coin amounts in toast: `"(+5 coins, -2 cost)"`. Remove amounts or derive from API response.
- [ ] **`SubmitMeme.jsx`** — Category options hardcoded in JSX. Import from a constants file.
- [ ] **`CreatePost.jsx`** — No `maxLength` on title (add 200) or content (add 20000).
- [ ] **`CreatePost.jsx` + `Forum.jsx`** — Duplicate post creation code paths (two forms, same endpoint). Consolidate to one.
- [ ] **`Forum.jsx`** — All replies rendered inline with no pagination or truncation. Add a "Show more" toggle or cap at 3 visible.
- [ ] **`Forum.jsx`** — `fetchPosts` missing from `useEffect` dependency array.
- [ ] **`MemeHub.jsx`** — No pagination. Unbounded meme list grows with the collection.
- [ ] **`MemeHub.jsx`** — Both `toast.error` and `setError` fire on the same fetch failure. Remove the toast — `PageState` error variant already shows the message.
- [ ] **`SubmitVideo.jsx`** — No URL format validation before submission. Add basic check or `type="url"` input.
- [ ] **`SubmitVideo.jsx`** — Category options hardcoded. Import from constants.
- [ ] **`SubmitVideo.jsx`** — No `maxLength` on title input (add 200).

### ScamDetector

- [ ] **`ScamDetector.jsx`** — `aiChecksCount` written to localStorage. Client-side only, trivially reset. If it enforces a usage limit it must be server-side. If informational, add a comment.
- [ ] **`ScamDetector.jsx`** — `result.confidence` displayed as raw float (e.g. `0.873`). Format as `{Math.round(result.confidence * 100)}%`.
- [ ] **`ScamDetector.jsx`** — `SUSPICIOUS` label not handled in report prefill logic — gets `category: "OTHER"` instead of a more appropriate default.

### Admin Pages

- [ ] **`ManageUsers.jsx`** — No self-action guard in UI. Admin can see Suspend/Delete on their own account. Hide destructive actions for `u._id === currentUser._id`.
- [ ] **`ManageUsers.jsx`** — Client-side search on an unbounded user list. Add `// TODO: server-side search needed at scale`.
- [ ] **`ManageReports.jsx`** — Status update select uses `defaultValue` not `value`. Doesn't reset after update. Use `value=""` with `key={r._id + r.status}` to force reset.
- [ ] **`ManageReports.jsx`** — No confirmation modal for destructive status changes (DISMISSED, ARCHIVED, ESCALATED).
- [ ] **`ManageArticles.jsx`** — No pagination on either tab. Add or note as TODO.
- [ ] **`ManageArticles.jsx`** — "Published" tab hits public `GET /articles` endpoint — may only return APPROVED articles, hiding REJECTED ones from admin view. Use an admin-specific endpoint.
- [ ] **`MemeModeration.jsx`** — No error state or retry on fetch failure. Add `PageState variant="error"` pattern.
- [ ] **`MemeModeration.jsx`** — No pagination.
- [ ] **`VideoModeration.jsx`** — No error state or retry on fetch failure.
- [ ] **`VideoModeration.jsx`** — No video URL or embed shown. Admin approves/rejects without seeing the content.
- [ ] **`Notifications.jsx`** — No loading state. Page flashes "No notifications" before data arrives.
- [ ] **`Notifications.jsx`** — No pagination.
- [ ] **`ErrorLogs.jsx`** — CSV export failure is silent. `catch` only calls `console.error`. Add `toast.error("Export failed")`.
- [ ] **`ErrorLogs.jsx`** — Stack trace `<pre>` has no `max-height`. A long trace pushes the card to fill the page. Add `max-h-48 overflow-y-auto`.
- [ ] **All admin pages** — `console.error` in all catch blocks runs in production. Replace with no-op or gate on `import.meta.env.DEV`.

### TrustScan UI

- [ ] **`TrustScanLanding.jsx`** — No client-side URL format check before submission. Add basic validation (auto-prepend `https://` if missing, reject obvious non-URLs).
- [ ] **`TrustScanProgress.jsx`** — Polling at fixed 1200ms with no backoff or max count. Add exponential backoff or max of ~10 attempts.
- [ ] **`TrustScanReport.jsx`** — No loading state on mount. Add loading flag and `<PageState variant="loading">`.
- [ ] **`TrustScanReport.jsx`** — `shareReport` uses `report._id` to build the public URL. Verify this matches what `GET /trustscan/report/:id/public` expects vs the job `id` from params.
- [ ] **`TrustScanReport.jsx` + `PublicTrustScanReport.jsx`** — Factor breakdown JSX block is copy-pasted identically in both files. Extract into a shared `FactorBreakdown` component.
- [ ] **`PublicTrustScanReport.jsx`** — Raw API error message rendered directly in public UI. Confirm backend doesn't leak internal details in this endpoint's error messages.
- [ ] **`TrustScanHistory.jsx`** — `item.jobId` used for navigation without undefined guard. Add a check before calling `navigate`.

### Layout & Shared Components

- [ ] **`Navbar.jsx`** — `GuestNav` and `UserNav` defined as inner functions inside `Navbar`. New identity on every render causes React to unmount and remount them. Move outside the component.
- [ ] **`Navbar.jsx`** — `JSON.parse(localStorage.getItem("user"))` runs on every render. Wrap in `useMemo`.
- [ ] **`AdminNavbar.jsx`** — Fetches full notification list every 30 seconds just to count unread. Use `GET /api/notifications/count` when backend adds it.
- [ ] **`AdminNavbar.jsx`** — 30s poll fires even when tab is backgrounded. Add `visibilitychange` listener to pause.
- [ ] **`AdminNavbar.jsx`** — Missing Memes link in admin navbar.
- [ ] **`PublicLayout.jsx`** — Footer uses `<a href>` for internal routes — causes full page reload. Use `<Link to>`.
- [ ] **`PublicLayout.jsx`** — Footer routes `/security-docs`, `/privacy`, `/contact-soc` not defined anywhere — will 404. Add routes or remove links.
- [ ] **`NavDropdown.jsx`** — `<details>`/`<summary>` with controlled `open` prop is a fragile hybrid pattern. Consider replacing with a `<div>` + `aria-expanded`.
- [ ] **`NavDropdown.jsx`** — No `aria-expanded` or `aria-haspopup` attributes. Screen readers won't announce state.
- [ ] **`NavDropdown.jsx`** — No max-height on dropdown. Can extend off-screen on short viewports. Add `max-h-64 overflow-y-auto`.
- [ ] **`AccountMenu.jsx` + `AdminMenu.jsx`** — Hardcoded fallback paths not imported from `PATHS`. Import from `routes.config.js`.
- [ ] **`DashboardCore.jsx`** — `dailyCap` hardcoded to `100`. Should come from API or a shared constants file.
- [ ] **`DashboardCore.jsx`** — "Dark Mode (Soon)" button fires a toast in production. Remove or implement before demo.
- [ ] **`DashboardCore.jsx`** — `chartsLoaded` flag is redundant alongside `Suspense`. The `Suspense` fallback alone is sufficient. Remove `chartsLoaded` state.
- [ ] **`Modal.jsx`** — No focus trap when open. Tab key navigates through backdrop content behind the modal.
- [ ] **`Modal.jsx`** — No Escape key handler. Add `keydown` listener calling `onBackdropClick`.

### Auth Pages

- [ ] **`Login.jsx`** — Submit button missing `disabled={loading}`. Multiple requests can fire on repeated clicks.
- [ ] **`Login.jsx`** — Password minimum is 6 characters. Update to 8 when backend changes.
- [ ] **`Register.jsx`** — `tempEmail` stored in `localStorage`. Use `sessionStorage` — OTP flow is session-scoped.
- [ ] **`Register.jsx`** — Strength indicator threshold (`< 6`) inconsistent with submit guard (`< 6` exclusive). Align both, and update to 8 when backend changes.
- [ ] **`VerifyOTP.jsx`** — `attemptsRemaining` initialised to `5` client-side. Will show wrong count until first failed attempt. Show only after first error response.
- [ ] **`VerifyOTP.jsx`** — OTP input needs `inputMode="numeric"` and `pattern="[0-9]*"` for mobile keyboard.
- [ ] **`ForgotPassword.jsx`** — Enter key in email field submits the full reset form, not just the token request. Separate into two distinct UI steps or guard the submit.
- [ ] **`ForgotPassword.jsx`** — Password minimum is 6 characters. Update to 8 when backend changes.

### Remaining Pages

- [ ] **`Profile.jsx` + `Settings.jsx`** — Both have alias/bio edit and password change forms pointing to the same endpoints. Decide which page owns each form and remove the duplicate.
- [ ] **`Settings.jsx`** — `notificationsEnabled` preference stored in localStorage but nothing in the app reads it. Either wire it up or add a `// TODO` comment.
- [ ] **`Settings.jsx`** — Error state condition `if (error && !profileForm.alias && !profileForm.bio)` is fragile. Simplify to show error state whenever `error` is set post-load.
- [ ] **`ArticleDetail.jsx`** — `console.error` in catch block runs in production.
- [ ] **`ArticleDetail.jsx`** — `fetchArticle` missing from `useEffect` dependency array.
- [ ] **`VideoHub.jsx`** — `<iframe>` renders for any approved URL, not just YouTube embeds. Add a client-side allowlist check (only render iframe for `youtube.com/embed` origins).
- [ ] **`VideoHub.jsx`** — Both `toast.error` and `setError` fire on fetch failure. Remove the toast.
- [ ] **`Home.jsx`** — Supporting cards section links `/admin` publicly. Reveals the admin route to unauthenticated visitors. Remove or change the href.

### Services & Hooks

- [ ] **`dashboardService.js`** — `DEFAULT_LIMIT = 50` fetches far more data than displayed (sliced to 6 items). Change to `limit=6` for the recent display queries.
- [ ] **`dashboardService.js`** — All memes fetched then filtered client-side for user's own memes. Add a user filter param or dedicated `/memes/user` endpoint.
- [ ] **`dashboardService.js`** — Uses `GET /reports/user`. Update to `GET /reports/me` when backend removes the `/user` alias.
- [ ] **`dashboardService.js`** — `aiChecksCount` read from localStorage and presented as a dashboard stat. Add a comment it is a client-side estimate only.
- [ ] **`useReportFilters.js`** — `removeFilter` not wrapped in `useCallback`. Causes `activeChips` (which depends on it) to recompute on every render even when filters haven't changed.
- [ ] **`reportTaxonomy.js`** — No comment indicating this must stay in sync with the backend copy. Add: `// SYNC REQUIRED: must match server/src/constants/reportTaxonomy.js`.
- [ ] **`reportTaxonomy.js`** — `normalizeReportCategory` passes through unknown values unchanged. Add fallback to `"OTHER"` for unrecognised values.
- [ ] **`ReportFiltersToolbar.jsx`** — No debounce on search input. `ManageReports` triggers a fetch on every keystroke. Debounce either in the toolbar or consistently in all callers.

---

## 🟢 Code Quality — Nice to Have

- [ ] **`ErrorBoundary.jsx`** — `console.error` runs in production. `saveErrorContext` already handles persistence. Gate the console call on `import.meta.env.DEV`.
- [ ] **`errorReporter.js`** — `saveErrorContext` overwrites on each call — only the last error in a cascade is kept. Add a `// TODO` noting this limitation.
- [ ] **`economySync.js`** — Economy display state driven by localStorage, can drift from server. Add a comment noting this as a known limitation.
- [ ] **`trustscanPdf.js`** — Add a comment: `useCORS: true` silently blanks cross-origin assets in the PDF output.
- [ ] **`phishingQuestions.js`** — Only 5 questions. Add `// TODO: expand question bank`.
- [ ] **`vite.config.js`** — Explicitly set `build.sourcemap: false` to make the production source map policy a conscious decision rather than an implicit default.
- [ ] **`PrivateRoute.jsx`** — Add a comment explaining why `user?.token` is the `useEffect` dependency rather than the full `user` object.
- [ ] **`TrustScanProgress.jsx`** — Add `// Note: cosmetic progress only — not tied to real scan signals` comment on `getCompletedChecks`.
- [ ] **`ConfidenceBadge.jsx`** — Normalize `confidence` to title case before map lookup to handle casing variations from the server.
- [ ] **`EvidenceTimeline.jsx`** — Guard `event.durationMs` before dividing: `event.durationMs != null ? (event.durationMs / 1000).toFixed(2) + "s" : "—"`.
- [ ] **`EvidenceTimeline.jsx`** — Add index to composite key to handle same-key same-timestamp events: `` `${event.key}-${event.occurredAt}-${index}` ``.
- [ ] **`ScoreRing.jsx`** — Add `// TODO: remove RISKY/CAUTION/SAFE/STRONG entries after backend verdict migration` comment in `verdictClasses`.
- [ ] **`DashboardCore.jsx`** — XP progress bar uses `xp % 100` — assumes 100 XP per level. Add `// TODO` if XP curve changes.
- [ ] **`Profile.jsx`** — Badge key: use `badge.name` alone if names are unique rather than appending index.
- [ ] **`ManageUsers.jsx`** — Add a comment: `// INTENTIONAL: any ADMIN can promote users; SUPER_ADMIN is a dev-only recovery backdoor, not a public role tier`.
- [ ] **`EmptyState.jsx`** — Thin wrapper with no extra logic over `PageState`. Consider removing and using `PageState variant="empty"` directly.
- [ ] **`FeatureCard.jsx`** — Uses a local `cn()` instead of importing from `cn.js`. Align with the rest of the codebase.
- [ ] **`ViewReports.jsx`** — `console.error` in catch block. Remove or gate on DEV.
- [ ] **`ManageReports.jsx`** — `console.error` in catch blocks. Remove or gate on DEV.
- [ ] **`ManageArticles.jsx`** — `console.error` in catch blocks. Remove or gate on DEV.

---

## 🆕 Planned Frontend Features (Tied to Backend Additions)

- [ ] **User Notification Panel** — Build `GET /api/notifications/me` user-facing view once backend adds `recipient` field to `Notification` model. Keep admin `Notifications.jsx` pointing at `GET /api/notifications`.
- [ ] **Unread Count Endpoint** — Update `AdminNavbar` to use `GET /api/notifications/count` once backend adds it. Remove full-list polling.
- [ ] **Game Server Verification** — When backend adds server-side answer checking, update `PhishingGame.jsx` to send `{ questionId, answerId }` and render feedback from the response instead of client state.
- [ ] **Dark Mode** — Remove the "Dark Mode (Soon)" toast button from `DashboardCore`. Tailwind `darkMode: 'class'` is already in use throughout the app. Implement a toggle that sets/removes the `dark` class on `<html>` and persists to localStorage.

---

## 🚀 Production Upgrades — When Going Live

- [ ] **JWT in httpOnly cookies** — Migrate token storage from localStorage to httpOnly cookies. Requires backend `Set-Cookie` header changes and CORS `credentials: true`. All `localStorage.getItem("user")` reads of the token must be removed from the frontend.
- [ ] **Role from validated session** — After httpOnly cookie migration, derive `role` from the `/auth/validate` response and store in React context rather than reading from localStorage. Fixes all `isAdmin` display-gating inconsistencies.
- [ ] **React context for auth state** — Replace all scattered `JSON.parse(localStorage.getItem("user"))` calls with a single `AuthContext`. Fixes stale reads, eliminates redundant parses, and makes logout reliable.
- [ ] **Source maps** — Explicitly set `build.sourcemap: false` in `vite.config.js` for production.
- [ ] **Console cleanup** — Audit all `console.error` / `console.log` calls. Use a structured logger (e.g. `pino-browser`) or gate all console output on `import.meta.env.DEV`.
- [ ] **Pagination everywhere** — Add pagination or virtual scrolling to: `MemeHub`, `VideoHub`, `ManageArticles`, `ManageUsers`, `Notifications`, `MemeModeration`, `VideoModeration`.
- [ ] **iframe allowlist** — `VideoHub` should only render `<iframe>` for known safe embed domains (`youtube.com/embed`, `youtu.be`). All others render as a plain link.
- [ ] **ARIA audit** — `NavDropdown` needs `aria-expanded` + `aria-haspopup`. `Modal` needs focus trap and Escape handler. Audit all interactive components for keyboard accessibility.
- [ ] **Bundle analysis** — Run `vite-bundle-visualizer` to audit chunk sizes. `jsPDF` and `html2canvas` are already lazy-loaded correctly. Verify `recharts` is not pulled into the initial bundle.

---

## ✅ Already Correct / Good Decisions (for reference)

- `useReportFilters.js` — URL-synced filter state, full normalization and validation against known sets, cross-field category/subcategory dependency, chip labels with individual remove, `JSON.stringify` comparison to prevent unnecessary re-renders.
- `api.js` — Response envelope unwrapping (`{ success, data }`) in the interceptor. `isReportingCall` guard prevents infinite loop on error reporting endpoint.
- `PrivateRoute.jsx` — Server validation round-trip with TTL cache, request deduplication via shared promise, `mounted` flag preventing state update on unmounted component.
- `ViewReports.jsx` — `AbortController` + `requestIdRef` deduplication, 250ms debounce on filter changes, correct `REPORT_PUBLIC_STATUS_VALUES` filtering.
- `trustscanPdf.js` — Dynamic import of `html2canvas` and `jsPDF` (lazy-loaded correctly). Auto-orientation based on canvas dimensions.
- `TrustScanProgress.jsx` — Two separate `useEffect`s (initial fetch vs polling), interval cleanup on status change, `useCallback` on `fetchStatus`.
- `ScoreRing.jsx` — Conic gradient ring via pure CSS, cubic eased animation via `requestAnimationFrame`, `Math.max/min` bounds on score, fallback for unknown verdict values.
- `DashboardCore.jsx` — `React.lazy` + `Suspense` for Charts (heavy library loaded only on analytics tab). `useMemo` on tabs array.
- `ErrorBoundary.jsx` — Correct `getDerivedStateFromError` + `componentDidCatch` separation. `saveErrorContext` integration.
- `routes.config.js` — All paths centralised in `PATHS`. No hardcoded strings scattered across route files.
- `reportTaxonomy.js` — `REPORT_PUBLIC_STATUS_VALUES` as a `Set` for O(1) lookup. Legacy alias maps for clean migration. `getStatusLabel` falls back to `LEGACY_LABELS`.
- `MemeCard.jsx` — `refresh()` callback pattern avoids prop-drilling a setter. `syncUserCoins` after vote is correct.
- `ConfirmActionModal.jsx` — Correctly used for all destructive admin actions in `ManageUsers`.
- `Button.jsx` — `type="button"` default, `isDisabled` combining `disabled` and `loading`, `??` fallback on variant map.
- `Login.jsx` / `Register.jsx` / `ForgotPassword.jsx` — `sanitizeObject` applied before every auth API call. Anti-enumeration message on password reset token request.
- `VerifyOTP.jsx` — Countdown using `setTimeout` chain (correct, avoids `setInterval` drift). `tempEmail` cleaned from localStorage on success.
- `Settings.jsx` — `ConfirmActionModal` for account deletion. `performLogout` called after deletion.
- `PublicLayout.jsx` — `flex-1` on `<main>` correctly pushes footer to bottom.
- `PageState.jsx` — Three variants, fallback for unknown, optional action button correctly gated on both label and handler.
