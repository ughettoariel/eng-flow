# Short epics, merged from main only when a ticket starts

There is no workflow that merges `main` into branches with work in progress. `main` is merged into the epic branch when a ticket starts, and the epic closes as soon as its tickets are done. Work that does not fit in a few days is split with `wayfinder`.

## Considered options

- An automatic restack of every open branch on each push to `main`. Rejected: it creates merge conflicts nobody asked for, on branches nobody is working on.
