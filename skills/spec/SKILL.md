---
name: spec
description: Write a feature's spec into the body of its epic on GitHub, with numbered, verifiable acceptance criteria, contracts and test seams. Use when asked to spec or define a feature, or before slicing an epic into tickets.
---

# Spec

Runs in the main thread, so the test seams can be checked with the owner.

1. Say the epic's outcome in one sentence. If it needs "and", it is two epics: propose the split to the owner before writing any criterion.
2. Read the code the feature touches. Use the project's glossary and respect its ADRs.
3. List the assumptions you are making before writing. Anything the owner did not settle is an assumption, not a fact; open decisions go through `grill` first.
4. Pick the test seams: the highest public interface that reaches the behaviour, existing seams before new ones, as few as possible. Confirm them with the owner.
5. Write the spec into the epic's body, so the feature keeps one issue. When there is no epic yet, open one labelled `type:epic`. Keep the sections already there, such as Decisions so far, and add:
   - the outcome in one sentence;
   - the problem and the solution from the user's side;
   - numbered acceptance criteria, each observable and with how it is verified;
   - implementation decisions: modules, interfaces, contracts, schema changes;
   - testing decisions: seams, and prior art in the repo;
   - boundaries: always, ask first, never;
   - out of scope.

Number the criteria once and keep the numbers: each ticket copies the ones it covers, word for word. Name behaviour, not file paths or code, which go stale. The project's issue template wins over this layout.

If the spec changes after its tickets are filed, `slice` edits each affected ticket, or closes it as not planned and files its replacement.

## Done

The epic's body names the outcome, the user, the scope and exclusions, numbered acceptance criteria, the contracts, and how each criterion is verified.
