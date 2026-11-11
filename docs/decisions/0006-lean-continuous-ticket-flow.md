# Tickets follow a lean continuous flow

Work moves as a continuous flow with no sprints, estimates or standups. A ticket carries its slice of the spec copied in, so it reads without its epic, and no user story or Given/When/Then template: the tests carry the detail. A bug ticket carries how to reproduce it, what was expected and what happened. Blockers are recorded only for real dependencies, a changed spec replaces tickets instead of patching them, and a ticket is Ready only with its context and acceptance criteria. A board holds the states Backlog, Ready, In progress, In review and Done.

## Consequences

- With `Tickets: github` in the project config, the states are a GitHub project board; other trackers keep their own states. There is no Definition of Ready check yet; `slice` states the Ready rule in prose.
