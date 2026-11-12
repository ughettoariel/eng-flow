---
name: wayfinder
description: Turn work too large or too unclear to plan in one session into a GitHub epic of spikes, and settle the spikes one by one across sessions. Use when the path to a goal is not known yet; when the plan already has a shape and only decisions are open, use grill.
---

# Wayfinder

`grill` settles the decisions of a plan that already has a shape. Wayfinder is for work you cannot plan yet: it files the unknowns as spikes of an epic and works them until the way to the goal is clear. It runs in the main thread, with the owner; research spikes go to subagents. Where tickets live follows the `Tickets` line of `docs/agents/project.md`; [tracker.md](../setup-project/references/tracker.md) has the command for each operation named below.

## Open the epic

1. Name the goal with the owner first: the spec, decision or change this effort reaches. It fixes the scope.
2. Create the epic, labelled `type:epic`, with these sections: Goal, Notes, Decisions so far (one line per closed spike, linked), Not yet specified (questions you can see coming but cannot state sharply yet) and Out of scope. `spec` later writes the acceptance criteria into the same body.
3. File each question you can state sharply now as a spike: a child of the epic labelled `type:spike`, whose body opens with `## Question`, with the label of who works it (below). Mark blockers in a second pass, once every issue has its id.

Keep the epic small: a question that one conversation settles is a batch of `grill`, not a spike.

## Spikes

- **`ready-for-agent`: research.** A subagent answers from primary sources (official docs, source code, specs) and cites each claim. Notes stay on a throwaway `research/<name>` branch that is never merged.
- **`ready-for-human`: the owner decides.** Run `grill` with the owner, or build a prototype: throwaway code that answers one question, marked as a prototype, with one command to run, no persistence or polish, on a branch that is never merged. For UI, several clearly different variants on one route. The owner's reaction is the answer.

Work that has to happen before a decision can be made is a `type:task` child of the epic.

## Working it

A spike is ready when it is open and every issue it is blocked by is closed: list the ready ones.

- Work any ready spike; they can span many sessions.
- Each answer goes into its spike's body under `## Answer`, with its sources, and the spike closes as completed. Add a line to Decisions so far, and turn any question it opened into a new spike or a line under Not yet specified.
- Once the decisions are made, `spec` writes the epic's acceptance criteria into its body and `slice` files its tickets as children of the epic.

## Done

No spike is left open on the epic: its goal can be specified and built.
