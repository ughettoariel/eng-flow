# Claude Code

How the steps of `ship-ticket` and `run-epic` that depend on the harness run in Claude Code.

- **A subagent with an empty context** is a foreground headless call, `claude -p "<prompt>" --model <size> --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git log:*),Bash(git show:*),Bash(gh pr view:*),Bash(gh issue view:*)" > .eng-flow/reviews/<head sha>-<reviewer>.md 2>&1`, with the prompt first because `--allowedTools` takes every argument after it, run from the worktree after `mkdir -p .eng-flow/reviews`. The Agent tool of the desktop app only starts background agents, so a session that waits on them ends its turn mid-round; a foreground call keeps the turn open, so a ticket session's turn ends at a verdict note, a merge or `BLOCKED`. The prompt carries everything it needs: the skill file to follow by its path in the checkout, the diff range by ref, the ticket number, and that it must not edit files or check out branches. Start the reviewers of a round in one Bash call, each with `&` and then `wait`, so they run in parallel, with the Bash timeout at its 10-minute ceiling. `verify-as-user` runs the same way, also allowed the tools the `Run` line of `docs/agents/project.md` needs. Read the reports from `.eng-flow/reviews/` to write the note. Name the model only when the step says which size to use: `haiku` for small, `sonnet` for large. These calls are only for reviewers, which report and decide nothing; every decision stays in the ticket session, whose transcript keeps it.
- **A question with options** is the AskUserQuestion tool, at most four questions per call.
- **A new session for a ticket**, in the desktop app, is `start_session` with `initiation: "user_asked"`, `wake_when_done: true` so its end continues `run-epic`, `cwd` set to the worktree `run-epic` made, `use_worktree: false` so it opens that worktree instead of making another, the handoff as its `prompt`, and a `background` of at least 80 characters on why it runs. The app refuses that call on a turn that a session's report started, and on the first turn of a `run-epic` that another session started: the launch needs one message from the owner in the `run-epic` thread. In the terminal there is no such call: print the command for the owner to run in a new window, `cd <worktree> && claude "/eng-flow:ship-ticket #<number>"`.
- **How long `run-epic` stays up.** In the desktop app it stays: each ticket session that ends a turn wakes it, and it launches the next ticket that fits once the owner answers. In the terminal no session reports back, so it launches what it can, reports, and stops; the owner runs it again.
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
