# Tracker operations

`wayfinder`, `spec`, `slice` and `grill` name these operations instead of a tracker. Which block applies follows the `Tickets` line of `docs/agents/project.md`, as [project-config.md](project-config.md) describes.

| Operation | What it does |
| --- | --- |
| Create the epic | One issue that holds the goal, the spec and its decisions |
| Create a child | A ticket or spike under the epic, with its type |
| Mark a blocker | Ticket A cannot start until ticket B is closed |
| List the ready ones | Open children of the epic with no open blocker |
| Edit or close | Replace a body, or close as completed or not planned |

## GitHub

Use REST through `gh api`; `gh` fills `{owner}` and `{repo}` from the current checkout. `gh issue create` and the sub-issue mutations go through GraphQL, which some tokens and proxies refuse, so these commands avoid them.

Sub-issues and blockers take the issue's `id`, not its number. Every create below prints both; keep them.

```bash
# Create the epic, or a child with its type label (enhancement, bug, documentation, chore, refactor, spike)
gh api repos/{owner}/{repo}/issues -f title='...' -F body=@body.md -f 'labels[]=epic' --jq '{number, id}'

# Attach a child to its epic
gh api repos/{owner}/{repo}/issues/<epic number>/sub_issues -F sub_issue_id=<child id>

# Mark a blocker: <blocked number> waits for the issue with <blocker id>
gh api repos/{owner}/{repo}/issues/<blocked number>/dependencies/blocked_by -F issue_id=<blocker id>

# List the ready ones: open children, then drop any with an open blocker
gh api repos/{owner}/{repo}/issues/<epic number>/sub_issues --jq '.[] | select(.state == "open") | .number'
gh api repos/{owner}/{repo}/issues/<child number>/dependencies/blocked_by --jq '.[] | select(.state == "open") | .number'

# Edit a body, or close (state_reason: completed or not_planned)
gh api -X PATCH repos/{owner}/{repo}/issues/<number> -F body=@body.md
gh api -X PATCH repos/{owner}/{repo}/issues/<number> -f state=closed -f state_reason=completed

# Look up the id of an issue you only know by number
gh api repos/{owner}/{repo}/issues/<number> --jq .id
```

The labels must exist first; `setup-project` creates them. Where the blocked-by endpoint answers 404 (some GitHub Enterprise Server versions), write `Blocked by #<number>` as the first line of the blocked ticket's body and read it from there.

## Another tracker

Keep the same structure in that tracker's own fields: the epic is its epic or parent issue, a child is a child issue with its type, a blocker is its "blocks" link. File through its MCP server or CLI when the session has one. Otherwise write each issue's title and body in the session for the owner to file, and wait for their keys before marking blockers. Never open GitHub issues for it.

## None

Nothing is filed. Each operation returns its text in the session, the owner's request is the ticket, and decisions go in the summary.
