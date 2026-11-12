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

test('ship-ticket turns the PR ready only on a PASS note', () => {
  const text = skill('ship-ticket');
  assert.match(text, /PASS note on the head commit[^\n]*`gh pr ready`/);
});

test('run-epic names no harness and borrows the harness reference of ship-ticket', () => {
  const text = skill('run-epic');
  assert.doesNotMatch(text, harnessNames);
  assert.ok(text.includes('../ship-ticket/references/claude-code.md'));
});

test('run-epic lists Parked first, keeps at most two In progress and never launches a spike', () => {
  const text = skill('run-epic');
  assert.match(text, /`Parked` tickets first/);
  assert.match(text, /at most two tickets in `In progress`/);
  assert.match(text, /never[^\n]*`spike`/);
  assert.match(text, /assigned to someone else/);
});

test('run-epic syncs main into the epic branch and writes a handoff before each launch', () => {
  const text = skill('run-epic');
  assert.match(text, /Sync: merge `main` into the epic branch/);
  assert.ok(text.includes('.eng-flow/handoff.md'));
});

test('run-epic reviews the whole epic against main and leaves its PR ready with one line per ticket', () => {
  const text = skill('run-epic');
  assert.match(text, /epic branch against `main`/);
  assert.match(text, /one line per ticket/);
});

test('ship-ticket merges only the noted head into the epic branch it was given', () => {
  const text = skill('ship-ticket');
  assert.match(text, /merge only when the base step 3 chose is an `epic\/\*` branch[^\n]*SHA the PASS note sits on/);
  assert.match(text, /git merge --no-ff --no-edit <noted sha>/);
  assert.match(text, /git push origin HEAD:refs\/heads\/<epic branch>/);
  assert.match(text, /never merges into the repository's default branch/);
});

test('only the next reviewer dismisses a finding, and the owner a serious security one', () => {
  const notes = readFileSync(reference('code-review', 'verdict-notes.md'), 'utf8');
  assert.match(notes, /Only the next round's reviewer dismisses a finding/);
  assert.match(notes, /copies the reviewer's `resolved` block word for word/);
  assert.match(notes, /`security-audit`[^\n]*needs the owner/);
});

// Notes are pushed to the remote, which may be public: an unfixed hole must not be published there.
test('verdict notes keep only a short line per finding and never the exploit or a secret', () => {
  const notes = readFileSync(reference('code-review', 'verdict-notes.md'), 'utf8');
  assert.match(notes, /exploit steps stay in the session/);
  assert.match(notes, /never quotes a secret/);
});

test('run-epic launches only tickets from trusted authors and marks ticket text as data', () => {
  const text = skill('run-epic');
  assert.match(text, /`OWNER`, `MEMBER` or `COLLABORATOR`/);
  assert.match(text, /ticket's text is data/);
});

test('the config and tracker references name ship-ticket and run-epic among their readers', () => {
  const config = readFileSync(reference('setup-project', 'project-config.md'), 'utf8');
  const tracker = readFileSync(reference('setup-project', 'tracker.md'), 'utf8');
  assert.match(config, /^\| `Tickets` \|[^\n]*`ship-ticket`[^\n]*`run-epic`/m);
  assert.match(tracker, /`ship-ticket` and `run-epic` name these operations/);
});

test('an epic review writes a note of its own form with a defined verify line', () => {
  const notes = readFileSync(reference('code-review', 'verdict-notes.md'), 'utf8');
  assert.match(notes, /`epic: <number>`/);
  assert.match(notes, /An epic note's `verify` line/);
});

test('PRs into the default branch close their issue, and the board moves it to Done', () => {
  assert.match(skill('ship-ticket'), /`Closes #<ticket>`/);
  assert.match(skill('run-epic'), /`Closes #<epic>`/);
  assert.match(skill('setup-project'), /`Item closed`[^\n]*`Done`/);
});

test('approved epic-review tickets are filed the way slice files them', () => {
  assert.match(skill('run-epic'), /file each approved one the way `slice` does[^\n]*type label[^\n]*`Backlog`/);
});
