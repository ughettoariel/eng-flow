# eng-flow runs nothing in the projects that install it

eng-flow ships skills and their references only: no hooks, no scripts and no principles of its own. Installing it needs `git` and `gh`, nothing a project in any language would not have. Rules a project must hold come from that project, as checks in its tests, linters and CI, and the skills read them there.

## Considered options

- A Node hook and scripts inside the plugin. Rejected: projects in other languages lack Node or pin an older one, and a failing hook fires on every edit.
- Shared engineering principles in the plugin. Rejected: an agent applies them to projects where they do not fit, and a principle worth holding is a check in the project instead.

## Consequences

- `ui-quality`, which needs Node and Playwright, is a separate plugin in the same marketplace, installed only in projects with screens.
