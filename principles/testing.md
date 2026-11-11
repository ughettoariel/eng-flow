# Testing

## Test rules through public interfaces

Business rules are tested through the functions other code calls, not through internals. Each new rule gets a failing test first.

**Why:** tests through the interface survive refactors and fail only when behaviour changes.

## Access rules are tested both ways

Every access rule has a test where an allowed role succeeds and one where a denied role fails.

**Why:** a rule tested only on the happy path is usually open.

## Tests ship with the change

New behaviour comes with its tests in the same change, and removing a field or endpoint removes or updates the tests and fixtures that use it.

**Why:** a reviewer sees the behaviour and its proof together, and stale fixtures keep dead contracts looking alive.

## Test names state the rule

A test name reads as the rule it proves. The name replaces a comment.

## Every boundary in the docs has a test

When the architecture says something must not depend on something else, an automated check fails the build when it does.

**Why:** a boundary that is only written down erodes one reasonable-looking import at a time, and agents cross it without noticing.

## Mocked walks leave the contract to the fixtures

When a walk's API calls are answered by mocks, a client-server mismatch is caught by the fixtures: typed with the shared contract types, or validated against the backend schema in the checks. `verify` does not catch it.

**Why:** a mock answers with whatever fixture it holds, so a walk over a stale fixture passes against a server that changed.

## Async tests leave nothing running

A test that starts long-lived work (timers, subscriptions, background tasks) stops it before restoring the test environment, and fakes every call that work makes.

**Why:** leaked async work fails later, inside an unrelated test, where the cause cannot be traced.
