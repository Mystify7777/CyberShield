# TODO - CyberShield

## 🔴 High Priority

### Phase 1: Setup
- [x] Setup project structure
- [x] Initialize React app with Vite
- [x] Initialize Express server
- [x] Connect frontend with backend

---

### Phase 2: Authentication
- [x] User registration API
- [x] Login API
- [x] JWT authentication
- [x] Protected routes
- [x] Public route model (home + public read pages)
- [x] Suspended account enforcement

---

### Phase 3: Incident Reporting
- [x] Create report model
- [x] Submit report API
- [x] Fetch reports API
- [x] Upload evidence (file upload with multer)
- [x] Enhanced report fields (severity, contact email)
- [x] Stabilize My Reports filtering (request cancellation, latest-response guard, debounce)

---

### Phase 4: AI Integration
- [x] Create Python API
- [x] Implement scam classifier
- [x] Connect backend to AI API

---

### Phase 5: Knowledge Hub
- [x] Create article model
- [x] Add article API (admin)
- [x] Fetch articles API
- [x] User-submitted articles with approval workflow
- [x] Admin moderation system

---

### Phase 6: Admin Dashboard
- [x] View reports
- [x] Update report status
- [x] Manage users
- [x] Promote user to admin
- [x] Suspend user account
- [x] Demote admin (super admin only)

---

### Phase 7: Deployment
- [ ] Deploy frontend
- [ ] Deploy backend
- [ ] Deploy AI service

---

### Phase 8: Modular Dashboard System
- [x] Lock architecture and update docs first
- [x] Refactor reusable analytics dashboard component to dynamic props-driven model
- [x] Build tab-based `ClientDashboard` (overview, analytics, reports)
- [x] Build tab-based `AdminDashboard` (overview, analytics, moderation)
- [x] Hook real API sources and frontend-calculated metrics
- [x] Add lazy-loaded charts for analytics tabs only
- [x] Add dark mode ready state wiring (without forcing global theme)
- [ ] Add chart visualization library integration (optional polish)
- [x] Add role-specific endpoint hardening (`/reports/user`, `/articles/user`, `/forum/user`) to avoid broad fetch + frontend filtering

---

### Phase 9: Retention and Engagement Product Expansion

Priority 1 (must-do):

- [x] Gamification foundation (XP, levels, streak tracking)
- [x] Short video content hub (submission + admin moderation + public approved feed)
- [x] Meme submission + moderation flow (community voting + auto-flag + admin review)
- [x] Dashboard integration for XP, level progress, and engagement KPIs

Priority 2:

- [x] Mini phishing detector game (part of Fun & Learn module)
- [x] Daily streak reward loop
- [x] Badge system foundation (Rookie, Cyber Warrior, Elite Defender)
- [ ] Badge expansion (Meme Lord, Scam Spotter, Cyber Gamer, challenge badges)

Priority 3:

- [ ] Awareness score system
- [ ] Weekly challenge system
- [ ] Activity feed and engagement timeline

Skip for now:

- [ ] Complex multiplayer game modes
- [ ] Real ML behavioral models
- [ ] Heavy animation systems

---

### Phase 10: Meme + Fun Hub (Learning + Engagement)

**Module Purpose:** Gamified learning through memes and interactive quizzes to increase engagement and cybersecurity awareness

**A. Meme Hub** (user-generated, moderated content)

- [x] Meme model and database schema
- [x] File upload system for meme images (multer integration)
- [x] Meme submission API (`POST /api/memes`)
- [x] Meme moderation workflow (community vote-based auto-flag + admin moderation)
- [x] Public visible meme feed (`GET /api/memes`)
- [x] Voting system (upvote/downvote)
- [x] Trending/Latest feed sorting
- [x] Meme category support (SCAM, AWARENESS, FUN)
- [ ] Educational tag differentiation
- [x] Frontend Meme Hub page (`/memes`)
- [x] Frontend meme submission page (`/memes/upload`)
- [x] Admin meme moderation page (`/admin/memes`)

**B. Fun & Learn (Mini Games)** (interactive quiz-based learning)

- [x] Game 1: Phishing Detector (identify phishing messages)
- [ ] Game 2: URL Checker (identify malicious URLs)
- [ ] Game 3: Password Strength Challenge (rate password strength)
- [x] Games scoring and explanations
- [x] XP rewards for correct answers
- [x] Frontend Games hub/page (`/games`)
- [x] Game components and quiz logic

