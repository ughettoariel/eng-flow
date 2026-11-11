import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';

export const repo = path.resolve(import.meta.dirname, '..');

const untracked = new Set(['.git', 'node_modules', 'sources', '.remember', '.eng-flow', '.claude']);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (untracked.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [path.relative(repo, full)];
  });
}

// The files the repository ships: git's list when it has one, otherwise every file outside the
// folders that stay untracked.
export function shippedFiles() {
  try {
    const listed = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
      cwd: repo,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return listed.split('\n').filter(Boolean);
  } catch {
    return walk(repo);
  }
}
