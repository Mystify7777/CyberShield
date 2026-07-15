#!/usr/bin/env node
// Simple changelog appender usable interactively or from git hook (--auto)
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const rl = require('readline');

const LOG_PATH = path.join(process.cwd(), '.logs');

function loadLogs(){
  if(fs.existsSync(LOG_PATH)){
    try{ return JSON.parse(fs.readFileSync(LOG_PATH,'utf8')) }catch(e){
      console.error('Failed to parse .logs:', e); process.exit(1);
    }
  }
  return { format: 'Automated Changelog Log', description: 'Machine-readable changelog', categories: [], entries: [], lastUpdated: new Date().toISOString() };
}

function saveLogs(obj){
  obj.lastUpdated = new Date().toISOString();
  fs.writeFileSync(LOG_PATH, JSON.stringify(obj, null, 2), 'utf8');
}

function detectCategory(subject){
  const prefix = (subject.split(':')[0] || '').toLowerCase();
  if(prefix.startsWith('feat') || prefix==='feature') return 'Feature';
  if(prefix.startsWith('fix')) return 'Bugfix';
  if(prefix.startsWith('doc')) return 'Docs';
  if(prefix.startsWith('chore')||prefix.startsWith('config')) return 'Config';
  if(prefix.startsWith('refactor')) return 'Refactor';
  if(prefix.startsWith('perf')) return 'Performance';
  return 'Other';
}

function addEntry(entry){
  const logs = loadLogs();
  logs.entries = logs.entries || [];
  logs.entries.unshift(entry);
  saveLogs(logs);
  console.log('Appended entry to .logs');
}

async function interactive(){
  const rlif = rl.createInterface({ input: process.stdin, output: process.stdout });
  const q = (s) => new Promise(res=>rlif.question(s, res));
  const title = await q('Title: ');
  const description = await q('Description: ');
  const category = await q('Category (optional): ');
  const files = (await q('Files (comma-separated, optional): ')).split(',').map(s=>s.trim()).filter(Boolean);
  const priority = await q('Priority (low/medium/high) [medium]: ');
  rlif.close();
  addEntry({ date: new Date().toISOString().slice(0,10), category: category||detectCategory(title), title, description, files, priority: priority||'medium', status: 'completed' });
}

function autoFromGit(){
  try{
    const hash = execSync('git rev-parse HEAD', {stdio:['pipe','pipe','ignore']}).toString().trim();
    const meta = execSync('git log -1 --pretty=format:%ad%n%s%n%b --date=iso ' + hash, {stdio:['pipe','pipe','ignore']}).toString().split(/\r?\n/);
    const date = meta[0] ? new Date(meta[0]).toISOString().slice(0,10) : new Date().toISOString().slice(0,10);
    const subject = meta[1] || '(no message)';
    const body = meta.slice(2).join('\n').trim();
    const files = execSync('git diff-tree --no-commit-id --name-only -r ' + hash, {stdio:['pipe','pipe','ignore']}).toString().split(/\r?\n/).filter(Boolean);
    const entry = { date, category: detectCategory(subject), title: subject, description: body, files, priority: 'medium', status: 'completed' };
    addEntry(entry);
  }catch(e){ console.error('Failed to auto-create entry from git:', e.message); process.exit(1); }
}

const args = process.argv.slice(2);
if(args.includes('--auto')){ autoFromGit(); }
else if(args.includes('--help') || args.includes('-h')){
  console.log('Usage: node scripts/add-changelog.js [--auto]');
  process.exit(0);
}else{ interactive(); }
