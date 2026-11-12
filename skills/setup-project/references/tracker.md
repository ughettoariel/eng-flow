# Tracker operations

`wayfinder`, `spec`, `slice`, `grill`, `ship-ticket` and `run-epic` name these operations instead of a tracker. Which block applies follows the `Tickets` line of `docs/agents/project.md`, as [project-config.md](project-config.md) describes.

| Operation | What it does |
| --- | --- |
| Create the epic | One issue that holds the goal, the spec and its decisions |
| Create a child | A ticket or spike under the epic, with its type |
| Mark a blocker | Ticket A cannot start until ticket B is closed |
| List the ready ones | Open children of the epic with no open blocker |
| Edit or close | Replace a body, or close as completed or not planned |
| Add to the board | Put a ticket on the board in a Status |
| Move on the board | Change a ticket's Status |

## GitHub

Use REST through `gh api`; `gh` fills `{owner}` and `{repo}` from the current checkout. `gh issue create` and the sub-issue mutations go through GraphQL, which some tokens and proxies refuse, so these commands avoid them.

Sub-issues and blockers take the issue's `id`, not its number. Every create below prints both; keep them.

```bash
# Create the epic, or a child with its type label (enhancement, bug, documentation, chore, refactor), or `spike`
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

# Look up the id of an issue you only know by number, and who opened it
gh api repos/{owner}/{repo}/issues/<number> --jq '{id, author: .user.login}'

# Whether that person can write to the repository: write or admin
gh api repos/{owner}/{repo}/collaborators/<author>/permission --jq .permission
```

The labels must exist first; `setup-project` creates them. Where the blocked-by endpoint answers 404 (some GitHub Enterprise Server versions), write `Blocked by #<number>` as the first line of the blocked ticket's body and read it from there.

## The board

The `Board` URL gives the REST path: `https://github.com/users/<login>/projects/<n>` is `users/<login>/projectsV2/<n>`, and `https://github.com/orgs/<org>/projects/<n>` is `orgs/<org>/projectsV2/<n>`. Adding and moving go through REST, so they work where GraphQL is refused.

```bash
B=users/<login>/projectsV2/<n>

# The Status field id and its option ids; a Status is set by option id, never by name
gh api $B/fields --jq '.[] | select(.name == "Status") | {id, options: [.options[] | {id, name: .name.raw}]}'

# Add a ticket to the board; prints the item id
gh api -X POST $B/items -f type=Issue -F id=<issue id> --jq .id

# Find the item id of a ticket already on the board. A project can hold several repositories,
# so match the repository as well as the number
gh api "$B/items?per_page=100" --paginate --jq '.[] | select(.content.number == <number> and (.content.repository_url | endswith("/<owner>/<repo>"))) | .id'

# Move it: one field, the option id of the new Status
gh api -X PATCH $B/items/<item id> --input - <<< '{"fields":[{"id":<status field id>,"value":"<option id>"}]}'
```

Creating a project and changing its Status options have no REST endpoint, so `setup-project` does them once, through GraphQL, in a session that allows it:

```bash
gh project create --owner <owner> --title '<repo>' --format json --jq .number
gh project link <n> --owner <owner> --repo <owner>/<repo>

# Replace the Status options. An option passed without its id is created again with a new one,
# and every item in it loses its Status: pass the current id of each option that stays (from the
# fields call above) and leave it out only for a new option. Items in an option that disappears
# lose their Status too, so on a linked project move them first and show the owner which ones
gh project field-list <n> --owner <owner> --format json --jq '.fields[] | select(.name == "Status") | .id'
gh api graphql -f field=<status node id> -f query='mutation($field: ID!) { updateProjectV2Field(input: {fieldId: $field, singleSelectOptions: [
  {id: "<Backlog id>", name: "Backlog", color: GRAY, description: ""},
  {id: "<In progress id>", name: "In progress", color: YELLOW, description: "At most two"},
  {name: "Parked", color: ORANGE, description: "Waiting on an answer"},
  {id: "<In review id>", name: "In review", color: PURPLE, description: ""},
  {id: "<Done id>", name: "Done", color: GREEN, description: ""}]}) { projectV2Field { ... on ProjectV2SingleSelectField { options { name } } } } }'
```

Check that the built-in workflow `Item closed` is on, since it moves a closed ticket to `Done`:

```bash
gh api graphql -f query='query { user(login: "<login>") { projectV2(number: <n>) { workflows(first: 20) { nodes { name enabled } } } } }'
```

For an organisation's project, start the query from `organization(login: "<org>")`. When the mutation is refused, show the owner the five options to set by hand in the project's settings, and check them afterwards with the `fields` call above.

## Another tracker

Keep the same structure in that tracker's own fields: the epic is its epic or parent issue, a child is a child issue with its type, a blocker is its "blocks" link. File through its MCP server or CLI when the session has one. Otherwise write each issue's title and body in the session for the owner to file, and wait for their keys before marking blockers. Never open GitHub issues for it.

## None

Nothing is filed. Each operation returns its text in the session, the owner's request is the ticket, and decisions go in the summary.
