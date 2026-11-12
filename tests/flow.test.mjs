import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { repo } from './helpers.mjs';

const skill = (name) => readFileSync(path.join(repo, 'skills', name, 'SKILL.md'), 'utf8');
const reference = (name, file) => path.join(repo, 'skills', name, 'references', file);

// The flow skills run in any harness; what a harness does differently lives in one reference each.
const harnessNames = /Claude Code|Codex|Cursor|Agent tool|Task tool|AskUserQuestion|subagent_type/;

test('ship-ticket names no harness and keeps the Claude Code steps in its own reference', () => {
  assert.doesNotMatch(skill('ship-ticket'), harnessNames);
  assert.ok(existsSync(reference('ship-ticket', 'claude-code.md')));
});

test('ship-ticket stops a ticket over three criteria with BLOCKED and a proposed split', () => {
  assert.match(skill('ship-ticket'), /more than three acceptance criteria[^\n]*`BLOCKED`[^\n]*split/);
});

// Decision 16 of the orchestration epic: the type label names the branch.
test('ship-ticket names the branch from the type label and asks when there is none', () => {
  const text = skill('ship-ticket');
  for (const [label, prefix] of [
    ['enhancement', 'feature'],
    ['bug', 'bug'],
    ['documentation', 'docs'],
    ['chore', 'chore'],
    ['refactor', 'refactor'],
  ]) {
    assert.match(text, new RegExp(`\`${label}\`[^|\\n]*\\|[^|\\n]*\`${prefix}/`), label);
  }
  assert.match(text, /no type label[^\n]*ask/i);
});

test('ship-ticket runs implement and file-pr and leaves a draft PR into the ticket base', () => {
  const text = skill('ship-ticket');
  assert.ok(text.includes('`implement`'));
  assert.match(text, /`file-pr`[^\n]*draft[^\n]*base/);
});

test('ship-ticket picks reviewers by the change-size threshold and always audits security tickets', () => {
  const text = skill('ship-ticket');
  assert.match(text, /at most two files[^\n]*under 50 changed lines[^\n]*authentication, payments, data access, configuration[^\n]*`Sensitive paths`/);
  assert.match(text, /`security`[^\n]*`security-audit`/);
  for (const reviewer of ['`code-review`', '`security-audit`', '`verify-as-user`']) assert.ok(text.includes(reviewer), reviewer);
});

test('ship-ticket parks a ticket after three rounds without PASS', () => {
  assert.match(skill('ship-ticket'), /three rounds[^\n]*`Parked`/);
});

test('ship-ticket turns the PR ready only on a PASS note and merges only into an epic branch', () => {
  const text = skill('ship-ticket');
  assert.match(text, /PASS note on the head commit[^\n]*`gh pr ready`/);
  assert.match(text, /never merges into `main`/);
});
