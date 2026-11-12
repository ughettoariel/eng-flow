# Project config

eng-flow skills read `docs/agents/project.md` of the project. Every line is optional; a missing line falls back to the default named below.

```md
# Project

Checks: npm test && npm run lint
Setup: npm ci && cp ../.env .env
Tickets: github
Branches: {prefix}/{number}-{slug}
Sensitive paths: src/billing, src/auth
Board: https://github.com/users/octocat/projects/1
Agent account: none
Run: npm run dev, then open http://localhost:3000
Design board: none
Glossary: CONTEXT.md
ADRs: docs/adr

## PR rules

Anything the PR template does not already say.
```

| Line | Read by | Default |
| --- | --- | --- |
| `Checks` | `implement`, `code-review` | The commands the README or CI runs |
| `Setup` | `implement`, `verify-as-user` | None: a fresh checkout or worktree is ready as it is |
| `Tickets` | `wayfinder`, `spec`, `slice`, `grill`, `ship-ticket`, `run-epic` | None: those skills ask the owner once and suggest `setup-project`; `run-epic` needs `github` |
| `Board` | `slice`, `ship-ticket`, `run-epic` | `none`: no board, and no skill moves a Status |
| `Branches` | `ship-ticket`, `run-epic` | `{prefix}/{number}-{slug}`, the prefix from the type label as `ship-ticket` lists it; the epic is `epic/{number}-{slug}` |
| `Agent account` | `ship-ticket`, `run-epic` | `none`: sessions run as whatever account `gh` and git already use |
| `Sensitive paths` | `ship-ticket` | None: only the paths the size threshold already names |
| `Run` | `verify-as-user` | Found from the README; a project verification skill named here wins |
| `Design board` | `verify-as-user`, `file-pr` | `none`: captures go in the PR description |
| `Glossary` | `grill`, `spec` | `CONTEXT.md` |
| `ADRs` | `grill` | `docs/adr` |

`Setup` is what a new worktree needs before its checks or its app run: installing dependencies, copying untracked files such as `.env`, and a port that does not collide with another session's.

`Run` for a project with no app is `Run: no app` followed by how a change is checked, such as `Run: no app. Run npm test, then read the changed skill as an agent would and walk each criterion through it`. `verify-as-user` needs a check it can perform; a line that only says how to load the project gives it none.

`Agent account` is the GitHub login agents act as, a machine account with write access to the repository. With a login, `ship-ticket` and `run-epic` stop when `gh` runs as anyone else. How a session gets that account depends on the harness; for Claude Code see [claude-code.md](../../ship-ticket/references/claude-code.md).

`Board` is the GitHub Project of ticket states: `Backlog`, `In progress`, `Parked`, `In review`, `Done`. A ticket is Parked when its questions have no answer or it said `BLOCKED`; Parked does not count toward work in progress.

## Tickets

- `github`: the eng-flow ticket flow on GitHub Issues. An epic is an issue labelled `epic`, its tickets are sub-issues with one type label (`enhancement`, `bug`, `documentation`, `chore`, `refactor`) and its spikes are sub-issues labelled `spike`, blockers use GitHub's blocked-by relation, and spikes carry `ready-for-agent` or `ready-for-human`.
- A tracker name, with its project key or URL when it has one, such as `jira ABC` or `linear https://linear.app/acme/team/ENG`: the project already tracks work there.
- `none`: no tracker.

[tracker.md](tracker.md) has the commands for each.
