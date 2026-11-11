# Approval comes from someone other than the author

In a team, CODEOWNERS and a required review from another person approve a PR. Working alone, the owner approves. The landing command reads the same rule in both cases.

## Consequences

- Agents act on GitHub with the owner's account, so GitHub shows the owner as the author and will not let them approve. Whether agents get their own account is decided with the landing command.
