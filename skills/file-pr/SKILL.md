---
name: file-pr
description: Open a pull request as a draft, with a title that follows the repository's conventions and a description that states the problem before the fix, plus evidence when screens change. Use when asked to file, open or create a PR.
---

# File PR

Before filing, check whether a PR for this branch already exists. Review the
diff locally against the base branch (usually `origin/main`) to make sure its
contents match the goal.

PR titles usually become commit messages, so follow the repository's title
conventions. Look at recently merged PRs and Git history for examples. Prefer a
concise, human-readable title that explains why the change matters:

BAD

> ❌ perf(server): negotiate permessage-deflate on the websocket

GOOD

> ✅ perf(server): cut websocket frame size by 70%+ with gzipping

Open the description with a simple explanation of the problem based on the
user's original prompt, then briefly explain the solution. Do not lead with an
implementation inventory:

BAD

> ❌ Removed implicit workspace carry-over from every "new thread" entry point (cmd+n / cmd+shift+o, sidebar v1/v2 buttons, command palette). New threads inherit only the project from context; branch, worktree, and env mode always come from the configured defaults. Deleted buildContextualThreadOptions, startNewThreadInProjectFromContext, and the v1 sidebar's seed-context machinery.

GOOD

> ✅ My "new worktree" default was ignored when starting new threads on existing worktrees. Super unintuitive. Now your preferences always apply.

End the description with the public model name and harness that made the
changes, for example `Created with <model> in <harness>.` Include subagent
models that wrote part of the change. Use the model name the harness reports.
If model identity is unavailable, name the harness without guessing a model.

Write the title and description in plain words, with the project's own writing rules when it
has them, then check them, and any quotes and attachments, for secrets and private details.

When the change touches a UI directly, the description carries a capture of
what changed, or links the flow on the project's Design board when
`docs/agents/project.md` names one; an animation goes in as a short video.

The repository's PR template and the PR rules in its `docs/agents/project.md`
win over this layout; keep the "Created with" line.

## Draft until ready

Open every PR as a draft:
`gh pr create --draft --base <base> --title "..." --body-file <file>`, with
`main` as the base unless the owner names another. Repositories that do not
allow drafts (private repositories on GitHub Free) refuse it: open the PR
without `--draft`, with `[WIP] ` before the title, and say so in the session.
It stays a draft until its head commit has a PASS verdict note, which covers the
project's checks, the review and the verification (see
[verdict-notes.md](../code-review/references/verdict-notes.md)); only then turn it ready with `gh pr ready <pr>`, or drop the
`[WIP] ` prefix. Never push to the base branch directly. A PR into `main` is the
owner's to merge.

Never put a question in a PR description or a PR comment: ask it in the session,
and park it in `.eng-flow/questions/` when it gets no answer, as `grill` says. Do
not post a PR comment unless it serves the user's request. A comment that is
needed leads with the conclusion, cites the code or check behind it, and ends
with a line `- by <model>` naming the agent that wrote it.
