# Security

## Validate at every trust boundary

User input, other services, external APIs, stored data written by clients and a model's output are all untrusted until parsed.

**Why:** the one unparsed input is the one an attacker uses.

## The server decides access, not the client

Hiding a button is a convenience; the rule that allows or denies the action is enforced where the data lives.

**Why:** anything the client enforces can be skipped by calling the backend directly.

## Sensitive data is minimised

Collect only what a feature needs, never log it in plain text, never put it in a payload that does not need it, and never rely on a consumer to filter it out.

**Why:** data that was never collected or sent cannot leak.

## Callers prove who they are

An internal endpoint verifies the caller's identity itself and checks it against what that route allows. A service missing its verification settings refuses to start instead of running open.

**Why:** an internal route without its own check is open to anything that can reach it.

## Secrets live outside the code

Secrets come from the platform's secret store at runtime and are bound only to the code that needs them.

**Why:** a secret in code or in a broad environment is readable by everything that can read either.

## Trust changes need a human

Changes to authentication, authorization, consent, encryption or anonymisation are approved by a person before they are made.
