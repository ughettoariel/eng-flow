# Audit report template

Write the report in the reader's language. Keep the table; drop sections that are empty. Category is a key from `universal.md` (the same one `findings.json` uses).

```markdown
# UI audit: <product or flow>

Date: <YYYY-MM-DD> · Platforms: <web / iOS / Android / tablet> · Sizes: <widths or devices> · Themes: <light, dark>
Screens: <list> · Evidence: <URL, build, screenshots folder, commit>

## Summary

<Two or three sentences: overall state, the biggest problem, what to fix first.>

| Severity | Count |
| --- | --- |
| Blocker | n |
| Major | n |
| Minor | n |

## Findings

| ID | Severity | Screen | Category | Problem | Evidence | Rule | Fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UI-01 | Blocker | Checkout | color | Price hint #9a9a9a on white is 2.8:1 | screen-390.png, `.price-hint` | universal 4.1 | Use `text-secondary` (#616161, 6.2:1) |
| UI-02 | Major | All list screens (6) | states | No empty state, only a blank area | screen-768.png | universal 6.2 | Message, reason and "Create" action |

## Quick wins

<Findings that are a one-line change each: token swaps, missing labels, focus styles.>

## What already works

<Two or three things to keep, so fixes do not break them.>

## Not covered

<What this audit did not check and why: screen reader, devices not available, flows out of scope.>
```

## Writing a finding

- **Problem** says what a person experiences, not only the property: "Error text is red only; colour-blind people miss it", not "uses #e00".
- **Evidence** lets someone find it in one step.
- **Fix** is concrete enough to implement without another meeting: the token, the component, the value, the copy.
- One cause, one finding. Ten buttons failing for the same token is one finding with a count.
