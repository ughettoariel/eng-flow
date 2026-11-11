import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { repo, shippedFiles } from './helpers.mjs';

const UNTRACKED = ['sources/', '.eng-flow/'];

test('.gitignore keeps source clones and local state out of the repository', () => {
  const ignored = readFileSync(path.join(repo, '.gitignore'), 'utf8').split('\n');
  assert.deepEqual(
    UNTRACKED.filter((folder) => !ignored.includes(folder)),
    [],
  );
});

test('git ignores those folders and tracks nothing inside them', () => {
  const tracked = shippedFiles().filter((file) => UNTRACKED.some((folder) => file.startsWith(folder)));
  assert.deepEqual(tracked, []);
  let gitRepository = true;
  try {
    execFileSync('git', ['rev-parse', '--git-dir'], { cwd: repo, stdio: 'ignore' });
  } catch {
    gitRepository = false;
  }
  if (!gitRepository) return;
  const notIgnored = UNTRACKED.filter((folder) => {
    try {
      execFileSync('git', ['check-ignore', '-q', `${folder}probe`], { cwd: repo, stdio: 'ignore' });
      return false;
    } catch {
      return true;
    }
  });
  assert.deepEqual(notIgnored, []);
});
