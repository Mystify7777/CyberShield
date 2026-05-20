# 📊 Automated Changelog

This repository maintains a machine-readable changelog at `.logs` to help humans and AI track changes.

Usage

- Automatic (recommended via git hook): `node scripts/add-changelog.js --auto`
- Manual: `node scripts/add-changelog.js` and answer prompts

The `.logs` file is JSON with entries including date, category, title, description, files, priority and status.