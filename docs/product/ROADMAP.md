# CyberShield Product Roadmap

## V3: TrustScan Foundation
Focus: trusted URL scanning flow and production-safe operations.

Deliverables:
- TrustScan URL submission and normalization
- async scan job lifecycle with progress state
- scorecard and scan detail report
- policy-constrained passive checks only
- history and basic usage limits
- baseline worker design for scan execution
- public shareable report view and PDF export
- evidence timeline and reputation signal card
- confidence-aware score calibration

Exit criteria:
- stable scan lifecycle from input to report
- documented scoring model and policy guardrails
- deployment + testing docs aligned with runtime

## V3.5: Intelligence Layer
Focus: improve signal quality, explainability, and operator value.

Deliverables:
- richer reputation aggregation and configuration-aware fallback states
- domain age, TLS detail, and DNS insight expansion
- explainable factor cards per score component
- trend surfaces for repeat suspicious domains
- watchlist-ready data structures and admin views
- trust score confidence caps and safer score calibration for sparse evidence

Exit criteria:
- measurable improvement in scan explainability
- low-noise signal composition for common scenarios

## V4: Scale and SaaS Readiness
Focus: operational maturity, multi-tenant patterns, and reliability under load.

Deliverables:
- queue-backed worker orchestration
- Redis-backed caching and throttle support
- tenant-aware limits, policies, and reporting
- audit trails and alerting integrations
- CI quality gates and release automation

Exit criteria:
- predictable performance under burst traffic
- operational dashboards and governance controls ready for scale
