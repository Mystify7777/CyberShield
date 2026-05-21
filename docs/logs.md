# 📊 Automated Changelog

This repository maintains a machine-readable changelog at `.logs` to help humans and AI track changes.

Usage

- Automatic (recommended via git hook): `node scripts/add-changelog.js --auto`
- Manual: `node scripts/add-changelog.js` and answer prompts

The `.logs` file is JSON with entries including date, category, title, description, files, priority and status.

## Automated QA Smoke (2026-05-21T08:50:33Z)

- **Report**: docs/qa-report.md
- **Summary**: 8 passed, 1 failed, 9 total
- **Notes**: The failing check is `POST /api/ai/predict` which returned HTTP 500 (masked message: "AI service failed"). Local invocation of `analyzeText()` succeeded, indicating the production instance requires server-side logs to diagnose.

Please see `docs/qa-report.md` for full test details.