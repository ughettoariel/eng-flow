# Architecture

## Dependencies point inward

The domain depends on nothing: no framework, UI, storage or platform API. Everything else depends on the domain, never the reverse.

**Why:** business rules outlive every framework around them, and code without dependencies is the cheapest to test and the only kind that can be shared between client and server.

## Functional core, thin shell

Decisions live in pure functions. The shell around them loads data, calls the core once and saves the result. A handler, a screen or a job that decides something is misplaced logic.

**Why:** the core can be tested without any infrastructure, and the shell is too thin to hide a bug.

## The shared kernel stays minimal

Code shared by client and server holds only what both sides actually use. Something only one side uses lives on that side.

**Why:** everything shared is a published language every consumer must agree on. Each unnecessary type there couples parts that never needed to know about each other.

## Organize by business area, not by owner or layer

Group shared code by subdomain (orders, pricing), not by which service owns it and never under a catch-all "shared" or "utils" folder.

**Why:** business areas are stable; ownership and layers move. A "shared" folder inside shared code says nothing and collects everything.

## Features are vertical slices with one public entry

A feature holds everything for one business capability and exposes one public entry point; other features use only that entry. Split a feature when it changes for different business reasons, when users can finish a meaningful task inside it, or when it owns distinct data.

**Why:** a change to one capability touches one place, and removing a capability removes one place.

## Share late

Start code where it is first needed. Move it to a shared place when a second consumer appears, and make it a separate module only when it needs its own lifecycle.

**Why:** an abstraction shaped by one consumer is paid for by all the others.

## No technical features

Networking, storage or helpers are not features. Technical infrastructure lives in a foundation layer that knows no business concept.

**Why:** a feature named after a technology has no owner and attracts unrelated code.
