---
name: ui-quality
description: Build, audit or repeatedly fix a UI for web, phone and tablet against scored UI/UX rules until it reaches a passing score. Use when building a screen or component, when asked to audit or review existing UI, to iterate until a UI passes, or before handing off a UI change.
---

# UI quality

Rules live in `references/`. Read only what the work needs:

| File | Read when |
| --- | --- |
| `universal.md` | Always |
| `web.md` | Anything in a browser or web view |
| `mobile.md` | Phone layouts (shared, iOS, Android) |
| `tablet.md` | Tablets, foldables, desktop windows, anything wider than a phone |
| `loop.md` | Loop mode |
| `audit-report.md` | Writing an audit report |

Platform files add to `universal.md` and may raise its numbers, never relax them. When the project has its own design system (tokens, glossary, UI principles), it decides values and names; these rules decide what must be true.

The scripts sit in `scripts/` of this skill and need Node 24. In the commands below, `<skill>` is this skill's folder. `--help` prints a script's usage.

Say which mode you are in: **Build**, **Audit** or **Loop**.

## Build

1. **Scope.** Name the platforms and window sizes to support; read the matching files. Find the project's tokens, components and glossary before writing any style.
2. **Plan before styling:** the one primary action; content in order of importance; how people arrive and go back; every content state (loading, empty, error, partial, ideal, offline on mobile); every control state (default, hover, focus, pressed, disabled, loading, error).
3. **Build with the system:** tokens for every value, existing components first, platform conventions before custom ones, scalable text units, each inset applied by one owner.
4. **Check.** Run Audit steps 2 to 4 on what you built, at the narrowest and widest widths and the largest text size. Fix every Blocker and Major; list the Minors left and why.

## Audit

1. **Scope:** screens, platforms, sizes, and the source (running app or URL, code, screenshots, design file). Ask only what cannot be inferred.
2. **Capture evidence.** Web: for each screen, `node <skill>/scripts/ui-scan.mjs <url> --out ui-audit/<screen>` (add `--dark` for the dark theme). It writes `scan.json`, `scan.md` and a screenshot per width (default 320, 390, 768, 1280), and flags contrast, small text, target size, reflow, missing names and labels, headings, blocked zoom and focus problems. Each item is a candidate to confirm on the screenshot. It needs Playwright from the skill folder or the project; if neither has it, ask before adding it, and meanwhile audit from screenshots and code, saying the automated pass was skipped. Native or screenshots: captures at the smallest and largest sizes, light and dark, default and largest text. Capture states too: empty, loading, error, long name, long translation, form with errors. For one colour pair: `node <skill>/scripts/ui-contrast.mjs <fg> <bg> [--size px] [--bold]`.
3. **Code pass, when code is available:** `node <skill>/scripts/ui-code.mjs <dirs>` lists colour literals, off-grid spacing, raw font sizes, `outline: none` without a focus style and clickable divs. Then look for what it cannot see: fixed heights on text containers, hard-coded strings, insets applied in more than one place.
4. **Manual pass.** Apply every rule of `universal.md` and the platform files to each screen; a rule is done when it is a finding, a pass, or not applicable. One keyboard-only pass on web and tablet; one screen reader pass on the main flow when you can run one.
5. **Report** with `audit-report.md`: each finding with screen, evidence, rule (`universal 4.1`), severity and a concrete fix, sorted by severity and by how many screens share the cause. Add two or three lines on what already works.

Severity: **Blocker** stops a task or fails WCAG 2.2 A/AA. **Major** slows, misleads or causes errors. **Minor** is polish. A finding you did not confirm on the screen is not reported. An audit lists fixes against rules; a redesign or a new token is a decision for the owner, listed as such. Contrast passes or fails on WCAG 2 only.

## Loop

Audit, fix and measure again until `node <skill>/scripts/ui-score.mjs` exits 0 or a stop condition hits. Read `references/loop.md` first and follow its steps.
