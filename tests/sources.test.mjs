import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { repo } from './helpers.mjs';

const sources = JSON.parse(readFileSync(path.join(repo, 'sources.json'), 'utf8')).repositories;
const skillsRoot = path.join(repo, 'skills');
const skills = readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const read = (skill, name) => readFileSync(path.join(skillsRoot, skill, name), 'utf8');
const has = (skill, name) => existsSync(path.join(skillsRoot, skill, name));

export function licenceProblems(source, licence, sourceList) {
  const repoName = /`([\w.-]+\/[\w.-]+)`/.exec(source)?.[1];
  const upstream = sourceList.find((entry) => entry.repo === repoName);
  if (!upstream) return [`names ${repoName ?? 'no repository'}, which sources.json does not list`];
  const problems = [];
  if (!/`[0-9a-f]{40}`/.test(source)) problems.push('records no 40-character commit');
  if (upstream.license !== 'MIT') problems.push(`upstream licence is ${upstream.license}, not MIT`);
  if (!licence.startsWith('MIT License')) problems.push('LICENSE is not the MIT licence');
  if (!new RegExp(`Copyright \\(c\\) \\d{4} ${upstream.copyright}\\n`).test(licence)) {
    problems.push(`LICENSE does not carry the copyright of ${upstream.copyright}`);
  }
  if (!source.includes(upstream.copyright)) problems.push(`SOURCE.md does not name ${upstream.copyright}`);
  return problems;
}

test('every skill copied from another repository keeps its SOURCE.md and its licence, checked against sources.json', () => {
  const bad = skills
    .filter((skill) => has(skill, 'SOURCE.md') || has(skill, 'LICENSE'))
    .flatMap((skill) => {
      if (!has(skill, 'SOURCE.md')) return [`${skill}: LICENSE without SOURCE.md`];
      if (!has(skill, 'LICENSE')) return [`${skill}: SOURCE.md without LICENSE`];
      return licenceProblems(read(skill, 'SOURCE.md'), read(skill, 'LICENSE'), sources).map(
        (problem) => `${skill}: ${problem}`,
      );
    });
  assert.deepEqual(bad, []);
});

test('the licence check refuses a copy whose upstream or copyright does not match', () => {
  const upstream = [{ repo: 'someone/skills', license: 'MIT', copyright: 'Some One' }];
  const licence = 'MIT License\n\nCopyright (c) 2026 Some One\n';
  const source = `Adapted from \`someone/skills\`, commit \`${'a'.repeat(40)}\` (copyright Some One).`;
  assert.deepEqual(licenceProblems(source, licence, upstream), []);
  assert.match(licenceProblems(source.replace('someone', 'other'), licence, upstream)[0], /does not list/);
  assert.deepEqual(licenceProblems(source, licence.replace('Some One', 'Other'), upstream), [
    'LICENSE does not carry the copyright of Some One',
  ]);
});

test('every source in sources.json has a repository, a pinned commit, a licence and its copyright', () => {
  const bad = sources.filter(
    (entry) =>
      !/^[\w.-]+\/[\w.-]+$/.test(entry.repo) ||
      entry.url !== `https://github.com/${entry.repo}.git` ||
      !/^[0-9a-f]{40}$/.test(entry.commit) ||
      !entry.license ||
      !entry.copyright,
  );
  assert.deepEqual(bad, []);
});
