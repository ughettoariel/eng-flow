# Persistence and events

## Stored data evolves by expand and contract

Change a stored shape in steps: add the new field, have readers accept both old and new, migrate existing data in small batches, and only then remove the old field. Mark each stored record with its schema version.

**Why:** old records, old clients and new code coexist for longer than any deploy; a change made in one step breaks whichever of them is not updated.

## The current schema definition is the source of truth

What exists in some environment is not evidence of what the schema should be. Read the active definitions and migrations, never a database's current state or retired changelogs.

**Why:** environments drift, and copying a drifted state spreads it.

## Runtime has the least privilege that works

The code that runs in production can read and write data but cannot change schemas or access rules. Access is denied by default and opened per role and per collection or table.

**Why:** a bug or compromise in runtime code cannot widen its own access or destroy structure.

## No reaching into another area's data

An area reads another area's data through that area's interface, never directly from its storage.

**Why:** a direct read is a contract nobody versioned, and it breaks silently on the next change.

## Identifiers follow the store's guidance

Use the identifier scheme the store recommends. Never encode sensitive data or a guessable sequence in an id.

**Why:** some stores degrade under ordered keys and others need them; an id that leaks meaning or order exposes data and invites enumeration.

## Every event handler is idempotent

Assume events arrive more than once and out of order. Key the effect on the event's identity, check state before acting, and stop early when nothing changed. Retry only transient failures, and stop retrying after a cutoff.

**Why:** at-least-once delivery is the norm, and a handler that writes back to what triggered it loops until someone notices the bill.

## Transactions do no side effects

Code inside a transaction reads first, writes last, and calls nothing external; it may run more than once. Records that must agree, such as a change and its audit entry, are written in the same transaction.

**Why:** a retried transaction repeats every side effect inside it, and records written apart can disagree after a failure.

## Every read is bounded

Every query has a limit and paginates with a cursor.

**Why:** an unbounded read is fine on day one and an outage, or a bill, on the day the data grows.

## Money is an integer in the smallest unit

Store and compute money as integer minor units; format only for display.

**Why:** floating point cannot represent most decimal amounts, and rounding errors accumulate silently.
