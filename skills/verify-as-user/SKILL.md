---
name: verify-as-user
description: Verify a change the way its user would: walk each acceptance criterion in the running app, report what you saw, record the verdict on the commit, and carry a capture of what changed when screens change. Use for the verify step of a ticket, or when asked to check that a change works in the app.
---

# Verify as the user

Proof is what you observed yourself in this session, in the running app. Green tests with mocks do not prove what a person sees. A project with its own verification skill names it on the `Run` line of `docs/agents/project.md`; that one wins for how to start and drive the app.

## Walk

1. **One check per criterion a person can observe.** For each acceptance criterion, take the steps a user takes (arrive, look, act) in the running app on the ticket's head, and check the result the criterion names. Drive it with what the project offers: its own end-to-end harness first, then a browser automation tool or the simulator. Criteria with nothing to see (rounding, permissions on the server) are verified by the tests that name them, not here.
2. **A flow change** (a step clicks, types, selects or presses a key) is also judged against the UX rules of the `ui-quality` skill, with its severities. A Blocker or Major fails the verification; Minors are listed without failing it.
3. **Report** in the session, per criterion: what you did, what you saw, pass or fail. A miss names the criterion and the step.

## Record the verdict

Post it on the head commit as the status `verify`, so the PR shows it:

```bash
gh api repos/<owner>/<repo>/statuses/<head sha> -f context=verify -f state=success -f description="AC 1-3 walked in the app"
```

Use `state=failure` and name the failed criterion on a fail; the ticket goes back to `implement`. With no environment to run it (missing credentials, a service that is down), say `BLOCKED` with what is missing. Never mark `verify` passed without the walk.

## Screens

Only for a change that touches a UI directly.

- Capture the screens the ticket changed, with their states, for the PR description. An animation that matters is a short video.
- When `docs/agents/project.md` names a `UI board`, also update those screens on the board and link the flow from the PR. When the change reaches screens outside the ticket, file a task to update them on the board instead of growing this PR.

## Done

Every criterion a person can observe was walked in the app and reported, the `verify` status is on the head commit, and the PR carries a capture of the changed screens when the change touches a UI.
