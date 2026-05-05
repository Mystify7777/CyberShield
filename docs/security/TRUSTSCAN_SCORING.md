# TrustScan Scoring Model

## Goal
Produce a transparent trust score that explains why a URL appears safer or riskier.

## Score Range
- 0 to 100
- higher is better

Current score behavior:
- confidence-based score caps prevent low-confidence scans from reaching the top band
- high-confidence scans can reach the full 100 score ceiling
- medium-confidence scans cap below STRONG
- low-confidence scans cap below SAFE

Suggested interpretation:
- 80 to 100: low risk
- 50 to 79: medium risk
- 0 to 49: high risk

## Example Weighting Rules
- SSL expired: -30
- Domain appears on blacklist: -70
- Missing Content-Security-Policy header: softened to avoid over-penalizing otherwise healthy sites
- Newly registered domain: -20 or worse depending on signal quality
- Good reputation from trusted source: +20
- DNS hard failures are reserved for true non-resolution; missing MX/NS alone should not trigger a hard penalty

## Factor Categories
- Transport security (TLS, cert validity)
- Infrastructure signals (DNS and hosting patterns)
- Reputation signals (known bad or trusted sources)
- Header hygiene and baseline web hardening
- Domain lifecycle indicators (age, registration recency)

Confidence signals also influence the final score ceiling when only partial evidence is available.

## Scoring Process
1. collect passive signals
2. normalize values to internal factor format
3. apply weighted adjustments
4. clamp result to 0..100
5. generate human-readable rationale

## Design Principles
- explainability over black-box scoring
- consistent output for same inputs
- conservative confidence when signals are weak
- avoid hard claims from sparse data

## Future Extensions
- confidence bands tied to signal quality
- historical drift detection for domain behavior
- organization-specific risk profiles in SaaS mode
