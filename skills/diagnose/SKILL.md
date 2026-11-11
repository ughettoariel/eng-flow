---
name: diagnose
description: Find the cause of a bug with a reproducible feedback loop and end with a test that fails for the reported reason. Use when something is broken and the cause is not obvious, before fixing it.
---

# Diagnose

1. Start from the bug ticket: how to reproduce it, what was expected and what happened. Build a feedback loop before forming any theory: one command you have already run that shows the bug, such as a failing test at the seam that reaches it, a script against the dev server or a replayed payload. No loop, no hypothesis.
2. Reproduce and minimise.
3. Form falsifiable hypotheses and test them one variable at a time, with targeted probes.
4. Turn the minimised repro into a test at that seam and watch it fail for the reported reason.

The fix is not part of this skill; it belongs to `implement`, with this test as its first criterion.

## Done

A test reproduces the bug and fails for the reported reason, or you stop and name the missing seam or environment.
