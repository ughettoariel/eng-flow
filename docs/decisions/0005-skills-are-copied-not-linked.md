# Skills are copied, not linked

A skill taken from another repository is copied into `skills/` with a `SOURCE.md` naming the repository, path and commit, and the upstream `LICENSE` next to it. The copy is maintained here and does not follow upstream. A test checks each copy against `sources.json`.

## Considered options

- Installing upstream plugins and linking to their skills. Rejected: an upstream change would alter the workflow without review, and the skills need edits to fit it.
