# Claude Code

How the steps of `ship-ticket` and `run-epic` that depend on the harness run in Claude Code.

- **A subagent with an empty context** is the Agent tool with `subagent_type: "general-purpose"`. Its prompt carries everything it needs: the skill to follow, the diff range by ref, the ticket number, and that it must not edit files or check out branches in the session's worktree. Several reviewers start in one message so they run in parallel. Name the model only when the step says which size to use: `haiku` for small, `sonnet` for large.
- **A question with options** is the AskUserQuestion tool, at most four questions per call.
- **A new session for a ticket**, in the desktop app, is `start_session` with the handoff as its brief, in a worktree of its own. In the terminal there is no such call: print the command for the owner to run in a new window, `cd <worktree> && claude "/eng-flow:ship-ticket #<number>"`.
