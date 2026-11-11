# ADR format

Adapted from Matt Pocock's `domain-modeling` skill (MIT).

ADRs live in `docs/adr/` unless the `ADRs` line of `docs/agents/project.md` names another folder, numbered in sequence: `0001-slug.md`, `0002-slug.md`. Take the highest number there and add one. Create the folder on the first ADR.

```md
# {Short title of the decision}

{One to three sentences: the context, what was decided, and why.}
```

That is a complete ADR. Add a section only when it earns its place:

- `Status` (`proposed`, `accepted`, `deprecated`, `superseded by ADR-NNNN`), when the decision may be revisited.
- `Considered options`, when a rejected alternative is likely to be proposed again.
- `Consequences`, when a downstream effect is not obvious.

## When a decision gets one

All three hold:

1. **Hard to reverse.** Changing it later costs real work.
2. **Surprising without context.** A future reader would wonder why it was done this way.
3. **A real trade-off.** There were genuine alternatives and one was picked for a reason.

Typical cases: the architecture's shape, how two contexts integrate, a technology with lock-in (database, auth provider, hosting), who owns which data, a deliberate deviation from the obvious path, a constraint the code cannot show (compliance, a partner's latency contract), and a rejected alternative someone will suggest again.
