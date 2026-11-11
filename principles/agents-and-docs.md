# Agents and documentation

## Checks over instructions

Anything a tool can verify is verified by the tool: compiler, linter, tests, hooks, CI. Instructions hold only what needs judgment.

**Why:** an agent treats an instruction as guidance it may decide does not apply; a failing check cannot be argued with. A rule that keeps being missed belongs in a check, not in stronger wording.

## Instruction files are short and true

The always-loaded file says what the code cannot: how to verify work, conventions that differ from defaults, traps, decisions not visible in the code, and boundaries. It does not tour the architecture. Add a line only when an agent got something wrong without it.

**Why:** long instruction files are followed less, cost on every task, and a contradiction between two of them is resolved arbitrarily.

## Boundaries in three levels

State what the agent always does, what it asks before doing, and what it never does. Ask-first covers at least schema and data migrations, new dependencies, access-control changes, deployments, git writes and anything destructive.

**Why:** an agent with no stated limits stops either too often or not at all.

## Rules for an area load with that area

Guidance that applies to one part of the codebase loads when the agent works there, not in every session. Keep one source for each rule; copies for different tools drift.

**Why:** an agent working on the interface does not need storage rules in its context, and a rule next to its code is found when it matters.

## Done is a passing check

A task is finished when the verification command passes and its output is shown, not when the agent says so.

## Canonical docs describe the present

Committed docs state what the system is and what was decided. They hold no plans, no "will be added", no ticket numbers as history, and no links to working notes. A plan becomes a present-tense fact; a known gap becomes a caveat about today.

**Why:** a plan in a rule reads as an instruction long after it stops being true.

## Working notes stay out of the repository

Plans, research, drafts and session notes live in a personal, ignored workspace. Something worth keeping is promoted to a canonical doc with a proper name.

**Why:** working notes pile up, go stale and have no owner; once one reaches a branch, nothing reliably keeps it from merging.

## Every plan names the docs it changes

An implementation plan lists the docs to create or update, scoped to what its spec covers.

**Why:** docs updated in the same change stay true; docs left for later do not.

## Decisions that bind the future get a record

Record a decision when it is cross-cutting, costly to reverse or sets a precedent, with the options rejected and why. Read the records before changing a pattern they explain.

## Changing the architecture changes its rules in the same change

A change that alters how the code is organised updates, in the same change, the principles, decision records and agent instructions that describe the old way.

**Why:** an agent follows whatever the rules say today; a stale rule makes it undo the change.

## Small changes, never destructive ones

Keep changes small enough to review in one sitting, with refactors apart from behaviour changes. Never reset, force-push or discard work without explicit confirmation, and restore only the files named.

**Why:** small changes get real reviews, and uncommitted work has no recovery path.
