---
name: roadmap-diagram
description: Draw an ordered process as an HTML diagram in the roadmap.sh style, with the main steps in yellow along a vertical line and side branches dashed. Use when asked for a roadmap-style diagram, or for a diagram of a process, workflow or onboarding path with ordered steps.
---

# Roadmap diagram

A visual style inspired by [roadmap.sh](https://roadmap.sh/frontend), the clearest way the owner knows to follow a process. Only the look is borrowed: no content or assets from roadmap.sh.

Start from [template.html](template.html); colours, fonts and both themes are defined there.

## When

Processes with an order: workflows, pipelines, onboarding paths, checklists with branches, where a main path is clear and details hang off each step. Not for architecture or component relationships (no order) or data with axes.

## Layout

- **One vertical column**, read top to bottom, no crossings.
- **Main step:** saturated yellow box, thick black border, bold text. What always happens, in order; one action per box, with a short line under it if needed.
- **Sub-step:** light box with a thin border, left or right of its step: detail, condition or who does it.
- **Optional:** page-coloured box, dotted border, prefix "(optional)".
- **Alternative:** light blue box, prefix "or", for two ways of doing the same thing.
- **Branches:** at most 3 per side. More means the step is too big: split it into two main steps.
- **Sides:** left is what goes in or conditions the step (who, with what, rules); right is what comes out (result, warnings, optionals). Keep the convention across the diagram.
- **Decision or checkpoint:** dark pill with "◆"; the question is the text and the outcomes are branches.
- **Loop or retry:** sub-step with "↻" saying where it returns and the limit ("max 2 rounds"). Never draw arrows back across the column.
- **Stop state:** reddish box with a double border and "■", for where the process stops or goes to a person; it says who receives what.
- **Sections:** a dark pill above the column grouping steps (a phase, a role).
- A role or model is a small `.tag` inside the box.

## Accessibility

Colour is never the only meaning: every box type adds a mark (dotted border and prefix, "or", "■", "◆", "↻"), the column line is solid and branches are dashed. Keep the legend at the top with every type the diagram uses. Text on yellow stays near-black in both themes. Real text, never text in images.

## Steps

1. Copy `template.html`; set `<title>` (2 to 4 words), the heading and the legend.
2. List the steps in order, mark the main ones, hang the rest as branches.
3. One `<section class="step">` per step: left column, centre box (`.main` or `.check`), right column.
4. Check it at 390 and 1280 px in light and dark: `node <skills>/ui-quality/scripts/ui-scan.mjs file://<path> --widths 390,1280` and again with `--dark`, where `<skills>` is the folder that holds this skill. Fix every contrast, overflow and overlap it reports.
