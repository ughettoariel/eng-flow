---
name: implement
description: Implement a ticket test-first: one failing test per acceptance criterion through the public interface, the smallest change that passes them, and the project's checks green. Use when asked to implement or fix a ticket.
---

# Implement

1. Read the ticket and the project's own rules: its agent instruction files, its lint and test config, and the ADRs the ticket touches. In a fresh worktree, run the `Setup` line of `docs/agents/project.md` first, when it has one.
2. Test first: for each acceptance criterion, a test that fails now and passes after the change. Tests check behaviour through the public interface, never internals. Styles and docs get other evidence instead.
3. Make the smallest change that satisfies the criteria; nothing outside the ticket. For a bug, fix the root cause the failing test shows, not the symptom.
4. Leave the code you touch at least as readable as you found it: clear names, one function per rule, and a comment only for a reason the code cannot show. Never write again what a shared helper already does; call it. Do not refactor code the ticket does not touch.
5. Run the project's checks before you hand the work over: the `Checks` line of `docs/agents/project.md` when the project has one, otherwise the commands its README or CI runs.

Return the diff summary and the check output, not a claim. When you need a decision, ask it in the thread the way `grill` does, and park it when no answer comes; when something blocks you, say `BLOCKED` and the cause.

## Done

Every criterion has a test that failed and now passes (or other evidence for styles and docs), and the project's checks pass on your work.
