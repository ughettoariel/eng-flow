# Credits

eng-flow is built from other people's work. Skills copied from a repository keep its licence and a `SOURCE.md` next to them, and `sources.json` pins the commit each copy started from. The rest took ideas only, with no text or code copied.

## pstack, by Lauren Tan (poteto)

[cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack), MIT.

- Its principle skills shaped `implement` and `verify-as-user`: prove it works on the real artifact, fix root causes, test behaviour and not implementation.
- `verify-as-user` takes its idea that each project owns how its app is started and driven, from `create-verification-skill`.
- Starting with one unit of work and widening only once it went well.

## Matt Pocock's skills

[mattpocock/skills](https://github.com/mattpocock/skills), MIT.

- `grill` and `wayfinder` are copied from it, and the ADR and glossary formats in `grill/references/` come from its `domain-modeling` skill.
- `spec` and `slice` follow its spec and ticket skills: vertical slices with blockers, behaviour named instead of file paths.
- `implement` and `diagnose` follow its test-first and diagnosing skills.

## Addy Osmani's agent-skills

[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills), MIT.

- One approval before a run: the owner approves the spec and tickets once, then the epic runs.
- `security-audit`: copied from `security-and-hardening`, its references and the `security-auditor` agent, turned into an audit of a diff.
- The severity scale of `code-review` and `security-audit`: Critical, Required, Optional, Nit, FYI.

## Superpowers, by Jesse Vincent

[obra/superpowers](https://github.com/obra/superpowers), MIT.

- Plans as tasks that each deserve a review on their own, a fresh reviewer per task, and verification before calling work done.
- Its systematic debugging shaped `diagnose`.

## tstack, by Theo Browne

[t3dotgg/tstack](https://github.com/t3dotgg/tstack), MIT.

- `file-pr` is copied from it, and its `leaving-pr-comments` gave the comment format `file-pr` keeps.
- `verify-as-user` follows its proof standard from `full-send`: proof is what the agent observed in the session, and green mocked tests do not prove a UI works.

## Software factory v2, by ZazenCodes

[zazencodes/zazencodes-season-3, `src/software-factory-claude-code-v2`](https://github.com/zazencodes/zazencodes-season-3/tree/main/src/software-factory-claude-code-v2), GPLv3. Ideas only: nothing from it is copied, so its licence does not apply to eng-flow.

- Work taken from GitHub issues, one worktree and branch per ticket.
- A checks gate before any review: no reviewer runs on a failing build.
- Extra reviewers only where the change needs them, such as security on a trust boundary and UI on screens.

## How the Claude Code team does code review

[The Claude Code team's post](https://claude.dev/blog/solving-code-review-at-anthropic/), by Addy Osmani, Morgan Westlee Lunt and Qing Wang.

- `code-review`: a reviewer that did not write the change, later rounds that read only the new diff and never repeat a finding, findings with file and line, and a plain verdict.
- A finding that repeats becomes a lint rule or a skill change, not another review comment.
