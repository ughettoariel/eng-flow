# eng-flow

An agent workflow for Claude Code, from an idea to a merged ticket. You decide what to build with the agent, approve the spec and its tickets once, and each ticket runs in its own session you can open and steer until it merges into its epic. Skills are prose; anything that must hold every time is a check in code.

## The flow

```text
1  Once per project        setup-project writes docs/agents/project.md and asks whether
                           to install the ticket flow on GitHub Issues, keep the tracker
                           the project already uses, or work without one

2  What to build           wayfinder   when the path is not clear: an epic of spikes
   with you                grill       settles open decisions with multiple-choice batches
                           spec        writes the epic's spec: one outcome, numbered criteria
                           slice       cuts it into at most 8 tickets, each with at most 3 criteria
                           ◆ you approve the spec and the tickets: your one approval

3  Which ticket is next    orchestrate takes the next Ready ticket with no open blocker,  (coming)
                           at most 2 in progress and 3 in review, one session per ticket

4  One ticket              ship-ticket runs the route for the ticket's type:              (coming)
   in its own session        diagnose      bugs: a test that fails for the reported reason
                             implement     a failing test per criterion, the smallest change
                             file-pr       a draft PR into the epic, problem before fix
                             code-review   a reviewer that did not write it: PASS or FAIL
                             verify-as-user  each criterion walked in the running app
```

Support skills, used when needed: `ui-quality` (UI rules with scored scans), `unslop` (plain writing) and `leaving-pr-comments`.

Questions are asked in the thread of the session that needs them. One that gets no answer while the work goes on is parked in `.eng-flow/questions/` of the project, and the next session that starts lists it and offers a grill. The folder carries its own `.gitignore`, so it is never committed. PRs and issues stay free of question comments.

## Why

Agents write code faster than a person can review it, so the limits are what keep the work reviewable: one session per ticket that you can open and steer, one outcome per epic, at most eight tickets per epic and three criteria per ticket, and a work-in-progress limit. Rules that must always hold are checks in code, not lines in a prompt. Each decision is an ADR in [docs/decisions/](docs/decisions/).

[principles/](principles/) holds the few engineering rules that hold in any stack: testing, security, data and contracts, and agent docs. `implement` and `code-review` read the ones a change touches, and the project's own rules win where they disagree.

## What is here and what is coming

| Available now | Coming |
| --- | --- |
| `setup-project`, `grill`, `wayfinder`, `spec`, `slice` | `orchestrate` |
| `diagnose`, `implement`, `file-pr`, `code-review`, `verify-as-user` | `ship-ticket` |
| `ui-quality`, `unslop`, `leaving-pr-comments` | |
| The SessionStart hook that lists pending questions | |

## Install

In Claude Code:

```text
/plugin marketplace add ughettoariel/eng-flow
/plugin install eng-flow@ughettoariel
```

From a terminal:

```bash
claude plugin marketplace add ughettoariel/eng-flow
claude plugin install eng-flow@ughettoariel
```

The skills load as `eng-flow:grill`, `eng-flow:spec` and so on. Update with `claude plugin marketplace update ughettoariel`; Claude Code installs a new version when `version` in `.claude-plugin/plugin.json` goes up.

In each project, run `setup-project` once. It writes `docs/agents/project.md` with the project's checks, how to run it, where its tickets live and its UI board, if it has one.

## Developing eng-flow

Node 24, and the tools from Homebrew:

```bash
brew install oxlint oxfmt gitleaks
```

```bash
npm test
```

```bash
npm run lint && npm run format:check && npm run secrets
```

`node scripts/fetch-sources.mjs` clones the upstream repositories into `sources/` at the commits in `sources.json`, for reference; the folder is never committed. CI runs the tests. Linting, formatting and the secrets scan are for working on this repository and run locally; projects that install the plugin use their own checks.

## Credits and licence

eng-flow builds on pstack, Matt Pocock's skills, Addy Osmani's agent-skills, Superpowers, tstack, the ZazenCodes software factory and the Claude Code team's post on code review. [CREDITS.md](CREDITS.md) says what each one contributed.

MIT, see [LICENSE](LICENSE). Copied skills keep their own licence next to them.
