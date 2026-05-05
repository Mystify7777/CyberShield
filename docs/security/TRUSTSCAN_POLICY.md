# TrustScan Policy

## Purpose
Define what TrustScan is allowed to do and what it must never do.

## Allowed
- HTTP response header checks
- TLS certificate checks
- passive reputation checks
- DNS analysis
- public threat intelligence correlation

## Restricted
- brute force attempts
- exploit attempts
- intrusive scanning
- authenticated penetration testing
- credential stuffing or login probing
- denial-of-service style traffic generation

## Enforcement Rules
- all scans must pass URL and target validation
- prohibited targets are rejected before execution
- rate limits are enforced per user and IP
- policy violations are logged for admin review

## User Transparency
- UI must clearly label TrustScan as passive analysis
- reports must include explanation boundaries
- users must not be promised exploit validation or penetration outcomes

## Legal Boundaries
- TrustScan is a defensive, passive analysis feature
- TrustScan must not perform actions that could be interpreted as unauthorized access attempts
- operating regions and regulations should be reviewed before enabling new checks

## Change Control
Any expansion of checks beyond passive analysis requires:
1. security review
2. legal review
3. policy update
4. explicit release note entry
