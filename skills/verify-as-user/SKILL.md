---
name: verify-as-user
description: Verify a change the way its user would: walk each acceptance criterion in the running app, report what you saw and return the verdict to the session, and carry a capture of what changed when screens change. Use for the verify step of a ticket, or when asked to check that a change works in the app.
---

# Verify as the user

Proof is what you observed yourself in this session, in the running app. Green tests with mocks do not prove what a person sees. A project with its own verification skill names it on the `Run` line of `docs/agents/project.md`; that one wins for how to start and drive the app.

## Walk

1. **One check per criterion a person can observe.** For each acceptance criterion, take the steps a user takes (arrive, look, act) in the running app on the ticket's head, and check the result the criterion names. Drive it with what the project offers: its own end-to-end harness first, then a browser automation tool or the simulator. Criteria with nothing to see (rounding, permissions on the server) are verified by the tests that name them, not here.
2. **A flow change** (a step clicks, types, selects or presses a key) is also judged against the UX rules of the `ui-quality` skill, with its severities, when that plugin is installed. A Blocker or Major fails the verification; Minors are listed without failing it.
3. **Report** in the session, per criterion: what you did, what you saw, pass or fail. A miss names the criterion and the step.

## Return the verdict

The report goes back to the session that asked for it, one line per criterion with pass or fail and the commit walked. That session records its verdict in the commit's verdict note, as [verdict-notes.md](../code-review/references/verdict-notes.md) describes. Run as a reviewer, you write your report where the brief says and write no note: the session that ran the round writes it. A fail names the criterion and the step, and the ticket goes back to `implement`.

With no environment to run it (missing credentials, a service that is down, no `Setup` for a fresh worktree), say `BLOCKED` with what is missing. Never report a pass without the walk. When no criterion has anything a person can see, say so in the report and name the tests that cover them.

## Screens

Only for a change that touches a UI directly.

- Capture the screens the ticket changed, with their states, for the PR description. An animation that matters is a short video.
- When `docs/agents/project.md` names a `Design board`, also update those screens on the Design board and link the flow from the PR. When the change reaches screens outside the ticket, file a `chore` ticket to update them on the Design board instead of growing this PR.

## Done

Every criterion a person can observe was walked in the app, the verdict went back to the session that asked, and the PR carries a capture of the changed screens when the change touches a UI.
