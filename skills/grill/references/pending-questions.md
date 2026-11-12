# Pending questions

Every question is asked in the thread first. Park it in `.eng-flow/questions/` when no answer comes and the session has to go on: the question tool returned without an answer, nobody is on the session (a background or headless run), or the owner said to keep going. Then say in the thread that it is parked and keep working on what does not depend on it. When nothing can go on without the answer, park it anyway and stop with `BLOCKED` and the question. The file is how another session, or this one after a restart, knows the question is still open.

The folder sits at the root of the checkout the session works in: `$(git rev-parse --show-toplevel)/.eng-flow/questions/`. A worktree keeps its own, so a session never writes outside its folder, and the questions go away with the worktree they belong to.

The folder is never committed. Before writing the first question, create `.eng-flow/.gitignore` with the single line `*` when it is missing, as pytest does for `.pytest_cache/`, so the project's own `.gitignore` needs no entry.

Nothing lists the folder at session start. A session that resumes a ticket reads only the files that start with that ticket's number, when the owner asks for the ticket's pending questions.

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
