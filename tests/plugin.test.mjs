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

test('every marketplace entry points at a plugin manifest with its name and a semantic version', () => {
  const marketplace = json('.claude-plugin/marketplace.json');
  assert.equal(marketplace.name, 'ughettoariel');
  const bad = marketplace.plugins.flatMap(({ name, source }) => {
    const manifest = path.join(source, '.claude-plugin', 'plugin.json');
    if (!existsSync(path.join(repo, manifest))) return [`${name}: no ${manifest}`];
    const plugin = json(manifest);
    if (plugin.name !== name) return [`${name}: manifest names ${plugin.name}`];
    return /^\d+\.\d+\.\d+$/.test(plugin.version) ? [] : [`${name}: version ${plugin.version}`];
  });
  assert.deepEqual(bad, []);
});

test('eng-flow ships no hooks, so installing it adds no runtime to a project', () => {
  assert.equal(existsSync(path.join(repo, 'hooks')), false);
});

test('ADR 0001 leaves enforcement to the project checks, with no hook or CLI of eng-flow', () => {
  const adr = readFileSync(path.join(repo, 'docs/decisions/0001-skills-in-prose-gates-in-code.md'), 'utf8');
  assert.doesNotMatch(adr, /\bhook\b|CLI command that refuses/);
});
