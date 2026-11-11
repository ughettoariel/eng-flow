import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { repo } from './helpers.mjs';

const json = (file) => JSON.parse(readFileSync(path.join(repo, file), 'utf8'));

test('the plugin manifest names eng-flow with a semantic version', () => {
  const plugin = json('.claude-plugin/plugin.json');
  assert.equal(plugin.name, 'eng-flow');
  assert.match(plugin.version, /^\d+\.\d+\.\d+$/);
});

test('the marketplace lists eng-flow from the repository root', () => {
  const marketplace = json('.claude-plugin/marketplace.json');
  assert.equal(marketplace.name, 'ughettoariel');
  assert.deepEqual(
    marketplace.plugins.map(({ name, source }) => ({ name, source })),
    [{ name: 'eng-flow', source: './' }],
  );
});

test('every hook command runs a script the plugin ships', () => {
  const commands = Object.values(json('hooks/hooks.json').hooks)
    .flat()
    .flatMap((entry) => entry.hooks.map((hook) => hook.command));
  const missing = commands
    .map((command) => /\$\{CLAUDE_PLUGIN_ROOT\}\/([^"\s]+)/.exec(command)?.[1])
    .filter((file) => !file || !existsSync(path.join(repo, file)));
  assert.deepEqual(missing, []);
});
