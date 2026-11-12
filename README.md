# eng-flow

An agent workflow for Claude Code and any harness that reads `SKILL.md`, from an idea to a merged ticket. You decide what to build with the agent, approve the spec and its tickets once, and each ticket runs in a session you can open and steer until its PR merges. Skills are prose; anything that must hold every time is a check of the project itself.

## The flow

```text
1  Once per project        setup-project writes docs/agents/project.md and asks whether
                           to install the ticket flow on GitHub Issues, keep the tracker
                           the project already uses, or work without one

2  What to build           wayfinder   when the path is not clear: an epic of spikes
   with you                grill       settles open decisions with multiple-choice batches
                           spec        writes the epic's spec: one outcome, numbered criteria
                           slice       cuts it into at most 8 tickets, each with at most 3 criteria
                           you approve the spec and the tickets once

3  The epic                run-epic        launches ready tickets, at most two in progress,
                                           keeps the board current, reviews the whole epic
                                           and leaves its PR into main for the owner

4  One ticket              ship-ticket     runs, in order:
                           diagnose        bugs: a test that fails for the reported reason
                           implement       a failing test per criterion, the smallest change
                           file-pr         a draft PR, problem before fix
                           code-review     a reviewer that did not write it: PASS or FAIL
                           security-audit  a threat model of the diff: PASS or FAIL
                           verify-as-user  each criterion walked in the running app
```

Each round's verdict is a git note on the commit it verified, under `refs/notes/eng-flow`, so PRs carry no statuses or verdict comments. A ticket merges itself into its epic branch on a PASS note; anything into `main` waits for the owner.

Questions are asked in the thread of the session that needs them. One that gets no answer while the work goes on is parked in `.eng-flow/questions/` of that checkout, named after its ticket, and read again when the owner asks for that ticket's pending questions. The folder carries its own `.gitignore`, so it is never committed. PRs and issues stay free of question comments.

## Why

Agents write code faster than a person can review it, so the limits are what keep the work reviewable: one outcome per epic, at most eight tickets per epic and three criteria per ticket. Rules that must always hold are checks in code, not lines in a prompt. Each decision is an ADR in [docs/decisions/](docs/decisions/).

eng-flow brings no engineering principles of its own. `implement` and `code-review` read the project's rules: its agent instruction files, lint and test config, and ADRs.

## What it needs

`git` and `gh`, signed in with write access to the repository when the ticket flow is on GitHub. eng-flow runs no hooks and no scripts in the projects that install it.

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

The skills load as `eng-flow:grill`, `eng-flow:spec` and so on.

`ui-quality`, the scored UI/UX rules and scans, is a separate plugin in the same marketplace, for projects with screens. Its scripts need Node 24, and its web scan needs Playwright:

```bash
claude plugin install ui-quality@ughettoariel
```

Update with `claude plugin marketplace update ughettoariel`; Claude Code installs a new version when the `version` in a plugin's `.claude-plugin/plugin.json` goes up.

In each project, run `setup-project` once. It writes `docs/agents/project.md` with the project's checks, how to set up a fresh worktree and run the app, where its tickets live and its Design board, if it has one.

## Developing eng-flow

Node 24. `npm ci` installs the linter and the formatter at the versions CI uses; the secrets scan needs `gitleaks` from Homebrew.

```bash
npm ci
```

```bash
npm test && npm run lint && npm run format:check
```

```bash
npm run secrets
```

`node scripts/fetch-sources.mjs` clones the upstream repositories into `sources/` at the commits in `sources.json`, for reference; the folder is never committed. CI runs the same commands as the `Checks` line of `docs/agents/project.md`, and a test fails when the two differ. The secrets scan runs locally; projects that install the plugin use their own checks.

## Credits and licence

eng-flow builds on pstack, Matt Pocock's skills, Addy Osmani's agent-skills, Superpowers, tstack, the ZazenCodes software factory and the Claude Code team's post on code review. [CREDITS.md](CREDITS.md) says what each one contributed.

MIT, see [LICENSE](LICENSE). Copied skills keep their own licence next to them.