**C. Gamification Integration**

- [x] Update XP rules: meme uploaded (+10), meme liked (+2), game correct answer (+5)
- [ ] New badges: Meme Lord, Scam Spotter, Cyber Gamer
- [x] Dashboard integration showing meme activity and game stats (top meme likes insight)

**D. UI/UX Integration**

- [x] Update Navbar "Learn" section with Memes and Games links
- [x] Add in-page quick-create CTAs for Reports, Video Hub, and Meme Hub
- [x] Responsive meme card components
- [x] Meme card micro-feedback (+XP hint and trending badge)
- [ ] Game UI and feedback systems
- [x] Mobile-responsive meme feed and moderation pages

**E. Virtual Economy Layer**

- [x] Add coin field to user model with starter balance
- [x] Add economy utility for coin earn/spend rules
- [x] Add anti-farming controls (daily cap + cooldowns + diminishing rewards)
- [x] Daily login coin rewards
- [x] Meme upload coin spend + reward flow
- [x] Meme like receiver coin rewards
- [x] Downvote coin cost
- [x] Forum post/reply coin costs
- [x] Navbar coin balance display
- [x] Dashboard coin display + low coin warning
- [x] Dashboard wallet snapshot (remaining daily budget + UTC reset hint)
- [x] Local user coin sync after meme actions

**DECISION POINTS (confirm before implementation):**

- [x] **Meme Upload Type:** A (file upload via multer)
- [x] **Like System:** Simple voting (upvote/downvote)
- [ ] **Games Complexity:** Simple quiz-based (recommended) OR Interactive UI (more complex)?
- [x] **Games Complexity:** Simple quiz-based implementation selected for current release

---

### Phase 11: UI Improvement & Design System (Lightweight Modern Upgrade)

**Module Purpose:** Unified, modern UI with consistent spacing, colors, and component reusability

**Priority 1 — Global Consistency (MUST DO)**

- [ ] Standardize spacing scale (use Tailwind: p-4, p-6, gap-4, gap-6)
- [ ] Standardize border radius (`rounded-xl` everywhere)
- [ ] Standardize shadow system (`shadow-sm`, `shadow-md`)
- [ ] Replace all inconsistent font sizes with scale:
  - [ ] h1 → text-2xl / text-3xl
  - [ ] h2 → text-xl
  - [ ] body → text-sm / text-base
- [ ] Ensure consistent color palette (primary, secondary, neutral defined)
- [ ] Ensure that all the components and pages are ready for dark mode implementation.
- [ ] prepare the color pallete for dark mode integration too.

**Priority 2 — Design System Components (VERY IMPORTANT)**

- [ ] Create reusable `Button` component with variants
- [ ] Create reusable `Card` component
- [ ] Create reusable `Input` component
- [ ] Create reusable `Badge` component
- [ ] Create reusable `Modal` component (basic)

**Priority 3 — Layout Improvement**

- [ ] Add max-width container (`max-w-6xl mx-auto`)
- [ ] Add consistent page padding (`p-6`)
- [ ] Improve section separation (use spacing instead of borders)
- [ ] Align content to grid system

**Priority 4 — Navbar Refinement**

- [ ] Add subtle background blur or shadow
- [ ] Improve dropdown animation (fade + slide)
- [ ] Add active state indicator
- [ ] Add hover transitions

**Priority 5 — Dashboard Polish**

  
- [x] Improve stat cards (bigger numbers, muted labels)
- [x] Add subtle hover effect on cards
- [x] Improve spacing between sections
- [x] Add loading skeletons

Completed: Priority 5 dashboard polish has been implemented in the dashboard components.

**Priority 6 — Feedback & States**

- [x] Add loading states (buttons + pages)
- [x] Add empty states ("No reports yet")
- [x] Add error states (clean alerts)
- [x] Add success feedback (toasts or inline)

completed: Priority 6 feedback and states have been implemented across the client application.

**Priority 7 — Micro-Interactions**

- [ ] Add transitions to buttons (`transition-all duration-200`)
- [ ] Add hover scale (`hover:scale-[1.02]`)
- [ ] Add click feedback (`active:scale-95`)
- [ ] Smooth dropdown animation

