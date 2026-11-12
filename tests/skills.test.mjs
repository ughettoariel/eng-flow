import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { repo, shippedFiles } from './helpers.mjs';

const folders = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : [];
const skillRoots = [
  path.join(repo, 'skills'),
  ...folders(path.join(repo, 'plugins')).map((plugin) => path.join(repo, 'plugins', plugin, 'skills')),
];
const skillDirs = skillRoots.flatMap((root) => folders(root).map((skill) => path.join(root, skill)));
const skills = skillDirs.map((dir) => path.basename(dir));
const dirOf = (skill) => skillDirs.find((dir) => path.basename(dir) === skill);
const skillFile = (skill) => path.join(dirOf(skill), 'SKILL.md');

test('every skill has a SKILL.md whose name matches its folder, with a description', () => {
  const invalid = skills.filter((skill) => {
    if (!existsSync(skillFile(skill))) return true;
    const fields = /^---\n([\s\S]*?)\n---/.exec(readFileSync(skillFile(skill), 'utf8'))?.[1] ?? '';
    return !fields.includes(`name: ${skill}\n`) || !/^description: \S/m.test(fields);
  });
  assert.deepEqual(invalid, []);
});

// Descriptions load in every session of every project that installs the plugin.
test('every skill description is one line of at most 300 characters, with no angle brackets', () => {
  const bad = skills.flatMap((skill) => {
    const description = /^description: (.*)$/m.exec(readFileSync(skillFile(skill), 'utf8'))?.[1] ?? '';
    const problems = [];
    if (description.length > 300) problems.push(`${skill}: ${description.length} characters`);
    if (/[<>]/.test(description)) problems.push(`${skill}: angle brackets`);
    return problems;
  });
  assert.deepEqual(bad, []);
});

test('skill scripts are plain Node modules with no package to install', () => {
  assert.deepEqual(
    skills.filter((skill) => existsSync(path.join(dirOf(skill), 'package.json'))),
    [],
  );
});

test('relative links in Markdown files point to files that exist', () => {
  const broken = [];
  for (const file of shippedFiles().filter((name) => name.endsWith('.md'))) {
    const text = readFileSync(path.join(repo, file), 'utf8')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`\n]*`/g, '');
    for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const clean = decodeURIComponent(target.split('#')[0]);
      if (clean && !existsSync(path.resolve(repo, path.dirname(file), clean))) {
        broken.push(`${file} -> ${target}`);
      }
    }
  }
  assert.deepEqual(broken, []);
});

const ticketLabels = [
  'enhancement',
  'bug',
  'documentation',
  'chore',
  'refactor',
  'epic',
  'spike',
  'security',
  'ready-for-agent',
  'ready-for-human',
];
const shippedMarkdown = () => shippedFiles().filter((name) => name.endsWith('.md'));
const linesMatching = (pattern) =>
  shippedMarkdown().flatMap((file) =>
    readFileSync(path.join(repo, file), 'utf8')
      .split('\n')
      .flatMap((line, index) => (pattern.test(line) ? [`${file}:${index + 1}`] : [])),
  );

test('setup-project creates every ticket label the skills use', () => {
  const setup = readFileSync(skillFile('setup-project'), 'utf8');
  assert.deepEqual(
    ticketLabels.filter((label) => !setup.includes(`\`${label}\``)),
    [],
  );
});

test('no shipped file names a type: label, which setup-project no longer creates', () => {
  assert.deepEqual(linesMatching(/type:[a-z]/), []);
});

// "Board" alone means the GitHub Project of ticket states; the screens live on the Design board.
test('no shipped file says UI board', () => {
  assert.deepEqual(linesMatching(/UI board/i), []);
});

// code-review and security-audit share Addy Osmani's scale: the verdict notes compare findings across rounds.
const severities = ['Critical', 'Required', 'Optional', 'Nit', 'FYI'];

test('code-review and security-audit report with the same severity scale', () => {
  const bad = ['code-review', 'security-audit']
    .filter((skill) => dirOf(skill))
    .flatMap((skill) => {
      const text = readFileSync(skillFile(skill), 'utf8');
      return severities.filter((severity) => !text.includes(`\`${severity}\``)).map((s) => `${skill}: ${s}`);
    });
  assert.deepEqual(bad, []);
  assert.match(readFileSync(skillFile('code-review'), 'utf8'), /`FAIL` when any `Critical` or `Required` is open/);
});

test('no shipped file uses the retired severities Important or Pre-existing', () => {
  assert.deepEqual(linesMatching(/`(Important|Pre-existing)`/), []);
});

test('slice does not use the Ready state, which the board no longer has', () => {
  assert.doesNotMatch(readFileSync(skillFile('slice'), 'utf8'), /\bReady\b/);
});
