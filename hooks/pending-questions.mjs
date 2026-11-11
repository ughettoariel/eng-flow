#!/usr/bin/env node
// SessionStart hook: lists the questions waiting in .eng-flow/questions/ of the project's main
// checkout, so a new session offers to grill them. Prints nothing when there are none or when
// the session is not in a git repository. Claude Code adds what a SessionStart hook prints to
// the session's context.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
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

function sessionCwd() {
  try {
    return JSON.parse(readFileSync(0, 'utf8')).cwd ?? process.cwd();
  } catch {
    return process.cwd();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  process.stdout.write(report(pendingQuestions(questionsFolder(sessionCwd()))));
}
