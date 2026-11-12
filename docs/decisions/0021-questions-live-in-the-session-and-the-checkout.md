# Questions live in the session and in the checkout's .eng-flow/

A question for the owner is asked in the thread of the session that needs it. When no answer comes and the work goes on without it, the skill that asked parks it as one file in `.eng-flow/questions/` at the root of the checkout it works in, named after its ticket, never in a PR or issue comment. The skill also creates `.eng-flow/.gitignore` with `*`, so the folder is never committed and the project's `.gitignore` needs no entry. Nothing lists the folder at session start: a session that resumes a ticket reads that ticket's files when the owner asks.

## Considered options

- One folder in the main checkout, shared by every worktree. Rejected: a session in a worktree cannot write outside its folder without a permission prompt, and a headless run is refused, so the question it most needed to park is lost.
- A SessionStart hook that lists every parked question. Rejected: it needs a runtime in every project, and a session on one ticket does not need the questions of another.

## Consequences

- Removing a worktree removes its parked questions.
