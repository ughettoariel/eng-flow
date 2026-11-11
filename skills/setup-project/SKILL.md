---
name: setup-project
description: Set a project up for eng-flow by writing docs/agents/project.md with its checks, how to run it, where tickets live and its UI board, asking the owner only what the repo cannot answer. Use when a project starts using eng-flow, or when a skill reports that the project config is missing.
---

# Setup project

The result is `docs/agents/project.md` in the shape of [references/project-config.md](references/project-config.md). Read that file first: it says what each line means and which skill reads it.

## Find what the repo already says

1. Read the README, the agent instruction files (`CLAUDE.md`, `AGENTS.md`), the CI workflows, the package or build files (`package.json`, `Makefile`, `pyproject.toml`, `build.gradle`) and the PR and issue templates.
2. `Checks`: the commands CI runs, as one line a person can paste.
3. `Run`: how to start the app and where to open it, or a project skill that already verifies it.
4. `Tickets`: signs of a tracker already in use. Ticket keys in branch names, commits or PR titles (`ABC-123`), tracker links in the README or PR template, `.github/ISSUE_TEMPLATE/`, open issues with `gh issue list --limit 20`.
5. `Glossary` and `ADRs`: an existing glossary file and decision folder.

A fact the repo answers is never a question.

## Ask the rest

Ask one batch the way `grill` does, with context and a recommended option per question. Always ask about tickets, because it decides whether eng-flow files issues at all:

- **Install the eng-flow ticket flow on GitHub Issues.** Recommended only when the repo shows no other tracker. It creates the labels below.
- **Keep the tracker the project already uses**, naming the one you found. eng-flow files nothing on GitHub.
- **No tracker.** Specs and tickets stay in the session.

Ask for `Checks` or `Run` only when the repo left them unclear, and for the UI board only when the project has screens.

## Write it

1. Write `docs/agents/project.md` with only the lines that differ from their default, and show it to the owner.
2. With `Tickets: github`, create the labels once the owner said yes: `gh label create <name> --force` for `type:epic`, `type:story`, `type:task`, `type:bug`, `type:spike`, `security`, `ready-for-agent` and `ready-for-human`.
3. Commit nothing; the owner decides whether the file goes in a PR.

## Done

`docs/agents/project.md` exists, the owner saw it, and the labels exist when the ticket flow is on GitHub.
