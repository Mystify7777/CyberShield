# CyberShield to Aquaveda Feature Transfer

This file lists CyberShield features and patterns that can be reused in Aquaveda without copying irrelevant product logic.

## Reusable Architecture Patterns

- Modular frontend folder structure with `pages`, `components`, `services`, `hooks`, and `layouts`
- Modular backend structure with `models`, `controllers`, `routes`, `services`, `utils`, and `middlewares`
- Route-driven page organization
- Centralized API service wrapper
- Environment variable based configuration
- Documentation-first workflow using context, todo, logs, and bugs files

## Reusable Security Patterns

- JWT authentication
- Role-based route protection
- Protected admin route pattern
- Input sanitization helpers
- Global security middleware layering
- Error boundary / error middleware separation
- Rate limiting and abuse controls

## Reusable UI and UX Patterns

- Unified layout components for navigation
- Admin dashboard shell pattern
- Card-based content presentation
- Toast notifications for async actions
- Loading states for async forms and fetches
- Public versus protected route separation
- Login/register form validation pattern

## Reusable Data and Product Patterns

- Approval-based content workflow
- Moderation queues
- Public read / authenticated write split
- Dashboard metrics aggregation pattern
- Coin or points-style engagement system if Aquaveda adds gamification later
- File upload handling with multer

## Reusable AI / Logic Patterns

- Rule-engine abstraction that can later be replaced with ML
- Service wrapper for AI or recommendation logic
- Input size validation before API calls
- Easy-to-swap backend service contract

## Reusable Ops and Delivery Patterns

- Cross-platform startup scripts
- Root README plus docs landing page
- Onboarding guide with setup checklist
- Example environment files
- Changelog-style logs file

## Not Recommended to Transfer Directly

- CyberShield-specific phishing game logic
- CyberShield-specific report, meme, and video moderation workflows
- CyberShield-specific wallet/coin economy rules unless Aquaveda explicitly wants gamified engagement
- Any cyber threat terminology that does not match Aquaveda's water-conservation domain

## Best Fits for Aquaveda Phase 1

1. Backend auth and RBAC skeleton
2. Frontend route and layout shell
3. API service abstraction
4. Documentation workflow
5. Env example files
