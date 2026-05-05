# TrustScan Architecture (V3)

## Pipeline Overview
1. URL Input
2. Normalize
3. Create Job
4. Poll Job Status
5. Completion Path Runs Passive Checks
6. Store Results
7. AI Summary and Report Rendering

## Component Responsibilities

### Frontend
- accepts URL input and basic validation
- submits scan request
- polls job status endpoint
- renders progress, scorecard, and report details

### Backend API
- validates request and enforces rate limits
- normalizes URL and creates job record
- advances job state during status polling and materializes reports on completion
- exposes job status, report retrieval, and public read-only report APIs
- enforces access control and policy checks

### TrustScan Execution Layer
- runs passive checks (DNS, TLS, headers, reputation) in the completion path
- writes factor results, scan evidence, and metadata into the report payload
- caches repeated report payloads by normalized URL for short-term reuse

### AI Service
- converts factor payload into readable summary
- returns concise explanation and confidence framing

### Data Layer
- trustscan_jobs: lifecycle state and progress markers
- trustscan_reports: completed analysis artifact with factors, evidence, metadata, and summary
- optional cache (Redis planned) for hot lookups and throttling support

## Reliability Considerations
- idempotent job creation by request fingerprint
- retries for transient external lookup failures
- timeout guards per check stage
- latest-state persistence for crash recovery
- short-lived in-memory cache for repeated scans of the same normalized URL

## Security and Safety Controls
- passive scanning only
- target validation and deny rules for prohibited ranges
- per-user and per-IP throttling
- auditable policy gate before completion-path execution

## Future Scale Direction
- dedicated queue backend
- worker autoscaling by queue depth
- Redis-backed dedupe and response caching
- partitioned storage and retention policies for scan artifacts
