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
