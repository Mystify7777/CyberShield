#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const cwd = 'D:\\Desktop\\College\\PROJECT\\CyberShield';
process.chdir(cwd);

function run(cmd) {
  try {
    const output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(output.trim());
    return true;
  } catch (e) {
    console.error('Error:', e.message);
    return false;
  }
}

console.log('📝 Committing changelog system in batches...\n');

// Commit 1
console.log('Commit 1: Initialize .logs file');
run('git add .logs');
run('git commit -m "feat: initialize machine-readable changelog log file" -m "Add .logs JSON file with structured changelog format\n\nIncludes categories: Frontend, Backend, Docs, Config, CI/CD, Ops, Planning, Refactor, Bugfix, Feature, Performance, Other\nInitial entry documents system initialization\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"');
console.log('✓ Done\n');

// Commit 2
console.log('Commit 2: Add changelog script');
run('git add scripts/add-changelog.js');
run('git commit -m "feat: add automated changelog append script" -m "Create scripts/add-changelog.js with interactive and --auto modes\n\nInteractive mode prompts for title, description, category, files, and priority.\nAuto mode extracts last commit info via git and auto-detects category from commit prefix.\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"');
console.log('✓ Done\n');

// Commit 3
console.log('Commit 3: Add documentation');
run('git add docs/logs.md');
run('git commit -m "docs: add changelog system documentation" -m "Create docs/logs.md explaining the .logs format and how to use add-changelog.js\n\nDocs include usage examples for both interactive and auto modes.\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"');
console.log('✓ Done\n');

console.log('📊 All commits completed!\n');
console.log('Last 3 commits:');
run('git --no-pager log --oneline -3');
