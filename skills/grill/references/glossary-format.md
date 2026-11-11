# Glossary format

Adapted from Matt Pocock's `domain-modeling` skill (MIT).

The glossary is the project's shared language: the words the code, the tickets and the people use for the same thing. It lives at `CONTEXT.md` in the repo root unless the project config names another file.

```md
# {Context name}

{One or two sentences: what this context is and why it exists.}

## Language

**Order**:
A customer's request for one or more products, from checkout until delivery.
_Avoid_: purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: bill, payment request
```

- Pick one word per concept and list the others under `_Avoid_`.
- One or two sentences per term: what it is, not what it does.
- Only terms specific to this project. General programming concepts (timeouts, retries, error types) stay out.
- Group terms under subheadings when clusters appear; a flat list is fine otherwise.
- A repo with several contexts keeps one glossary per context and a `CONTEXT-MAP.md` at the root that lists them and how they relate (who emits what, who consumes it, which types they share).
- Create the file on the first term, not before.
