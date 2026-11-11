# Data and contracts

These hold whatever the stack. A project's own rules decide how they are done: which store, which error style, which versioning scheme.

## Failures are never swallowed

Every caught error is handled, rethrown or logged with context, never silently ignored or replaced by a default that looks like success.

**Why:** a hidden failure becomes wrong data that surfaces far from its cause.

## Public contracts carry a visible version

A breaking change to an API, a stored format or an event creates a new version beside the old one, and both live while consumers migrate. Breaking means removing or renaming a field, changing its type or tightening validation; adding an optional field is not.

**Why:** producers and consumers deploy at different times, so two versions are alive at once.

## Deprecate before removing

Mark the old version deprecated, mark the code only it uses, and remove both once no consumer calls it.

**Why:** removing without a window breaks clients still in the field.

## Published events carry the minimum necessary

An event payload is a projection for its consumers, never a serialized record. Include only what a known consumer needs, never free text that may hold sensitive data, never a catch-all bag of extra fields.

**Why:** a published field is a contract with every consumer forever, and the publisher is the only reliable filter for sensitive data.

## Stored data evolves by expand and contract

Change a stored shape in steps: add the new field, have readers accept both old and new, migrate existing data in small batches, and only then remove the old field.

**Why:** old records, old clients and new code coexist for longer than any deploy; a change made in one step breaks whichever of them is not updated.

## The current schema definition is the source of truth

What exists in some environment is not evidence of what the schema should be. Read the active definitions and migrations, never a database's current state.

**Why:** environments drift, and copying a drifted state spreads it.

## Runtime has the least privilege that works

The code that runs in production can read and write data but cannot change schemas or access rules. Access is denied by default and opened per role.

**Why:** a bug or compromise in runtime code cannot widen its own access or destroy structure.

## Every event handler is idempotent

Assume events arrive more than once and out of order. Key the effect on the event's identity, check state before acting, and stop early when nothing changed. Retry only transient failures, and stop retrying after a cutoff.

**Why:** at-least-once delivery is the norm, and a handler that writes back to what triggered it loops until someone notices the bill.

## Transactions do no side effects

Code inside a transaction reads first, writes last, and calls nothing external; it may run more than once. Records that must agree, such as a change and its audit entry, are written in the same transaction.

**Why:** a retried transaction repeats every side effect inside it, and records written apart can disagree after a failure.

## Every read is bounded

Every query that returns a list has a limit, and lists that can grow paginate.

**Why:** an unbounded read is fine on day one and an outage, or a bill, on the day the data grows.

## Money is an integer in the smallest unit

Store and compute money as integer minor units, or the language's decimal type; format only for display.

**Why:** floating point cannot represent most decimal amounts, and rounding errors accumulate silently.
