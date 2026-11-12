# Claude Code

How the steps of `ship-ticket` and `run-epic` that depend on the harness run in Claude Code.

- **A subagent with an empty context** is the Agent tool with `subagent_type: "general-purpose"`. Its prompt carries everything it needs: the skill to follow, the diff range by ref, the ticket number, and that it must not edit files or check out branches in the session's worktree. Several reviewers start in one message so they run in parallel. Name the model only when the step says which size to use: `haiku` for small, `sonnet` for large.
- **A question with options** is the AskUserQuestion tool, at most four questions per call.
- **A new session for a ticket**, in the desktop app, is `start_session` with `initiation: "user_asked"`, `cwd` set to the worktree `run-epic` made, `use_worktree: false` so it opens that worktree instead of making another, the handoff as its `prompt`, and a `background` of at least 80 characters on why it runs. In the terminal there is no such call: print the command for the owner to run in a new window, `cd <worktree> && claude "/eng-flow:ship-ticket #<number>"`.
- **How long `run-epic` stays up.** In the desktop app it stays: each ticket session that ends a turn wakes it, and it launches the next ticket that fits. In the terminal no session reports back, so it launches what it can, reports, and stops; the owner runs it again.
- **The agent account.** With an `Agent account` login in `docs/agents/project.md`, the session takes that account from the `env` block of `.claude/settings.local.json`, which Claude Code reads at start and keeps out of git:

  ```json
  {
    "env": {
      "GH_TOKEN": "<the agent account's token>",
      "GIT_AUTHOR_NAME": "<agent login>",
      "GIT_AUTHOR_EMAIL": "<id>+<agent login>@users.noreply.github.com",
      "GIT_COMMITTER_NAME": "<agent login>",
      "GIT_COMMITTER_EMAIL": "<id>+<agent login>@users.noreply.github.com"
    }
  }
  ```

  `GH_TOKEN` makes `gh` act as the agent account instead of the owner's login; use a fine-grained token limited to this repository, and to the Project when there is a board. Pushes use it too only when git's credential helper is `gh` (`gh auth setup-git`); otherwise git pushes with the owner's credentials. The `GIT_AUTHOR_*` and `GIT_COMMITTER_*` variables sign every commit, merge commits and note commits included, as the agent; the `<id>` is `gh api users/<agent login> --jq .id`. Check that `git check-ignore .claude/settings.local.json` prints the path before writing the token. The file is untracked, so a worktree `run-epic` adds starts without it: copy it in before opening the session. A session that starts without it runs as the owner, and the login check of `ship-ticket` stops it.
