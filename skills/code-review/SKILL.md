---
name: code-review
description: Review a change against its ticket and the project's rules, reporting at most five real problems with severity, and end with PASS or FAIL. Use when asked to review a diff, branch or PR you did not write.
---

# Code review

Review only code you did not write; the author never reviews their own change.

1. The first round reads the whole diff against its base (the PR's base, `main` by default) and the ticket. Later rounds read only the commits since the last review and confirm each earlier finding is fixed; never repeat a finding.
2. Check, in order: the ticket's acceptance criteria (each met and tested); the project's own standards, as its agent instruction files, lint config and ADRs state them; wrong behaviour on edge cases (empty, boundary, off-by-one, null); callers of changed code that now break; tests that check internals. Only when the diff touches them: input validation and authorization, public API compatibility, and screens against `ui-quality` when that plugin is installed.
3. A change that disables or weakens a test is a `Required` finding, unless the ticket asks for it: deleting it, skipping it (`.skip`, `xit`, `t.skip`, `@Ignore`, `@Disabled`, a runner's ignore option such as `--testPathIgnorePatterns`), marking it `todo` or `xfail`, adding `.only` to other tests, loosening its assertions, or special-casing it so it passes.
4. Check the design of the changed code, not only that it works: names that say what a thing is or does; one function per rule; a shared helper reused, never copied; and comments that give only a reason the block itself cannot show (a decision, an outside constraint), never a restatement of the code. A real design problem, one that makes the code harder to change or lets two copies drift, is `Required`. A preference between two clear ways is taste, not a finding.
5. Read the result of the project's checks on the head commit (`gh pr checks <pr>` for a PR; it exits 8 while checks are pending and 1 when none ran, which is not an error of yours). Run yourself every check of the `Checks` line that nothing ran, such as one the project runs only locally. A failing check, or one nobody could run, is a `Required` finding.

## Report

- Only real problems, at most five, each with `file:line`, severity and the fix.
- Severity follows Addy Osmani's scale, shared with `security-audit`: `Critical` (breaks behaviour, loses data or opens a hole), `Required` (must be fixed before merge), `Optional` (worth doing, not required), `Nit` (minor) or `FYI` (already there before this change: a follow-up, never a reason to fail).
- No style, and nothing lint or formatting catches. Name the class of a repeated bug once.
- Start or end the report with a line that is only `PASS`, or only `FAIL` when any `Critical` or `Required` is open.
- The report goes back to the session that asked for it, never to a PR comment.

## Done

The verdict is written.
