# Project config

eng-flow skills read `docs/agents/project.md` of the project. Every line is optional; a missing line falls back to the default named below.

```md
# Project

Checks: npm test && npm run lint
Tickets: github
Run: npm run dev, then open http://localhost:3000
UI board: none
Glossary: CONTEXT.md
ADRs: docs/adr

## PR rules

Anything the PR template does not already say.
```

| Line | Read by | Default |
| --- | --- | --- |
| `Checks` | `implement`, `code-review` | The commands the README or CI runs |
| `Tickets` | `wayfinder`, `spec`, `slice`, `grill` | None: those skills ask the owner once and suggest `setup-project` |
| `Run` | `verify-as-user` | Found from the README; a project verification skill named here wins |
| `UI board` | `verify-as-user`, `file-pr` | `none`: captures go in the PR description |
| `Glossary` | `grill`, `spec` | `CONTEXT.md` |
| `ADRs` | `grill` | `docs/adr` |

## Tickets

- `github`: the eng-flow ticket flow on GitHub Issues. An epic is an issue labelled `type:epic`, its tickets and spikes are sub-issues labelled `type:story`, `type:task`, `type:bug` or `type:spike`, blockers use GitHub's blocked-by relation, and spikes carry `ready-for-agent` or `ready-for-human`. This is the layout the skills describe.
- A tracker name, with its project key or URL when it has one, such as `jira ABC` or `linear https://linear.app/acme/team/ENG`: the project already tracks work there. Keep the same structure (an epic, its child tickets, blockers, the ticket's type) in that tracker's own fields. File through its MCP server or CLI when the session has one; otherwise write each issue's title and body in the session for the owner to file, and wait for their keys before wiring blockers. Never open GitHub issues for it.
- `none`: no tracker. `spec` and `slice` return their text in the session, the request the owner gave is the ticket, and `grill` records decisions in its summary and, when they pass the ADR test, in an ADR.
