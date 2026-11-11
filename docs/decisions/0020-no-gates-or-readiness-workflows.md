# No gates or readiness workflows

Ticket sessions run on the owner's machine and publish commit statuses directly, so no workflow relays verdicts posted as PR comments. No workflow judges open PRs either: the landing command checks a ticket before merging it into its epic, the epic's close checks it before its PR to `main`, and the epic's session tells the owner when it is ready.

## Considered options

- A relay workflow that turns a verdict comment into a status. Only needed when sessions run in the cloud, whose proxy refuses statuses, and it fills PRs with comments.
- A readiness workflow that toggles draft state and notifies the owner with a comment. It repeats the landing checks, needs write permissions on every CI run, and adds a comment per head commit.

## Status

Accepted. Reopen the relay if ticket sessions move to the cloud.
