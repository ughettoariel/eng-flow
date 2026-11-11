# One session owns each ticket

Each ticket runs in one session the owner can open, read and talk to, from its first test to its merge. Nothing runs in the background where the owner cannot see it: a question is asked in that session, or in `grill` and `wayfinder` when the owner is there.

## Considered options

- An orchestrator that spawns hidden agents per role and tracks them with runs and claims. Rejected: its state lives apart from GitHub, and the owner cannot see or steer the work while it runs.
