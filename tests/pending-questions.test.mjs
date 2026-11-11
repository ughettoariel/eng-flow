import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { pendingQuestions, questionsFolder, report } from '../hooks/pending-questions.mjs';

const scratch = realpathSync(mkdtempSync(path.join(tmpdir(), 'eng-flow-questions-')));
after(() => rmSync(scratch, { recursive: true, force: true }));

const git = (cwd, ...args) =>
  execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.com', ...args], {
    cwd,
    stdio: 'ignore',
  });

test('a worktree reads the questions of the main checkout', () => {
  const main = path.join(scratch, 'main');
  mkdirSync(main);
  git(main, 'init', '-q');
  git(main, 'commit', '-q', '--allow-empty', '-m', 'start');
  git(main, 'worktree', 'add', '-q', path.join(scratch, 'ticket'));
  const folder = path.join(main, '.eng-flow', 'questions');
  mkdirSync(folder, { recursive: true });
  writeFileSync(
    path.join(folder, '42-refund-window.md'),
    '# Refund window for cancelled orders\n\nTicket: #42\n',
  );
  writeFileSync(path.join(folder, 'notes.txt'), 'not a question');

  assert.equal(questionsFolder(path.join(scratch, 'ticket')), folder);
  const questions = pendingQuestions(questionsFolder(path.join(scratch, 'ticket')));
  assert.deepEqual(questions, [
    { file: path.join(folder, '42-refund-window.md'), title: 'Refund window for cancelled orders' },
  ]);
  assert.match(report(questions), /1 pending question\(s\)[\s\S]*Refund window for cancelled orders/);
});

test('outside a git repository, or with no questions, the hook prints nothing', () => {
  const plain = path.join(scratch, 'plain');
  mkdirSync(plain);
  assert.equal(questionsFolder(plain), null);
  assert.equal(report(pendingQuestions(questionsFolder(plain))), '');
});

const hook = path.join(import.meta.dirname, '..', 'hooks', 'pending-questions.mjs');
const runHook = (input) => execFileSync('node', [hook], { input: JSON.stringify(input), encoding: 'utf8' });
const untracked = (cwd) =>
  execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd, encoding: 'utf8' });

function repoWithQuestion(name) {
  const main = path.join(scratch, name);
  mkdirSync(main);
  git(main, 'init', '-q');
  const file = path.join(main, '.eng-flow', 'questions', 'general-scope.md');
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, '# Scope\n');
  return { main, file };
}

test('a question written during a session is ignored by git right after the write', () => {
  const { main, file } = repoWithQuestion('written');
  assert.equal(untracked(main), '.eng-flow/questions/general-scope.md\n');

  const output = runHook({ hook_event_name: 'PostToolUse', cwd: main, tool_input: { file_path: file } });

  assert.equal(output, '');
  assert.equal(untracked(main), '');
});

test('session start makes an existing questions folder ignore itself and lists its questions', () => {
  const { main } = repoWithQuestion('started');

  const output = runHook({ hook_event_name: 'SessionStart', cwd: main });

  assert.match(output, /1 pending question\(s\)[\s\S]*Scope/);
  assert.equal(untracked(main), '');
});

test('writing a file outside .eng-flow/ creates nothing', () => {
  const main = path.join(scratch, 'elsewhere');
  mkdirSync(main);
  git(main, 'init', '-q');
  writeFileSync(path.join(main, 'notes.md'), 'x');

  runHook({
    hook_event_name: 'PostToolUse',
    cwd: main,
    tool_input: { file_path: path.join(main, 'notes.md') },
  });

  assert.equal(untracked(main), 'notes.md\n');
});
