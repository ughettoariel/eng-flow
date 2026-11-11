# Pending questions

A question waits in `.eng-flow/questions/` when the person who decides is not in the session. The folder sits in the main checkout, never in a worktree, so every session of the project reads the same files. Find it from any worktree:

```bash
echo "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.eng-flow/questions"
```

The folder is never committed: the project's `.gitignore` lists `.eng-flow/`.

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

The session that asks it records the decision in the ticket's `## Decisions` section and deletes the file. A file that stays is a question still open.
