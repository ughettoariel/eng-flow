---
name: ship-ticket
description: Take one ticket from its branch to a merge by running the other eng-flow skills in order, with reviewers that did not write it and a verdict note on the head commit. Use when asked to ship, build or take a ticket end to end, or when run-epic hands over a ticket.
---

# Ship ticket

This skill only orders other skills; each step's rules live in that skill. The harness decides how to start a subagent or a new session: read the reference for the one you run in, [references/claude-code.md](references/claude-code.md), before the first step that needs it.

When something blocks you, say `BLOCKED` and the cause, park any open question as `grill` describes, and move the ticket to `Parked` on the board when `docs/agents/project.md` has a `Board` line ([tracker.md](../setup-project/references/tracker.md) has the commands).

## Start

1. Read the ticket, `docs/agents/project.md`, and `.eng-flow/handoff.md` when `run-epic` left one: it names the base branch and anything the launch decided.
2. Size it again before any code. A ticket with more than three acceptance criteria, or whose text asks for work its criteria do not cover, stops: say `BLOCKED` and propose the split into tickets of at most three criteria. Do not start the part that fits.
3. When the worktree is already on the ticket's branch, as after a resumed session, keep it and skip to step 5. Otherwise name the branch `{prefix}/{number}-{slug}`, with the slug a few words of the title in kebab case. The prefix comes from the ticket's type label, unless the `Branches` line of `docs/agents/project.md` names another convention:

   | Label | Branch |
   | --- | --- |
   | `enhancement` | `feature/` |
   | `bug` | `bug/` |
   | `documentation` | `docs/` |
   | `chore` | `chore/` |
   | `refactor` | `refactor/` |

   A ticket with no type label stops here: ask its type in the thread, the way `grill` asks.
4. The base is the epic branch from the handoff; without a handoff, the remote branch `epic/{number}-*` of the ticket's epic when it has one, otherwise `main`. Branch from the base as it is on the remote.
5. A `bug` ticket starts with `diagnose`, whose failing test becomes `implement`'s first criterion.
6. Run `implement`. When its diff passes about 300 changed lines and holds more than one logical change, propose the split in the thread before going on.
7. Run `file-pr`: a draft PR into the base.

## Done

The ticket has a draft PR into its base with the project's checks passing, or the session stopped with `BLOCKED`, its cause, and the ticket in `Parked`.
