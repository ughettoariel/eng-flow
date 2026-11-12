---
name: setup-project
description: Set a project up for eng-flow by writing docs/agents/project.md with its checks, how to run it, where tickets live and its Design board, asking the owner only what the repo cannot answer. Use when a project starts using eng-flow, or when a skill reports that the project config is missing.
---

# Setup project

The result is `docs/agents/project.md` in the shape of [references/project-config.md](references/project-config.md). Read that file first: it says what each line means and which skill reads it.

## Find what the repo already says

1. Read the README, the agent instruction files (`CLAUDE.md`, `AGENTS.md`), the CI workflows, the package or build files (`package.json`, `Makefile`, `pyproject.toml`, `build.gradle`) and the PR and issue templates.
2. `Checks`: the commands CI runs, as one line a person can paste.
3. `Setup`: what a fresh worktree lacks before the checks run, such as installed dependencies, an untracked `.env` or a fixed port.
4. `Run`: how to start the app and where to open it, or a project skill that already verifies it.
5. `Tickets`: signs of a tracker already in use. Ticket keys in branch names, commits or PR titles (`ABC-123`), tracker links in the README or PR template, `.github/ISSUE_TEMPLATE/`, open issues with `gh issue list --limit 20`.
6. `Glossary` and `ADRs`: an existing glossary file and decision folder.

A fact the repo answers is never a question.

## Ask the rest

Ask one batch the way `grill` does, with context and a recommended option per question. Always ask about tickets, because it decides whether eng-flow files issues at all:

- **Install the eng-flow ticket flow on GitHub Issues.** Recommended only when the repo shows no other tracker. It creates the labels below.
- **Keep the tracker the project already uses**, naming the one you found. eng-flow files nothing on GitHub.
- **No tracker.** Specs and tickets stay in the session.

Ask for `Checks`, `Setup` or `Run` only when the repo left them unclear, and for the Design board only when the project has screens.

## Write it

1. Write `docs/agents/project.md` with only the lines that differ from their default, and show it to the owner.
2. With `Tickets: github`, check that `gh auth status` passes and that `gh api repos/{owner}/{repo} --jq .permissions.push` prints `true`; otherwise say what is missing. Then create the labels once the owner said yes: `gh label create <name>` for each of these that the repository lacks, leaving existing ones as they are. Type, one per ticket, which also names its branch: `enhancement`, `bug`, `documentation` (GitHub creates these three in every new repository), `chore`, `refactor`. Flow: `epic`, `spike`, `security`, `ready-for-agent`, `ready-for-human`.
3. With `Tickets: github`, set up the board, the GitHub Project that holds each ticket's state. Ask whether to link a project the owner already has (`gh project list --owner <owner>`) or create one. Its `Status` field has exactly `Backlog`, `In progress`, `Parked`, `In review` and `Done`; [tracker.md](references/tracker.md) has the commands. Write the project's URL as the `Board` line. Projects need the `project` scope: when `gh auth status` lacks it, ask the owner to run `gh auth refresh -s project`.
4. Commit nothing; the owner decides whether the file goes in a PR.

## Done

`docs/agents/project.md` exists, the owner saw it, and the labels and the board exist when the ticket flow is on GitHub.
