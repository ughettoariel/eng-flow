# Skills are prose, gates are code

Skills describe how to do a step and leave judgment to the model. Anything that must hold every time, such as never merging with red checks or never pushing to `main`, is enforced by code: a test, a lint rule, a hook or a CLI command that refuses. When a review finds the same mistake twice, the fix is a new check, not another line in a skill.

## Considered options

- Rules written into every skill. Rejected: a model follows them most of the time, and the exceptions are the expensive ones.
