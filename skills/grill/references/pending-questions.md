# Pending questions

Every question is asked in the thread first. Park it in `.eng-flow/questions/` when no answer comes and the session has to go on: the question tool returned without an answer, nobody is on the session (a background or headless run), or the owner said to keep going. Then say in the thread that it is parked and keep working on what does not depend on it. When nothing can go on without the answer, park it anyway and stop with `BLOCKED` and the question. The file is how another session, or this one after a restart, knows the question is still open.

The folder sits in the main checkout, never in a worktree, so every session of the project reads the same files. Find it from any worktree:

```bash
echo "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.eng-flow/questions"
```

The folder is never committed: it holds its own `.gitignore` with the single line `*`, as pytest does for `.pytest_cache/`. The plugin's hooks write it as soon as a file tool writes a question, and again at session start, so the project's own `.gitignore` needs no entry. Write questions with the file tool, not through the shell, so the hook sees them.

## One file per question

Name it `<ticket number>-<topic>.md`, such as `42-refund-window.md`. A question with no ticket uses `general-<topic>.md`.

```md
# Refund window for cancelled orders

Ticket: #42
Asked: 2026-11-11
Answers: the owner

## Context

What is being decided, why it matters, and the fact behind it.

## Options

A. (Recommended) What choosing it means and what it costs.
B. What choosing it means and what it costs.
```

`Answers` names who decides when it is not the owner, such as a client or a supplier.

## When it is answered

Whichever session gets the answer records the decision in the ticket's `## Decisions` section and deletes the file. A file that stays is a question still open.
