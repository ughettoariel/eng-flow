# State and data

## State has one owner

A feature exposes its state read-only. No feature reads or writes another's internal state; state the whole app needs lives in a dedicated store.

**Why:** state reachable from outside its owner gets changed from outside its owner, and then nobody can reason about it.

## Signed in is not ready

Authentication succeeding does not mean the session can do work: tokens, roles or profile data may still be loading. Anything that loads on startup, on resume or on navigation waits for an explicit readiness signal.

**Why:** early calls fail intermittently, and intermittent startup failures are among the hardest bugs to reproduce.

## User data stored on a device leaves with the user

Every value stored locally is either cleared on sign-out or deliberately declared as belonging to the device (an install fact, an OS permission), with the reason.

**Why:** a value that survives sign-out shows one user's data to the next person on the same device.

## Keep the data path proportionate

A thin adapter between the domain and one store is enough. Add caching, offline queues or separate sources per storage kind only when a real requirement asks for them, and then give each one a single responsibility.

**Why:** layers added in advance cost on every change and protect against problems the app does not have.