**Priority 8 — Responsiveness**

- [ ] Fix navbar wrapping issues
- [ ] Stack cards on small screens
- [ ] Ensure proper padding on mobile (`px-4`)
- [ ] Test all major pages on small width

**Priority 9 — Visual Cleanup**

- [ ] Remove unnecessary borders
- [ ] Reduce excessive colors
- [ ] Replace harsh colors with muted tones
- [ ] Use gray scale properly (gray-500, gray-700)

**Priority 10 — Dark Mode (OPTIONAL)**

- [ ] Add dark mode toggle 
- [ ] Use Tailwind `dark:` classes

**Priority 11 — Content Hierarchy**

- [ ] Improve heading hierarchy
- [ ] Reduce text clutter
- [ ] Add spacing between sections
- [ ] Use subtle labels instead of heavy text

**Final Polish**

- [ ] Check consistency across all pages
- [ ] Fix alignment issues
- [ ] Ensure no broken layouts
- [ ] Smooth transitions everywhere


#### UI Roadmap
  
  **Completed:**
  - Design system components (cards, buttons, alerts, modals, forms)
  - Layout improvement (containers, grids, spacing system)
  - Navbar refinement
  - Dashboard polish
  - Feedback and states
  
  **Remaining:**
  - [ ] Global consistency audit in `client/src/index.css` (spacing, radius, shadows, typography)
  - [ ] Page-wide spacing audit across `client/src/pages/**` (container width, padding, section spacing, grid alignment)
  - [ ] Micro-interactions and visual cleanup (cards, buttons, links, empty/error states)
  - [ ] Responsiveness QA (navbar, dashboard, admin pages, forum, knowledge hub, profile, settings, memes, videos, auth flows)
  - [ ] Dark mode readiness and contrast checks
  - [ ] Navigation cleanup and final polish (optional restructuring and stale-component cleanup)n utility (XSS prevention light layer)



---

### Phase 12: Security Hardening & Operational (Fullscan Findings)

**HIGH Priority Findings to Implement:**

- [x] Add route-level rate limiting to auth routes:
  - [x] POST /api/auth/register (max 5 attempts per hour)
  - [x] POST /api/auth/login (max 10 attempts per 15 minutes)
  - [x] POST /api/auth/resend-otp (max 3 attempts per hour)
  - [x] POST /api/auth/forgot-password (max 5 attempts per hour)
- [x] Fix password reset suspension bypass:
  - [x] Prevent `isSuspended = false` from password reset flow
  - [x] Keep suspension separate from password recovery
- [x] Add AI endpoint input validation caps:
  - [x] Limit text payload size to reasonable max (e.g., 10KB)
  - [x] Add express-validator on /api/ai/predict route
- [x] Add upload file-size limits to multer:
  - [x] Set max file size cap (e.g., 50MB)
  - [x] Validate file type strictly (images, PDFs only)
  - [x] Add error handling for oversized uploads
- [ ] **BUG FIX:** Implement account suspension revocation:
  - [x] Add backend unsuspend endpoint (`PUT /api/admin/users/:id/unsuspend`)
  - [x] Show suspend/unsuspend toggle button based on current state in admin UI
  - [x] Add 2-step confirmation modal before executing unsuspend
- [x] **BUG FIX:** Make remove admin button visible in admin panel:
  - [x] Verify Remove Admin button renders in ManageUsers component
  - [x] Fix any CSS visibility issues
- [ ] **BUG FIX:** Add 2-step confirmation for critical operations:
  - [x] Remove Admin: Show confirmation modal with email/name display before executing
  - [x] Delete Account (self-service): Show confirmation modal with warning before permanent deletion
  - [x] Suspend Account: Show confirmation modal before suspending
  - [x] Unsuspend Account: Show confirmation modal before unsuspending
  - [x] Use consistent modal design across all operations

**MEDIUM Priority Findings to Implement:**

- [x] Shorten JWT token expiry (from 1 week to 24 hours)
  - [ ] Consider optional refresh token flow (deferred)
- [x] Add forum listing pagination:
  - [x] Implement page/limit query params
  - [x] Add server-side pagination caps
  - [x] Update frontend forum page to use paginated payload

---

