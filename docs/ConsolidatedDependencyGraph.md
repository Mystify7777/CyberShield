# CyberShield — Consolidated Upgrade Plan
> Full backend review complete: README, package.json, server.js, app.js, all middlewares, all utils, all routes, all controllers, all TrustScan services, reportTaxonomy.js, all 11 models, FastAPI AI service.
> Frontend review: pending (next session).

---

## Dependency Graph (Complete Backend)

```
CyberShield Backend (src/)
│
├── server.js                          ⚠️ no await on connectDB, dynamic import workaround
│   ├── app.js                         ⚠️ express.json() order, path shadowing, local file serving
│   └── config/db.js                   ✅ exits on failure — ⚠️ no reconnect handler
│
├── app.js
│   ├── middlewares/
│   │   ├── xssMiddleware.js           ✅ custom XSS sanitizer, replaces abandoned xss-clean
│   │   ├── sanitizeMiddleware.js      ✅ custom NoSQL injection guard
│   │   ├── authMiddleware.js          ⚠️ DB hit per request, silent catch
│   │   ├── roleMiddleware.js          ⚠️ no !req.user guard
│   │   ├── errorMiddleware.js         ⚠️ statusCode defaults to 200, leaks err.message
│   │   └── uploadMiddleware.js        ⚠️ unsafe filename, MIME bypass, local disk
│   │
│   ├── routes/
│   │   ├── authRoutes.js              ✅ per-endpoint rate limiting, good validation
│   │   │   └── controllers/authController.js     ⚠️ Math.random OTP, plaintext fallback, OTP_HASH_SECRET fallback
│   │   │
│   │   ├── trustScanRoutes.js         ⚠️ weak URL validation, no per-user scan limit
│   │   │   └── controllers/trustScanController.js ⚠️ public report leaks userId, Map leak, misleading job status
│   │   │       └── services/
│   │   │           ├── trustScanSignals.js        ✅ clean re-export facade
│   │   │           └── trustscan/
│   │   │               ├── index.js               ✅ barrel export
│   │   │               ├── constants.js           ✅ BASE_SCORE, MOCK_SCAN_DURATION_MS, verdict bands
│   │   │               ├── networkUtils.js        ✅ timeout wrapper, proper timer cleanup
│   │   │               ├── urlUtils.js            ⚠️ incomplete TLD list (use tldts/psl)
│   │   │               ├── rdapService.js         ✅ RDAP age lookup, graceful null on failure
│   │   │               ├── sslSignal.js           ⚠️ no early return for http: protocol
│   │   │               ├── headerSignal.js        ⚠️ infinite redirect risk, duplicate score weights
│   │   │               ├── domainSignal.js        ✅ parallel DNS, env vs NXDOMAIN distinction
│   │   │               ├── reputationSignal.js    ✅ graceful degradation, correct GSB API usage
│   │   │               ├── confidenceService.js   ⚠️ logic duplicated in scoringService
│   │   │               ├── scoringService.js      ⚠️ re-implements confidenceService logic
│   │   │               ├── factorBuilders.js      ✅ softened header impact, placeholder ready
│   │   │               └── summaryService.js      ✅ clean template sentence generation
│   │   │
│   │   ├── adminRoutes.js             ⚠️ promoteToAdmin should be superAdminOnly
│   │   │   └── controllers/adminController.js    ⚠️ no cascade delete, unbounded user list, console.log
│   │   │
│   │   ├── aiRoutes.js                ⚠️ parsePositiveNumber duplicated (3rd copy)
│   │   │   └── controllers/aiController.js       ⚠️ raw AI response shape to client
│   │   │       └── services/aiService.js         ⚠️ no axios timeout, console.error
│   │   │
│   │   ├── articleRoutes.js           ⚠️ escape() wrong for content fields
│   │   │   └── controllers/articleController.js  ⚠️ unbounded list, no author notification on status change
│   │   │
│   │   ├── forumRoutes.js             ⚠️ no input validation on createPost/addReply
│   │   │   └── controllers/forumController.js    ✅ clean pagination, nested try/catch for economy errors
│   │   │
│   │   ├── gameRoutes.js              🔴 client-trusted correct answer
│   │   │   └── controllers/gameController.js     🔴 correct: true from client, no server verification
│   │   │
│   │   ├── memeRoutes.js              ✅ good structure, upload + vote rate limiting
│   │   │   └── controllers/memeController.js     ⚠️ unbounded list, 5 sequential DB writes on vote
│   │   │
│   │   ├── notificationRoutes.js      ❓ admin-only currently, user notifications planned
│   │   │   └── controllers/notificationController.js  ⚠️ unbounded fetch, no unread count endpoint
│   │   │
│   │   ├── reportRoutes.js            ✅ best validated route file, cross-field validation
│   │   │   └── controllers/reportController.js   ⚠️ redundant null set, no status change notification, in-memory filter
│   │   │
│   │   ├── systemRoutes.js            ⚠️ client-errors open write, no rate limit
│   │   │   └── controllers/systemController.js   ⚠️ regex injection, spoofable userId, unbounded CSV
│   │   │
│   │   ├── userRoutes.js              ✅ clean, good length limits
│   │   │   └── controllers/userController.js     ✅ best controller, cascade delete, minor Promise.all gap
│   │   │
│   │   └── videoRoutes.js             ✅ clean
│   │       └── controllers/videoController.js    ⚠️ unbounded list
│   │
│   └── utils/
│       ├── logger.js                  ⚠️ console-based, no structured logging
│       ├── generateToken.js           ⚠️ only id in JWT, causes DB hit per auth request
│       ├── encryption.js              ⚠️ crypto-js, no IV, weak key derivation
│       ├── economy.js                 ⚠️ race condition on coin updates, read-modify-write
│       ├── gamification.js            ⚠️ race condition, hardcoded badges, wrong XP ordering
│       ├── metrics.js                 ✅ atomic $inc, needs try/catch wrapper
│       ├── reportList.js              ⚠️ in-memory filter+sort, won't scale
│       ├── response.js                ✅ consistent API response shape
│       └── sendEmail.js              ✅ Brevo transactional email, keeps sendEmail() contract
│
├── constants/
│   └── reportTaxonomy.js             ✅ well-structured — ⚠️ normalize functions pass through unknown values, ESCALATED rank wrong
│
├── models/
│   ├── User.js                        ⚠️ TTL on otpExpires deletes user documents, lastPlayedGame duplicate, no toJSON strip
│   ├── Report.js                      ✅ best model — ⚠️ no changedBy in history, no indexes, contactEmail unvalidated
│   ├── Article.js                     ⚠️ legacy category enum, no maxlength, no indexes
│   ├── ForumPost.js                   ⚠️ no required/maxlength on any field, embedded replies will hit 16MB limit
│   ├── Meme.js                        ⚠️ voter arrays unscalable, commentsEnabled has no comments feature
│   ├── Video.js                       ⚠️ no maxlength, no URL validator, no indexes
│   ├── Notification.js                🔴 no recipient field — blocks planned user notification system
│   ├── TrustScanJob.js                ✅ clean, indexes correct, status enum correct
│   ├── TrustScanReport.js             ⚠️ verdict enum has deprecated values (RISKY/CAUTION/SAFE/STRONG)
│   ├── AnalyticsMetric.js             ✅ clean
│   └── ClientErrorLog.js              ⚠️ no TTL index, no maxlength on message/stack
│
└── AI Service (FastAPI)
    ├── main.py                        ✅ clean entry point
    ├── requirements.txt               ⚠️ no version pins
    ├── app/routes/predict.py          ⚠️ no error handling, no input length validation
    ├── app/services/predictor.py      ⚠️ substring matching, hardcoded confidence, not a real ML model
    └── app/services/preprocess.py     ⚠️ dead code — defined but never imported
```

---

**Legend:**
- ✅ Good — intentional, correct design
- ⚠️ Needs attention — flagged, fix when possible
- 🔴 Critical — security or correctness issue, fix before demo
- ❓ Unclear — design decision to revisit

---

