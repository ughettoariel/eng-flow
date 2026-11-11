#!/usr/bin/env node
// SessionStart: lists the questions waiting in .eng-flow/questions/ of the project's main
// checkout, so a new session offers to grill them; Claude Code adds what this prints to the
// session's context. PostToolUse: a file just written under .eng-flow/ makes that folder ignore
// itself before anything can commit it.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function questionsFolder(cwd) {
  try {
    const common = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return path.join(path.dirname(common), '.eng-flow', 'questions');
  } catch {
    return null;
  }
}

// The folder ignores itself, as pytest does for .pytest_cache/, so a project that never edited
// its .gitignore still cannot commit a question.
export function ignoreItself(root) {
  if (!root || !existsSync(root)) return;
  const ignore = path.join(root, '.gitignore');
  if (!existsSync(ignore)) writeFileSync(ignore, '*\n');
}

export function engFlowRoot(file) {
  const marker = `${path.sep}.eng-flow${path.sep}`;
  const at = typeof file === 'string' ? file.indexOf(marker) : -1;
  return at === -1 ? null : file.slice(0, at + marker.length - 1);
}

export function pendingQuestions(folder) {
  if (!folder || !existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((name) => name.endsWith('.md'))
    .toSorted()
    .map((name) => {
      const file = path.join(folder, name);
      const title = /^# (.+)$/m.exec(readFileSync(file, 'utf8'))?.[1]?.trim() ?? name;
      return { file, title };
    });
}

export function report(questions) {
  if (questions.length === 0) return '';
  const lines = questions.map(({ file, title }) => `- ${title} (${file})`);
  return [
    `eng-flow: ${questions.length} pending question(s) for the owner in .eng-flow/questions/:`,
    ...lines,
    "Before other work, offer the owner a grill on them with the grill skill, one batch with each question's context and options.",
    '',
  ].join('\n');
}

function hookInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const input = hookInput();
  if (input.hook_event_name === 'PostToolUse') {
    ignoreItself(engFlowRoot(input.tool_input?.file_path));
  } else {
    const folder = questionsFolder(input.cwd ?? process.cwd());
    ignoreItself(folder && path.dirname(folder));
    process.stdout.write(report(pendingQuestions(folder)));
  }
}
