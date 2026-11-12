# Web rules

Adds to `universal.md` for anything rendered in a browser, including web views inside apps. Build to WCAG 2.2 AA.

## 1. Responsive layout

**1.1 Design from the narrowest width up, with breakpoints where the content breaks**, not at device names. Typical checks: 320, 375, 768, 1024, 1280, 1440+.

**1.2 Reflow at 320 CSS px.** At 320 px wide (the same as 1280 px at 400% zoom) content reads in one direction with no horizontal scroll, except for content that needs two dimensions: maps, data tables, diagrams (WCAG 1.4.10).
Check: `document.documentElement.scrollWidth > innerWidth` at 320 px is a Blocker.

**1.3 Zoom to 200% without losing content** (WCAG 1.4.4). Never disable zoom: no `user-scalable=no` and no `maximum-scale` below 2 in the viewport meta.

**1.4 Components respond to their container, pages to the viewport.** Use container queries for cards, panels and widgets that appear in different column widths.

**1.5 Cap reading width** (about `65ch` to `75ch` for prose) and centre or offset it on wide screens.

**1.6 Mobile viewport units.** `100vh` includes space under the mobile browser bars; use `100dvh` (or `svh` for the safe minimum). With `viewport-fit=cover`, pad fixed elements with `env(safe-area-inset-*)`.

## 2. Units and typography

**2.1 Font sizes in `rem`**, so the browser's text-size setting applies. Fluid type with `clamp()` must include a `rem` term (`clamp(1rem, 0.9rem + 0.5vw, 1.25rem)`); pure `vw` sizes do not grow with zoom.

**2.2 Base size 16 px (1rem).** Inputs at least 16 px on iOS Safari, or it zooms the page on focus.

**2.3 Text-spacing override survives** (WCAG 1.4.12): no fixed heights on text containers, no `overflow: hidden` clipping lines.

**2.4 Web fonts do not shift layout or hide text.** `font-display: swap` or `optional`, a metric-matched fallback (`size-adjust`, `ascent-override`), and preload only the one or two files above the fold.

## 3. Keyboard and focus

**3.1 Everything works with a keyboard alone** (WCAG 2.1.1), with no traps (2.1.2).

**3.2 Tab order equals visual order.** DOM order matches layout; avoid positive `tabindex`; `order` and `flex-direction: row-reverse` do not reorder focus.

**3.3 Visible focus on every focusable element.** Use `:focus-visible` with an outline at least 2 px thick and 3:1 against the background; never `outline: none` without a replacement. Prefer `outline` over `box-shadow`, which disappears in forced-colours mode.

**3.4 Focus is not hidden** by sticky headers, cookie banners or chat widgets (WCAG 2.4.11). Use `scroll-padding-top` equal to the sticky header height.

**3.5 A skip link** to the main content as the first focusable element on pages with repeated navigation (WCAG 2.4.1).

**3.6 Dialogs:** use `<dialog>` with `showModal()` or equivalent: focus moves into the dialog, stays there, Escape closes it, focus returns to the trigger, the page behind is `inert`.

**3.7 Composite widgets** (tabs, menus, listboxes, grids) follow the ARIA Authoring Practices keyboard model: arrow keys inside, Tab to leave.

## 4. Semantics

**4.1 Native elements first.** `<button>` for actions, `<a href>` for navigation, `<label>` for fields, `<input type>` for data. The first rule of ARIA: do not use ARIA where a native element does the job. A `<div onclick>` is a Blocker unless it has role, tabindex and key handling.

**4.2 Landmarks and headings.** `header`, `nav`, `main`, `footer`; one `h1` per page; heading levels do not skip.

**4.3 Unique, descriptive `<title>` per page** (WCAG 2.4.2) and `lang` on `<html>` (3.1.1).

**4.4 Images:** meaningful ones have `alt` describing their purpose; decorative ones `alt=""`; icon buttons get `aria-label`; inline SVG icons used as decoration get `aria-hidden="true"`.

**4.5 Dynamic updates are announced:** status messages through a live region (`role="status"`), errors through `role="alert"` or by moving focus (WCAG 4.1.3).

## 5. Navigation

**5.1 Links navigate, buttons act.** Middle-click, open-in-new-tab and copy-link work on everything that goes somewhere.

**5.2 The URL holds the state** (tab, filter, sort, page, open item). Browser back and forward work as expected, including inside single-page apps.

**5.3 The current page is marked** visually and with `aria-current="page"`.

**5.4 Breadcrumbs for hierarchies deeper than two levels.**

**5.5 Navigation and help appear in the same place and order across pages** (WCAG 3.2.3, 3.2.6).

**5.6 Open in a new tab only when leaving would lose work**, and say so in the link.

**5.7 Responsive navigation:** on narrow screens a bottom bar or a visible top bar for 3 to 5 primary destinations; a menu button is fine for secondary ones.

## 6. Pointer, hover and touch

**6.1 Targets at least 24 x 24 CSS px** or spaced so a 24 px circle centred on each does not touch another target (WCAG 2.5.8). Aim for 44 x 44 px on touch-first pages. Inline links in sentences are exempt.

**6.2 Hover is an enhancement.** Nothing essential is available only on hover; use `@media (hover: hover) and (pointer: fine)` for hover-only affordances.

**6.3 Content shown on hover or focus** (tooltips, popovers) can be dismissed with Escape, can be hovered itself, and stays until dismissed (WCAG 1.4.13).

**6.4 Pointer actions fire on release** (`click`, not `mousedown`) so people can slide off to cancel (WCAG 2.5.2).

**6.5 Cursors match affordances:** `pointer` on clickable things only, `text` in fields, `not-allowed` on disabled controls if shown.

## 7. User preferences

**7.1 Colour scheme:** `prefers-color-scheme` with a manual override, and `color-scheme: light dark` so form controls and scrollbars follow.

**7.2 `prefers-reduced-motion: reduce`** disables parallax, autoplaying carousels, large transitions and smooth scrolling.

**7.3 `prefers-contrast: more`** raises borders and text contrast.

**7.4 `forced-colors: active`** (Windows high contrast): use system colour keywords (`CanvasText`, `ButtonText`, `Highlight`), keep borders on controls (transparent borders become visible), do not convey state with background colour alone.

## 8. Forms

**8.1 `autocomplete` tokens** (`email`, `name`, `street-address`, `one-time-code`, `current-password`, `new-password`), the right `type` and `inputmode` for the mobile keyboard.

**8.2 Errors are tied to the field:** `aria-invalid="true"` and `aria-describedby` pointing at the message.

**8.3 Groups of radios or checkboxes use `fieldset` and `legend`.**

**8.4 Do not disable the submit button to signal errors**; let people submit and explain what is missing.

## 9. Performance (Core Web Vitals)

Measured at the 75th percentile of page loads, separately for mobile and desktop:

| Metric | Measures | Good |
| --- | --- | --- |
| LCP, Largest Contentful Paint | Loading | 2.5 s or less |
| INP, Interaction to Next Paint | Responsiveness | 200 ms or less |
| CLS, Cumulative Layout Shift | Visual stability | 0.1 or less |

**9.1 Images and embeds declare `width` and `height` or `aspect-ratio`**; responsive images use `srcset` and `sizes`; below-the-fold images `loading="lazy"`, the LCP image never lazy and with `fetchpriority="high"`.

**9.2 Long tasks are split** so input is handled within 200 ms; heavy work goes to a worker.

**9.3 Skeletons match the final layout** so the swap does not shift content.
