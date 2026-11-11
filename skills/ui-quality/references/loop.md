# Loop: audit, fix, measure, repeat

Keep improving a UI until the gate in section 4 passes or a stop condition in section 5 hits. State lives in the project's `ui-audit/` folder: one subfolder of scans per screen, `findings.json`, `history.json` and `scorecard.md`.

## 1. Steps

1. **Baseline (round 1).** Run the full Audit from `SKILL.md`, one scan folder per screen (`--out ui-audit/<screen>`). Record every confirmed finding in `ui-audit/findings.json` (format in section 3) and list every category you reviewed. Score the round:
   `node <skill>/scripts/ui-score.mjs --scans ui-audit --findings ui-audit/findings.json --round "1: baseline"`
   For native apps or screenshots, drop `--scans`; the score comes from findings only.
2. **Pick the round's fixes.** All open Blockers, then Majors, ordered by how many screens share the cause. Fix at the source (a token, a shared component) before patching screens: one token can close ten findings. Minors go last.
3. **Fix inside the project's design system.** A fix that needs a new token, a redesign or a copy decision is not made: note on the finding what is needed.
4. **Measure everything again.** Re-scan every screen and redo the manual pass on every category, not only what you touched: fixes cause regressions elsewhere. Mark a finding `fixed` only after seeing it fixed in the new evidence; add new findings. Run `node <skill>/scripts/ui-score.mjs` once per round, with a label saying what the round changed (`--round "2: text tokens, one button style"`).
5. **Read the scorecard.** A number that dropped is a regression: find its cause before the next round.
6. **Repeat from step 2** until `node <skill>/scripts/ui-score.mjs` exits 0, or stop as section 5 says.
7. **Report:** the audit report (`audit-report.md`) plus the last `scorecard.md`, with what each round changed and what is left: open Minors, `wontfix` with reasons, decisions needed from the owner.

Scores must reflect the screens. Never delete findings, mark them fixed without evidence, move categories to `notApplicable` to pass, or change styles only to move a heuristic (such as merging two colours that mean different things to lower the colour count). If a heuristic is wrong for this product, record a `wontfix` with the reason.

## 2. What the scores measure

Every number comes from evidence, so two reviewers of the same screens get the same scores. `node <skill>/scripts/ui-score.mjs` computes them.

**Automated (web, 0 to 100), worst value across every screen, width and theme:**

| Metric | Computed as |
| --- | --- |
| contrast | Share of text elements meeting WCAG AA for their size (disabled text excluded) |
| targets | Share of interactive targets meeting WCAG 2.5.8 |
| focus | Share of keyboard focus stops that change visibly and are not covered |
| reflow | 100 without horizontal scroll, 0 with it |
| semantics | 100, minus 25 each for no `lang`, zoom blocked, unnamed buttons or links, unlabelled fields, images without `alt`; minus 10 for no title; minus 5 each for not exactly one `h1` and skipped heading levels |

**Consistency (web, 0 to 100):** mean of the metrics below, from distinct computed values on the page. The gate uses the worst screen.

| Metric | Full marks up to | Then loses per extra value |
| --- | --- | --- |
| Font sizes | 8 | 8 |
| Font families | 2 | 25 |
| Font weights | 3 | 15 |
| Text colours | 8 | 6, and 5 per near-duplicate pair |
| Background colours | 8 | 5, and 5 per near-duplicate pair |
| Corner radii | 4 | 10 |
| Spacing on the 4 px grid | all multiples of 4 (rounded to whole px; 2 px and under ignored) | 2 per 1% of values off the grid |

A near-duplicate is two colours less than 12 apart in RGB (`#333333` and `#343434`): one token was meant. Browser default margins on headings show up as off-grid spacing; reset them.

**Category (every platform, 0 to 10):** one per section of `universal.md`; platform rules count toward the closest one. Score = 10 minus open findings (Blocker 4, Major 2, Minor 0.5), capped at 3 with an open Blocker and at 7 with an open Major. A category scores only if listed in `reviewed`; otherwise it is "not reviewed" and fails the gate.

**Overall:** mean of the automated mean, consistency and categories times 10. It tracks progress; the gate decides.

## 3. findings.json

```json
{
  "reviewed": ["hierarchy", "spacing", "typography", "color", "navigation", "states", "forms", "content", "motion", "accessibility", "performance", "i18n", "consistency"],
  "notApplicable": [],
  "findings": [
    { "id": "UI-01", "category": "color", "severity": "Blocker", "status": "open",
      "screen": "checkout", "summary": "Price hint #9a9a9a on white is 2.8:1",
      "evidence": "ui-audit/checkout/screen-390.png, .price-hint", "rule": "universal 4.1", "fix": "Use text-secondary" }
  ]
}
```

`category` is one of the keys in brackets in `universal.md`. `severity` is `Blocker`, `Major` or `Minor`. `status` is `open`, `fixed` (seen fixed in a later round) or `wontfix` (an owner decision, reason in `fix`). Keep fixed findings; they record what the loop did. `node <skill>/scripts/ui-score.mjs` rejects any other value and exits 2.

## 4. Gate

All required, by default: no open Blocker or Major; every automated metric at least 90; consistency at least 85; every applicable category reviewed and at least 8. A project can raise them with `--gates '{"auto":95,"category":9}'` (keys `auto`, `consistency`, `category`). Lowering them is the owner's decision, stated in the report.

## 5. Stop without passing

Stop and report instead of starting another round when:
- `node <skill>/scripts/ui-score.mjs` prints STALLED: the overall score has not risen for two rounds.
- It prints ROUND LIMIT: 5 rounds (change with `--max-rounds`).
- Only owner decisions are left (new tokens, redesigns, copy, product trade-offs): list them.
- A metric dropped after a fix and you cannot explain why: revert or investigate first.
