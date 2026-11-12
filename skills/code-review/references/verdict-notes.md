# Verdict notes

A round's verdict is a git note on the commit it verified, under `refs/notes/eng-flow`. The note never changes the commit, never shows in the diff or the PR, survives the worktree or VM that wrote it, and binds the verdict to one SHA: a push after it needs a new round. No skill posts a commit status or writes a verdict into a PR.

The session that ran the round writes the note once every reviewer and `verify-as-user` have answered. Reviewers return their reports to that session and write nothing themselves.

## Format

```text
ticket: 42
round: 2
previous: a1b2c3d
verdict: PASS
resolved:
  a1b2c3d#F1  fixed in d4e5f6a
  a1b2c3d#F2  dismissed: the HTTP client retries it (src/http.ts:30)
findings:
  F1  Nit       code-review     src/auth/google.ts:12  name says token, holds a claim set
verify: PASS  criteria 1-3 walked at d4e5f6a
```

- `previous` is the SHA of the round before; the first round has none. Following `previous` from the head gives the ticket's whole review history.
- Findings get ids `F1`, `F2` within their note and are cited elsewhere as `<sha>#F1`. Each line has the id, the severity (`Critical`, `Required`, `Optional`, `Nit`, `FYI`), the reviewer, `file:line` and the problem.
- `resolved` closes every finding of the previous note as `fixed in <sha>`, `dismissed: <reason with a citation>` or `still open`. Nothing is left out.
- `verdict` is `PASS` only when no `Critical` or `Required` finding is open, nothing is `still open`, and `verify` passed. Otherwise it is `FAIL`.

A fix commit may carry the trailer `Addresses: <sha>#F1`. It helps the next reviewer find the fix; whether the finding is fixed is still that reviewer's call.

## Commands

Every ticket of the repository shares `refs/notes/eng-flow`, so sync by merging the remote notes into yours, never by fetching over them: a plain fetch is refused once you hold a note you have not pushed.

```bash
# Sync, before reading or writing. With no notes on the remote yet (the first round of a
# repository), ls-remote exits 2 and there is nothing to merge
if git ls-remote --exit-code origin refs/notes/eng-flow >/dev/null; then
  git fetch origin +refs/notes/eng-flow:refs/notes/eng-flow-remote
  git notes --ref=eng-flow merge -s union refs/notes/eng-flow-remote
fi

git notes --ref=eng-flow show <sha>                 # read the verdict of a commit
git notes --ref=eng-flow add -f -F note.txt <sha>   # write it
git push origin refs/notes/eng-flow                 # publish it; when refused, sync and push again
```

Notes on different commits merge cleanly. Two notes on the same commit come out of the union merge concatenated, which can hold a PASS and a FAIL at once: rewrite that commit's note as one verdict from both before you push.
