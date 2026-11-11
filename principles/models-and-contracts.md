# Models and contracts

## Three models, each with one job

| Model | Shape follows | Changes when |
| --- | --- | --- |
| Contract | The wire or the stored document | The API or storage format changes |
| Domain model | The business rules | A rule changes |
| View model | What one screen draws | The design changes |

Data moves from one to the next only through a mapper.

**Why:** each changes for its own reason. Separate models let each change land in one place.

## Contracts stay at the boundary

A contract is used only where data enters or leaves the process: the adapter that reads or writes storage, the handler that receives a request, the client that calls a remote function. It never reaches the domain, a view or a component.

**Why:** once a contract leaks inward, a format change becomes a change everywhere and versioning it becomes impossible.

## The contract-to-domain mapper only translates

It renames and converts representations. It does not decide, compute or clean content; if content needs reshaping, the producer does it before sending.

**Why:** a mapper that decides becomes untested business logic in the wrong layer, copied by every consumer.

## The view mapper owns display decisions

Labels, fallbacks for missing data, formatting, grouping and progress figures live in a mapper beside the screen.

**Why:** the domain stays free of presentation, and display logic gets one testable home instead of spreading through components.

## Share schemas, derive types

When client and server share types, share the schema that validates the data and derive the static types from it. Never keep a hand-written type next to a schema for the same data.

**Why:** a type that is not derived from the validator drifts from it, and the compiler then vouches for data nobody checked.

## Parse once, at the boundary

Untrusted data (requests, stored documents, environment, another service, a model's output) is parsed into a precise type where it enters. Inner code accepts only parsed types and never parses again.

**Why:** validation scattered through the code is both repeated and incomplete. A precise type is the proof that parsing happened.

## Shared code carries no SDK or platform types

Types shared between client and server use only plain values. Each side converts its SDK's own types (timestamps, references, file handles) at its boundary.

**Why:** client and server SDKs model the same thing with different classes; shared code that imports either one cannot run on the other side.

## Representations that round-trip are reversible

When data is decoded for use and later encoded back (dates sent as text, money stored as integers), define both directions together rather than a one-way transform.

**Why:** a one-way transform works on read and fails on the first write, usually in production.

## Versions are explicit

A contract carries its version in its name and location. A breaking change creates a new version beside the old one, and both live while consumers migrate. Breaking means removing or renaming a field, changing its type or tightening validation; adding an optional field is not.

**Why:** client and server deploy at different times, so two versions are always alive at once. A visible version makes mixing them obvious in every diff.

## Deprecate before removing

Mark the old version deprecated, mark the code only it uses, and remove both once no consumer calls it.

**Why:** removing without a window breaks clients still in the field.

## Published events carry the minimum necessary

An event payload is a projection for its consumers, never a serialized aggregate or record. Include only what a known consumer needs, never free text that may hold sensitive data, never a catch-all bag of extra fields. A new field is a new minor version that every consumer tolerates first.

**Why:** a published field is a contract with every consumer forever, and the publisher is the only reliable filter for sensitive data.
