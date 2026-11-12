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
3. The base is the epic branch from the handoff; without a handoff, the remote branch `epic/{number}-*` of the ticket's epic when it has one, otherwise `main`.
4. The ticket's branch is `{prefix}/{number}-{slug}`, with the slug a few words of the title in kebab case. The prefix comes from the ticket's type label, unless the `Branches` line of `docs/agents/project.md` names another convention:

   | Label | Branch |
   | --- | --- |
   | `enhancement` | `feature/` |
   | `bug` | `bug/` |
   | `documentation` | `docs/` |
   | `chore` | `chore/` |
   | `refactor` | `refactor/` |

   A ticket with no type label stops here: ask its type in the thread, the way `grill` asks. When the worktree is already on the ticket's branch, as in a resumed session, keep it; otherwise create the branch from the base as it is on the remote.
5. A `bug` ticket starts with `diagnose`, whose failing test becomes `implement`'s first criterion.
6. Run `implement`. When its diff passes about 300 changed lines and holds more than one logical change, propose the split in the thread before going on.
7. Run `file-pr`: a draft PR into the base. A conflict with the base or a red check is fixed on this branch before any review round.

## Review rounds

A round reviews the PR's head commit and ends in one verdict note on it, as [verdict-notes.md](../code-review/references/verdict-notes.md) describes. Every reviewer runs as a subagent with an empty context, so none of them wrote the code and their reading stays out of this session: give each the skill to follow, the diff range by ref, the ticket number and the instruction to edit nothing. Each returns only its report.

8. **Pick the reviewers** from the diff against the base, by Addy Osmani's threshold. The change is small when it touches at most two files, under 50 changed lines, and nothing about authentication, payments, data access, configuration or environment, or a path on the `Sensitive paths` line of `docs/agents/project.md`. A small change, or any `documentation` ticket, gets one `code-review` on a small model. Any other change gets, in parallel, `code-review` on a large model, `security-audit`, and the `ui-quality` audit when screens change and that plugin is installed. A ticket labelled `security` always adds `security-audit`, whatever its size.
9. **Verify** with `verify-as-user`, also in a subagent: driving a browser or a simulator fills a context fast.
10. **Write the note** on the head commit with every report and the verify verdict, and push it.
11. **On FAIL**, fix the open findings in new commits (a commit may name what it fixes with `Addresses: <sha>#F1`), push, and start the next round on the new head; its reviewers read only the commits since the last note and close each earlier finding. After three rounds without PASS, stop: say `BLOCKED` with the last note, and move the ticket to `Parked`.
12. **On PASS**, with a PASS note on the head commit, turn the PR ready with `gh pr ready`, and move the ticket to `In review` when there is a `Board` line.

## Merge

13. Before merging, check the head still has its PASS note. After a rebase onto a moved base, [verdict-notes.md](../code-review/references/verdict-notes.md) says when the note carries over to the new head; otherwise the head needs a new round.
14. **Into an epic branch**, first read `gh pr view <pr> --json baseRefName,headRefOid`: the base must be the epic branch the handoff names and the head the SHA the PASS note sits on. Anything else, a retargeted PR or a push after the note, stops the merge. Then merge only that head with `gh pr merge <pr> --merge --match-head-commit <noted sha>`, and read the PR back with `gh pr view <pr> --json state,mergedAt,baseRefName`: a merge command can report success for a PR that only queued. Only when `state` is `MERGED` into the epic branch, close the ticket (a PR into a branch other than the default one does not close it) and move it to `Done` when there is a `Board` line. A PR still open or queued is not merged: wait for it, or say `BLOCKED` with what holds it.
15. **Into the repository's default branch** (`gh repo view --json defaultBranchRef --jq .defaultBranchRef.name`, usually `main`), stop with the PR ready: the owner merges it. `ship-ticket` never merges into the repository's default branch.

## Done

The ticket's PR has a PASS note on its head and is merged into its epic branch or ready for the owner to merge into the default branch; or the session stopped with `BLOCKED`, its cause, and the ticket in `Parked`.
