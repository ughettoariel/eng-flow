# Verdict notes

A round's verdict is a git note on the commit it verified, under `refs/notes/eng-flow`. The note never changes the commit, never shows in the diff or the PR, survives the worktree or VM that wrote it, and binds the verdict to one SHA: a push after it needs a new round. No skill posts a commit status or writes a verdict into a PR, except the one line per ticket and the epic review's verdict that `run-epic` puts in the epic's PR into the default branch.

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

- An epic review's note opens with `epic: <number>` instead of `ticket:`, and sits on the epic branch's head. No app is walked for it, so an epic note's `verify` line lists the tickets whose last note passed verify, `verify: PASS  from #12 #13 #14`, and is `FAIL` when any ticket merged through `ship-ticket` has no PASS note. Spikes are left out: they are decided, not shipped.
- `previous` is the SHA of the round before; the first round has none. Following `previous` from the head gives the ticket's whole review history.
- Findings get ids `F1`, `F2` within their note and are cited elsewhere as `<sha>#F1`. Each line has the id, the severity (`Critical`, `Required`, `Optional`, `Nit`, `FYI`), the reviewer, `file:line` and a short title. Notes are pushed to the remote, which anyone can read on a public repository: the exploit steps stay in the session's report, and a note never quotes a secret, even one the finding is about. The same holds for PR descriptions and commit messages, `Addresses:` trailers included: they are public too.
- `resolved` closes every finding of the previous note as `fixed in <sha>`, `dismissed: <reason with a citation>` or `still open`. Nothing is left out. Only the next round's reviewer dismisses a finding, never the session that wrote the code: the reviewer returns its `resolved` lines in its report, and the session copies the reviewer's `resolved` block word for word. Dismissing a `Critical` or `Required` finding of `security-audit` needs the owner's answer in the live session's thread; a GitHub comment does not count, since a session can post one with the owner's token.
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

## After a rebase

A verdict covers a change, not a SHA, so a rebase onto a moved base keeps it when the change is the same. Compare the whole change at both heads, never single commits, and copy the note when they match:

```bash
old=$(git diff origin/<base>...<noted sha> | git patch-id --stable | cut -d' ' -f1)
new=$(git diff origin/<base>...HEAD | git patch-id --stable | cut -d' ' -f1)
[ "$old" = "$new" ] && git notes --ref=eng-flow copy <noted sha> HEAD && git push origin refs/notes/eng-flow
```

Different ids mean the change itself moved, as when a conflict was resolved: the new head needs a new round.
