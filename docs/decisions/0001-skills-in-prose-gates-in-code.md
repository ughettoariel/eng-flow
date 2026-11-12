# Skills are prose, gates are the project's checks

Skills describe how to do a step and leave judgment to the model. Anything that must hold every time, such as a test for each public function or no secret in a commit, is a check of the project itself: a test, a lint rule or a CI job that the skills run and read. eng-flow brings none of its own (ADR 0022). When a review finds the same mistake twice, the fix is a new check in the project, not another line in a skill.

## Considered options

- Rules written into every skill. Rejected: a model follows them most of the time, and the exceptions are the expensive ones.
- Hooks or a CLI shipped by eng-flow that refuse. Rejected: they need a runtime in every project that installs the plugin.
