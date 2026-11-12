# Project config

eng-flow skills read `docs/agents/project.md` of the project. Every line is optional; a missing line falls back to the default named below.

```md
# Project

Checks: npm test && npm run lint
Setup: npm ci && cp ../.env .env
Tickets: github
Run: npm run dev, then open http://localhost:3000
UI board: none
Verify status: off
Glossary: CONTEXT.md
ADRs: docs/adr

## PR rules

Anything the PR template does not already say.
```

| Line | Read by | Default |
| --- | --- | --- |
| `Checks` | `implement`, `code-review` | The commands the README or CI runs |
| `Setup` | `implement`, `verify-as-user` | None: a fresh checkout or worktree is ready as it is |
| `Tickets` | `wayfinder`, `spec`, `slice`, `grill` | None: those skills ask the owner once and suggest `setup-project` |
| `Run` | `verify-as-user` | Found from the README; a project verification skill named here wins |
| `UI board` | `verify-as-user`, `file-pr` | `none`: captures go in the PR description |
| `Verify status` | `verify-as-user` | `off`: the verdict goes in the session and the PR description |
| `Glossary` | `grill`, `spec` | `CONTEXT.md` |
| `ADRs` | `grill` | `docs/adr` |

`Setup` is what a new worktree needs before its checks or its app run: installing dependencies, copying untracked files such as `.env`, and a port that does not collide with another session's.

`Verify status: on` also posts the verdict as the commit status `verify`, for a branch protection that requires it. It needs a token with write access to the repository, so it fails on forks.

## Tickets

- `github`: the eng-flow ticket flow on GitHub Issues. An epic is an issue labelled `type:epic`, its tickets and spikes are sub-issues labelled `type:story`, `type:task`, `type:bug` or `type:spike`, blockers use GitHub's blocked-by relation, and spikes carry `ready-for-agent` or `ready-for-human`.
- A tracker name, with its project key or URL when it has one, such as `jira ABC` or `linear https://linear.app/acme/team/ENG`: the project already tracks work there.
- `none`: no tracker.

[tracker.md](tracker.md) has the commands for each.
