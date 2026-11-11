#!/usr/bin/env node
// Clones every repository in sources.json into sources/<directory> at its pinned commit.
// Usage: node scripts/fetch-sources.mjs [--update]
//   default   clone what is missing and move existing clones to their pinned commit;
//             a clone with local changes is left as it is and the run exits with 1
//   --update  fetch each source's default branch and print the new commit, without
//             touching sources.json: review the change, then pin it there by hand.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const { repositories } = JSON.parse(readFileSync(path.join(root, 'sources.json'), 'utf8'));
const update = process.argv.includes('--update');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const short = (sha) => sha.slice(0, 7);

function clone(repo, dir) {
  execFileSync('git', ['init', '-q', dir]);
  git(dir, 'remote', 'add', 'origin', repo.url);
  if (repo.sparse_scope) git(dir, 'sparse-checkout', 'set', repo.sparse_scope);
  git(dir, 'fetch', '-q', '--depth', '1', 'origin', repo.commit);
  git(dir, 'checkout', '-q', 'FETCH_HEAD');
  console.log(`cloned  ${repo.name} at ${short(repo.commit)}`);
}

function pin(repo, dir) {
  const head = git(dir, 'rev-parse', 'HEAD');
  if (head === repo.commit) {
    console.log(`kept    ${repo.name} at ${short(head)}`);
  } else if (git(dir, 'status', '--porcelain') !== '') {
    console.log(`dirty   ${repo.name} at ${short(head)}, pinned ${short(repo.commit)}: not moved`);
    process.exitCode = 1;
  } else {
    git(dir, 'fetch', '-q', '--depth', '1', 'origin', repo.commit);
    git(dir, 'checkout', '-q', 'FETCH_HEAD');
    console.log(`moved   ${repo.name} from ${short(head)} to ${short(repo.commit)}`);
  }
}

function checkLatest(repo, dir) {
  git(dir, 'fetch', '-q', '--depth', '1', 'origin', 'HEAD');
  const latest = git(dir, 'rev-parse', 'FETCH_HEAD');
  const status = latest === repo.commit ? 'current' : `new commit ${latest} (pinned ${short(repo.commit)})`;
  console.log(`checked ${repo.name}: ${status}`);
}

for (const repo of repositories) {
  const dir = path.join(root, 'sources', repo.directory);
  if (!existsSync(dir)) clone(repo, dir);
  else if (update) checkLatest(repo, dir);
  else pin(repo, dir);
}
