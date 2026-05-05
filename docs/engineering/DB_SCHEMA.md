# CyberShield Database Schema

Primary datastore: MongoDB

## users
Purpose: identity, authorization, and engagement state.

Core fields:
- name, email, password
- role (USER, ADMIN, SUPER_ADMIN)
- isVerified, isSuspended
- verification and reset metadata
- alias, bio
- gamification fields: xp, level, streak, coins, badges
- anti-abuse counters and action timestamps

Indexes/constraints:
- unique email
- sparse unique alias
- OTP expiry index via otpExpires

## reports
Purpose: incident report lifecycle and moderation.

Core fields:
- user reference
- title, description
- category, subcategory
- severity, sourceChannel, affectedAsset
- evidence, contactEmail
- status and history timeline
- privacy flags: isAnonymous, isSensitive

## articles
Purpose: moderated cybersecurity knowledge content.

Core fields:
- title, content, category, tags
- createdBy reference
- status (PENDING, APPROVED, REJECTED)
- vote arrays (upvotes, downvotes)

## notifications
Purpose: admin notifications and moderation alerts.

Core fields:
- message, type
- isRead
- timestamps

## forum_posts
Purpose: community discussions and replies.

Core fields:
- author reference
- content/title fields
- reply objects
- moderation timestamps and status markers

## videos
Purpose: user-submitted awareness video workflow.

Core fields:
- title, url, category
- status and moderation metadata
- submitter reference

## memes
Purpose: moderated visual community content.

Core fields:
- image path, caption, category
- visibility/moderation status
- voting controls and counters
- creator reference

## analytics_metrics
Purpose: product activity counters and trend inputs.

Core fields:
- metric key
- numeric value
- optional segmentation metadata

## client_error_logs
Purpose: frontend/runtime observability from client reports.

Core fields:
- message, source, statusCode
- route/context metadata
- timestamps

## trustscan_jobs
Purpose: TrustScan execution lifecycle.

Fields:
- userId reference
- url
- normalizedDomain
- status (queued, running, completed, failed)
- startedAt, completedAt
- error metadata

Indexes/constraints:
- userId index
- normalizedDomain index
- status index

## trustscan_reports
Purpose: persisted TrustScan findings and scorecards.

Fields:
- jobId reference
- userId reference
- url
- normalizedDomain
- score
- verdict
- factors array (key, label, impact, status, reason, detail)
- summary
- scanDurationMs
- scanEvidence array (key, label, message, reason, status, durationMs, occurredAt)
- scanMetadata (ssl, headers, domain, reputation reasons)

Indexes/constraints:
- jobId index
- userId index
- normalizedDomain index

## trustscan_watchlists (future)
Purpose: track high-risk domains or patterns for monitoring.

Planned fields:
- owner scope (user or organization)
- indicators (domain, host, pattern)
- reason and priority
- lastObservedAt
