# Questions live in the session and in .eng-flow/

A question for the owner is asked in the session that needs it. When the owner is not there, it waits as one file in `.eng-flow/questions/` of the project's main checkout, never in a PR or issue comment, and a SessionStart hook lists those files in the next session so it can grill them. The folder holds its own `.gitignore` with `*`, so it is never committed and the project's `.gitignore` needs no entry. A comment that is needed anyway mentions the owner and ends with `- by` and the agent's name.

## Consequences

- Only sessions on the machine with the main checkout see the questions.
