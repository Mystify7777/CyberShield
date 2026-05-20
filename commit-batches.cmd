@echo off
cd /d "%~dp0"

REM Commit 1: Add .logs file
git add .logs
git commit -m "feat: initialize machine-readable changelog log file" -m "Add .logs JSON file with structured changelog format and initial entry documenting system initialization" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
echo Commit 1 done: .logs

REM Commit 2: Add changelog script
git add scripts/add-changelog.js
git commit -m "feat: add automated changelog append script" -m "Create scripts/add-changelog.js with interactive and --auto modes.
Interactive prompts for title, description, category, files, priority.
Auto mode extracts last commit info and auto-detects category from commit prefix." -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
echo Commit 2 done: scripts/add-changelog.js

REM Commit 3: Add documentation
git add docs/logs.md
git commit -m "docs: add changelog system documentation" -m "Create docs/logs.md explaining the .logs format and how to use add-changelog.js script" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
echo Commit 3 done: docs/logs.md

echo.
echo All commits completed!
git log --oneline -3
