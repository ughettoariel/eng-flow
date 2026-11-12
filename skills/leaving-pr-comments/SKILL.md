---
name: leaving-pr-comments
description: Write a GitHub comment on the user's behalf: a mention of the owner, a direct reply that leads with the conclusion and cites the code or check behind it, and a signature naming the agent. Use whenever leaving a comment or review reply on GitHub.
---

# Leaving PR Comments

Open every agent-authored comment left on the user's behalf with a mention of
the owner, and close it with a signature line naming the agent:

```md
@<owner login> Actual comment starts here.

- by 🤖 <model>
```

Use the verified public name of the model that wrote the comment. If the
harness does not expose a model name, use the harness name. Do not guess.

Before posting, check the entire comment, including quoted text and
attachments, for secrets and private details.

The signature is the last line, alone, and the only attribution. Do not add a
horizontal rule, heading, callout or second signature. When the agent posts
with the owner's own account, GitHub sends no notification for the mention; it
still marks the comment as written for them.

Apply this format to top-level PR comments, inline review comments, replies to
bots or reviewers, and written explanations used before resolving or
dismissing feedback. Do not add it to PR descriptions, commit messages, or text
the user explicitly asked to post verbatim without attribution.

Comments are for other people: reviewers, collaborators and bots, and each one
is noise on the PR, so leave one only when it is needed. A question for the
owner goes to the session, parked in `.eng-flow/questions/` when it gets no answer,
never to a GitHub comment. Write in English.

Write the comment itself in a direct style:

- Lead with the conclusion.
- Cite the relevant code, behavior, check, or reproduction.
- Keep it concise and avoid filler, canned thanks, or status narration.
- Distinguish verified facts from judgment.

Preview the final Markdown before posting so quoting and blank lines render as
shown. After posting, verify that GitHub returned the comment or review URL.
Resolve a review thread only after its response was posted successfully.
