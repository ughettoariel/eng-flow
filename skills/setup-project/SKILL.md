---
name: setup-project
description: Set a project up for eng-flow by writing docs/agents/project.md with its checks, how to run it, where tickets live and its Design board, asking the owner only what the repo cannot answer. Use when a project starts using eng-flow, or when a skill reports that the project config is missing.
---

# Setup project

The result is `docs/agents/project.md` in the shape of [references/project-config.md](references/project-config.md). Read that file first: it says what each line means and which skill reads it.

## Find what the repo already says

1. Read the README, the agent instruction files (`CLAUDE.md`, `AGENTS.md`), the CI workflows, the package or build files (`package.json`, `Makefile`, `pyproject.toml`, `build.gradle`) and the PR and issue templates.
2. `Checks`: the commands CI runs, as one line a person can paste. When the package or build files define more checks than CI runs, such as a lint or format script CI skips, ask the owner which belong in `Checks`, recommending the set CI runs.
3. `Setup`: what a fresh worktree lacks before the checks run, such as installed dependencies, an untracked `.env` or a fixed port.
4. `Run`: how to start the app and where to open it, or a project skill that already verifies it. A project with no app, such as a library, a plugin or a set of docs, gets `Run: no app` followed by how a change is checked: the command that exercises it, or the files a verifier reads and what it compares them with. Loading the project alone checks nothing.
5. `Tickets`: signs of a tracker already in use. Ticket keys in branch names, commits or PR titles (`ABC-123`), tracker links in the README or PR template, `.github/ISSUE_TEMPLATE/`, open issues with `gh issue list --limit 20`.
6. `Glossary` and `ADRs`: an existing glossary file and decision folder.
7. `Branches`: the naming the repository already uses, read from recent branch names and merged PRs. Write the line only when it differs from the eng-flow default, `{prefix}/{number}-{slug}` with the prefix from the type label.

A fact the repo answers is never a question.

## Ask the rest

Ask one batch the way `grill` does, with context and a recommended option per question. Always ask about tickets, because it decides whether eng-flow files issues at all:

- **Install the eng-flow ticket flow on GitHub Issues.** Recommended only when the repo shows no other tracker. It creates the labels below.
- **Keep the tracker the project already uses**, naming the one you found. eng-flow files nothing on GitHub.
- **No tracker.** Specs and tickets stay in the session.

Always ask whether agents use their own GitHub account, a machine account the owner added as a collaborator, so their commits and PRs do not read as the owner's. Recommend **No** unless the owner already has one; nothing in eng-flow requires it. The answer is the `Agent account` line: the account's login, or `none`.

Ask for `Checks` when step 2 found more checks than CI runs, for `Setup` or `Run` only when the repo left them unclear, and for the Design board only when the project has screens.

## Write it

1. Write `docs/agents/project.md` with only the lines that differ from their default, plus `Agent account: <login>` or `Agent account: none` so the answer is not asked again, and show it to the owner. With a login, point the owner at the harness reference of `ship-ticket` for giving sessions that account.
2. With `Tickets: github`, check that `gh auth status` passes and that `gh api repos/{owner}/{repo} --jq .permissions.push` prints `true`; otherwise say what is missing. Then create the labels once the owner said yes: `gh label create <name>` for each of these that the repository lacks, leaving existing ones as they are. Type, one per ticket, which also names its branch: `enhancement`, `bug`, `documentation` (GitHub creates these three in every new repository), `chore`, `refactor`. Flow: `epic`, `spike`, `security`, `ready-for-agent`, `ready-for-human`.
3. With `Tickets: github`, set up the board, the GitHub Project that holds each ticket's state. Each repository gets its own: create a Project named after the repository and link it only to that repository. When the `Board` line points at a Project linked to other repositories, say so, name them, and propose a new one in its place; never change that Project's links or its Status options, since the other repositories' boards use them. A `Board` Project linked to this repository alone is kept. The board's `Status` field has exactly `Backlog`, `In progress`, `Parked`, `In review` and `Done`; [tracker.md](references/tracker.md) has the commands. The Project's built-in workflows also move a Status: `Item added to project` sets a new item to `Backlog` (the old `Todo`), `Item closed` and `Pull request merged` set `Done`, and `Item reopened`, `Pull request linked to issue`, `Code changes requested` and `Code review approved` set whatever Status each one names. Keep `Item added to project`, `Item closed` and `Pull request merged` on, since they set the Status `slice` and `ship-ticket` would set. Ask the owner to turn off `Item reopened`, `Pull request linked to issue`, `Code changes requested` and `Code review approved` in the Project's Workflows settings, which have no API to change them: `ship-ticket` sets `In progress`, `Parked` and `In review` itself, and a workflow that moves a ticket into `In progress` breaks the limit of two that `run-epic` counts. Check the result with the workflows query in [tracker.md](references/tracker.md). Write the project's URL as the `Board` line. Projects need the `project` scope: when `gh auth status` lacks it, ask the owner to run `gh auth refresh -s project`.
4. End by asking the owner how `docs/agents/project.md` reaches the default branch: a PR into it (recommended), a commit straight onto it, or leave it uncommitted for now. `run-epic` adds every ticket worktree at the epic branch, which starts from the default branch, so a file that stays uncommitted is missing in every ticket session. Commit or open the PR only as the owner answered.

## Done

`docs/agents/project.md` exists, the owner saw it and chose how it reaches the default branch, and the labels and the board exist when the ticket flow is on GitHub.
