import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { repo } from './helpers.mjs';

const read = (file) => readFileSync(path.join(repo, file), 'utf8');

function checks() {
  const line = read('docs/agents/project.md').match(/^Checks: (.+)$/m);
  assert.ok(line, 'docs/agents/project.md has no Checks line');
  return line[1].split(' && ');
}

// The skills run the Checks line before review and CI runs on every PR: a check in only one of
// them lets a branch pass in one place and fail in the other.
test('CI runs the same commands as the Checks line of docs/agents/project.md', () => {
  const steps = [...read('.github/workflows/ci.yml').matchAll(/^\s+- run: (.+)$/gm)].map(
    ([, command]) => command,
  );
  assert.deepEqual(
    steps.filter((command) => command !== 'npm ci'),
    checks(),
  );
});

test('the checks include the format check', () => {
  assert.ok(checks().includes('npm run format:check'));
});
