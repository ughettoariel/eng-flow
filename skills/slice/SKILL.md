---
name: slice
description: Slice an epic's spec into tickets filed as children of the epic, each a thin path of user value with at most three acceptance criteria, the spec context it needs copied in, and only real blockers. Use when asked to slice or split a spec, epic or feature into tickets.
---

# Slice

Where tickets live follows the `Tickets` line of `docs/agents/project.md`; [tracker.md](../setup-project/references/tracker.md) has the command for each operation named below.

A ticket reads without opening its epic. The tests `implement` writes carry the detail, so a ticket carries only what is needed to write them.

## Cut

1. Slice the epic's spec into tickets. Each cuts one thin, complete path through the layers it needs (data, API, UI, tests) and can be verified on its own. Prefactoring that makes the slices easy comes first, as a `refactor` ticket.
2. A ticket has at most three acceptance criteria. One with more is two tickets.
3. Cut so tickets run in parallel where the code allows: two tickets that touch different modules do not block each other. Record a blocker only for a real dependency, where one ticket cannot start or pass its tests without the other merged.
4. A wide mechanical refactor goes expand-contract: add the new form beside the old, migrate callers in batches (each its own task, blocked by the expand), then delete the old form in a task blocked by every batch.
5. Count the tickets. An epic with more than eight is two epics: stop and propose the split to the owner instead of filing them.

## Each ticket

Create it as a child of the epic, with one type label: `enhancement` for new behaviour, `documentation`, `chore` or `refactor` for work with no visible change in behaviour. It carries:

- **Context:** the parts of the epic's spec this ticket touches, copied in, so the reader needs nothing else.
- **Covers:** the epic's criteria it covers, copied word for word with their numbers (`Covers criterion 2 of #<epic>: ...`).
- **Acceptance criteria:** its own, at most three, each observable.
- **Contracts and test seams:** the ones from the spec it uses, copied in.

No user story template and no Given/When/Then: the tests hold that detail. Name behaviour, not file paths or code. Label `security` each ticket that crosses a trust boundary: it adds authentication, sensitive data, an external integration, uploads or roles. Mark blockers in a second pass, once every ticket has its id. The project's issue template wins over this layout.

A ticket is Ready when it has its context and its acceptance criteria. One without them is not taken.

## Bugs

A bug ticket, labelled `bug`, carries how to reproduce it, what was expected and what happened. It has no copied spec and no separate criteria: `diagnose` turns it into a failing test.

A bug found while working an epic joins that epic only when it breaks one of the epic's own tickets. Otherwise it is filed on its own, outside the epic.

## When the spec changes

Edit each affected ticket, or close it as not planned and file its replacement. Never patch a ticket with extra notes or comments.

## Done

Every slice is a typed child of the epic with its context, the criteria it covers, at most three criteria of its own and only real blockers; no epic criterion is left uncovered; the epic has at most eight tickets. Show the owner the spec and the tickets, with the `security` ones named, before any is built: that is their one approval.