## 🟡 Medium Priority
- [x] UI improvements (basic functional layout)
- [x] UI polishing pass (design system, cards, status indicators, clean navbars)
- [x] Premium UX pass (icons, toast notifications, loading states)
- [x] Add frontend + backend auth input validation (email format, required fields, password length)
- [x] Application Security (AppSec) implementation:
  - [x] Global security middleware (helmet, xss-clean, mongo-sanitize)
  - [x] Request validation/sanitization on auth endpoints (express-validator)
  - [x] Request validation/sanitization on report endpoints (express-validator)
  - [x] Frontend input sanitizatio  
  - [x] NoSQL injection prevention (express-mongo-sanitize middleware)
- [x] File upload system for reports (evidence):
  - [x] Multer package and upload middleware
  - [x] Report model enhancements (severity, contactEmail, evidence path)
  - [x] Frontend form with file input and FormData submission
  - [x] Evidence display in report detail pages
- [x] User-submitted content system:
  - [x] Article submission by authenticated users
  - [x] Admin approval workflow
  - [x] Status-based filtering (PUBLIC vs PENDING vs REJECTED)
  - [x] Admin moderation UI with approve/reject buttons
- [ ] Mobile responsiveness
  - [x] Responsive Navbar and AdminNavbar wrapping/stacking
  - [x] Responsive spacing/buttons for profile, reports, forum, articles, and AI pages
  - [ ] Final QA pass for auth/admin screens and edge-width devices
- [x] Add AI Detector frontend page (`/ai`)
- [x] Add Knowledge Hub list/detail frontend routes (`/articles`, `/articles/:id`)
- [x] Split admin frontend into pages (ManageReports, ManageUsers, ManageArticles)
- [x] User Profile module:
  - [x] Backend profile/stats endpoints
  - [x] Backend profile update + password change endpoints
  - [x] User model personalization fields (alias, bio)
  - [x] Frontend `/profile` page with stats and edit forms
  - [x] Navbar discoverability for profile
  - [x] Identity UX rule (alias-first display + username on hover)
- [x] Settings module:
  - [x] Frontend `/settings` page (profile, password, local preferences)
  - [x] Backend self-delete endpoint (`DELETE /api/users/me`)
  - [x] Danger Zone account deletion flow in UI
- [x] Community Forum end-to-end:
  - [x] Forum backend routes/controller/model
  - [x] Public forum listing page (`/forum`)
  - [x] Protected create post route (`/forum/create`)
  - [x] Auth-gated reply flow
  - [x] Navbar and dashboard discoverability
  - [x] Add reply submit button with improved styling (blue gradient button with hover effects)
- [ ] Error Logs UX enhancements:
  - [x] Quick filter presets (Last 24h, Last 7 days)
  - [x] One-click status filter presets (e.g., Only 5xx)
- [x] Backend token validation on sensitive flows:
  - [x] Validate JWT on protected pages before rendering sensitive data
  - [x] Don't rely solely on localStorage for auth state
- [ ] Remove legacy `UserDashboard.jsx` component:
  - [x] Confirm current dashboard uses `Dashboard.jsx` (not deprecated)
  - [x] Delete or archive old component
- [ ] Post-login navigation restructuring:
  - [ ] Redirect authenticated users from landing page to Forums instead of Dashboard
  - [ ] Move Dashboard page to Account section of navbar (accessible through profile/account dropdown)
  - [ ] Add Knowledge Hub, Create Report, and Forum links to main navbar after login
- [ ] Bonus marks features:
  - [ ] Export reports as PDF
  - [ ] Email notifications (fake/mock service)
  - [ ] Dark mode switch (global theme toggle + localStorage persistence)
  - [ ] Activity logs (user/admin action trail)
  - [ ] Profile picture upload
  - [ ] Recent activity section on profile page
  - [ ] Badge system (e.g., Top Contributor)

---

## 🟢 Low Priority
- [x] RBAC baseline enhancements (USER, ADMIN, SUPER_ADMIN)
- [ ] RBAC advanced enhancements (granular permissions, audit logging)
- [ ] Create `.env.example` files for team guidance:
  - [x] `server/.env.example` with all backend variables documented
  - [x] `client/.env.example` (VITE_API_URL documentation)
  - [x] `ai-service/.env.example` (if applicable)
- [ ] Startup script documentation:
  - [x] Single canonical recommendation per OS in onboarding
  - [x] Label fallback launchers clearly
  - [x] Document which method works best for CI/CD