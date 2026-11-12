---
name: security-audit
description: Audit a diff you did not write for security problems, from a threat model of what it changes, and end with PASS or FAIL. Use for the security review of a ticket, when a change touches input, auth, data, secrets, dependencies or external services, or when asked for a security audit.
---

# Security audit

Audit only the diff you were given, against its base, and only code you did not write. Read the ticket too: a security property it asks for is a criterion, and one it leaves open is a question for the owner, never your assumption.

## Threat model first

1. **Trust boundaries the diff adds or changes.** HTTP requests, forms, uploads, webhooks, third-party APIs, queues, LLM output, and values that look internal because the OS handed them over: another process's command line or environment, filenames on a shared volume, a path in a job payload. Trust follows who wrote a value, not which channel delivered it.
2. **Assets within reach.** Credentials, personal data, payment data, admin actions, money movement.
3. **STRIDE over each boundary:** spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege. For each, ask how this diff could be misused.

A diff that crosses no trust boundary and reaches no asset ends here with PASS and one line saying so.

## What to check

Open the section of [references/hardening-patterns.md](references/hardening-patterns.md) or [references/security-checklist.md](references/security-checklist.md) you need when you reach that code, not before.

- Input reaching a query, a shell, HTML, `eval` or a file path without a schema at the boundary, parameterization or encoding.
- An endpoint with no authentication, or authorization missing on a protected resource (IDOR).
- Auth endpoints with no rate limit, or an in-memory limiter in front of more than one instance.
- Webhooks without signature verification; OAuth without PKCE and `state`; third-party scripts without integrity hashes; service accounts with more rights than they use.
- Secrets in code, logs, error bodies or the commit; sensitive fields in responses.
- Cookies, headers and CORS loosened; stack traces reaching users.
- Server fetches of a user-influenced URL without an allowlist (SSRF).
- A delete, move or overwrite whose target comes from input, guarded only by a shape check.
- New dependencies or install scripts nobody reviewed; lockfile changes that do not match the manifest. When the diff touches dependencies, run the package manager's native audit against the lockfile and report reachable Critical or High advisories.
- Personal data collected with no purpose, retention or deletion path, or sent to a vendor.
- LLM output used as code, a query or a path; secrets or another tenant's data in a model's context.
- Auth logic, a new kind of sensitive data, a new integration, CORS, uploads, rate limits or new roles: these need the owner's approval. When the ticket does not show it, report it as `Required` and name the decision.

## Report

Open with the threat model in one or two lines. Then at most five real findings, each with `file:line`, severity, the attack it allows and the fix. A `Critical` or `Required` finding carries the exploit scenario step by step. A fix never disables or loosens a security control.

| Severity | Meaning |
| --- | --- |
| `Critical` | Exploitable now: data loss, account takeover, a secret exposed |
| `Required` | Must be fixed before merge |
| `Optional` | Hardening worth doing, not required |
| `Nit` | Minor |
| `FYI` | Already there before this diff: a follow-up, never a reason to fail |

End with a line that is only `PASS`, or only `FAIL` when any `Critical` or `Required` is open. The report goes back to the session that asked for it, never to a PR comment, and only a short title per finding reaches the verdict note: the exploit scenario stays in the session. A secret that reached a remote is `Critical` whatever else holds: it is rotated first, then purged.

## Done

The threat model is stated in one or two lines and the verdict is written.
