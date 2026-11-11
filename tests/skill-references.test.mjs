import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { repo, shippedFiles } from './helpers.mjs';

// Skills the README lists as coming. A skill or principle that names one points at something
// the plugin does not have yet.
const COMING = [
  'orchestrate',
  'ship-ticket',
  'review-loop',
  'harden',
  'close-epic',
  'babysit-pr',
  'retro',
  'setup-project',
];

test('skills and principles name no skill the plugin does not have yet', () => {
  const named = new RegExp(`\`(${COMING.join('|')})\``);
  const bad = shippedFiles()
    .filter((file) => /^(skills|principles)\/.*\.md$/.test(file))
    .flatMap((file) => {
      const match = named.exec(readFileSync(path.join(repo, file), 'utf8'));
      return match ? [`${file}: names ${match[1]}`] : [];
    });
  assert.deepEqual(bad, []);
});
