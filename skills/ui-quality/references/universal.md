# Universal rules

Rules that hold on every platform: web, phone, tablet, desktop. Platform files add or override numbers; they never relax a rule here.

Some rules carry a **Check** line where pass or fail is not obvious. Category keys for `findings.json` are in brackets after each section title.

## 1. Hierarchy and layout [`hierarchy`]

**1.1 One primary action per view, and it is the most prominent thing that can be pressed.** Secondary actions use lower emphasis (outlined, text, or in a menu).
Check: blur or squint at the screenshot. The first two or three things you notice are the most important ones for the task. Two filled primary buttons side by side is a Major.

**1.2 Order by importance in reading order.** People scan top to bottom and from the leading edge (left in LTR, right in RTL). Key content and actions go near the top and leading side; the layout mirrors in RTL.

**1.3 Few alignment lines.** Related items share an edge; indentation means "belongs to the item above". Every extra left edge is a thing to explain.
Check: draw vertical lines through the left edges of text and controls. More than three or four distinct lines in one column of content is usually noise.

**1.4 Group by proximity first, containers second, dividers last.** Space inside a group is smaller than space between groups. A card or a line is only needed when space alone cannot show the grouping.
Check: if two unrelated items are closer to each other than to their own labels or siblings, the grouping is wrong.

**1.5 Progressive disclosure.** Show what most people need for the task; put the rest behind a menu, an expandable section or a detail screen. Do not remove functionality to save space; move it.

**1.6 Readable line length.** Body text runs about 45 to 75 characters per line. On wide windows, cap the text column instead of stretching it.

## 2. Spacing [`spacing`]

**2.1 Every spacing value comes from a scale with a base unit of 4** (4, 8, 12, 16, 24, 32, 48, 64...). Values come from the project's tokens.
Check: in code, grep for raw numbers in margin, padding, gap and top/left. In screenshots, look for gaps that differ by 1 to 3 px between items that should match.

**2.2 Internal spacing is no larger than external spacing.** Padding inside a component is smaller than or equal to the gap that separates it from its neighbours.

**2.3 Same component, same padding.** Two buttons, cards or list rows of the same type have the same internal spacing everywhere in the product.

**2.4 Space between targets matters as much as their size** (numbers in each platform file).

**2.5 Vertical rhythm.** Line heights and vertical gaps come from the same scale, so baselines across columns line up.

## 3. Typography [`typography`]

**3.1 A short type scale.** About 5 to 7 sizes with a consistent ratio, one or two families, two or three weights. Each size has a role (display, title, body, label, caption) and the roles are used consistently.

**3.2 Body text at the platform default, never below the platform minimum** (numbers in each platform file).

**3.3 Line height.** Body 1.4 to 1.6; headings tighter (1.1 to 1.3). Layouts must survive line height 1.5, paragraph spacing 2x the font size, letter spacing 0.12em and word spacing 0.16em without losing content (WCAG 1.4.12).

**3.4 Thin weights only at large sizes.** A light or thin weight under about 20 px reads as low contrast even when the colour passes.

**3.5 Text scales with the user's setting**, to at least 200% without loss of content or function (WCAG 1.4.4). Use the platform's scalable unit (Dynamic Type styles, `sp`, `rem`).
Check: set the largest text size. Text is not clipped, does not overlap, and rows grow instead of truncating essential information.

**3.6 Typesetting details.** Numbers that are compared (tables, prices, timers) use tabular figures. All caps only for short labels, with added tracking. Do not truncate information people need to choose (names, amounts); wrap instead. No widows in headings when the platform allows balancing.

## 4. Colour and contrast [`color`]

**4.1 Contrast minimums (WCAG 2.2 AA).**

| What | Minimum ratio | Criterion |
| --- | --- | --- |
| Body text and images of text | 4.5:1 | 1.4.3 |
| Large text: at least 24 px (18 pt) regular, or 18.66 px (14 pt) bold | 3:1 | 1.4.3 |
| UI component boundaries and states (input borders, toggles, icons that carry meaning, focus rings) | 3:1 against adjacent colours | 1.4.11 |
| Focus indicator, change between focused and unfocused | 3:1 (AAA 2.4.13, adopt it anyway) | 2.4.13 |
| Disabled controls, pure decoration, logos | exempt | |

Check both light and dark appearances. `node <skill>/scripts/ui-contrast.mjs` computes the ratio.

**4.2 Contrast passes or fails on WCAG 2 only.** APCA and other draft methods are not standards; colours chosen with them must also pass WCAG 2.

**4.3 Colour is never the only signal** (WCAG 1.4.1). Errors carry text and an icon; links in body text are underlined or otherwise distinct by more than hue; chart series differ by shape, pattern or direct labels. Red/green and blue/orange are the pairs people most often confuse.

**4.4 Semantic colour tokens, not raw values.** Name colours by role (surface, on-surface, primary, on-primary, outline, error, success, warning) so light, dark and high-contrast themes are one mapping each.

**4.5 A restrained palette.** Neutrals for most of the surface, one brand accent for primary actions and selection, and semantic colours reserved for status. If everything is coloured, nothing stands out.

**4.6 Dark mode is a designed theme, not an inversion.** Use dark greys and tonal elevation rather than pure black with pure white text everywhere; desaturate accents that vibrate on dark; re-verify every contrast pair.

**4.7 Text over images or video always has a scrim, overlay or solid backing** that keeps it at 4.5:1 on the lightest part of the image.

**4.8 Honour the user's contrast settings:** Increase Contrast (Apple), high-contrast text (Android), `prefers-contrast` and `forced-colors` (web).

## 5. Navigation and information architecture [`navigation`]

**5.1 Three questions answered on every screen: where am I, where can I go, how do I go back.** The current section is marked in the navigation; the screen has a title that matches the label that led to it.

**5.2 Top-level destinations are few and always visible.** On phones, 3 to 5 in a bottom bar; more goes to a "More" screen or a different structure. Hiding primary destinations behind a hamburger when there is room for them costs discovery.

**5.3 Labels use the user's words, and icons get text labels** unless the icon is universal (search, close, share, back).

**5.4 Back is predictable and keeps state.** Returning restores scroll position, filters, form input and selection. Back never discards work without warning.

**5.5 Every meaningful state is addressable.** URLs on the web, deep links on mobile: a filtered list, a tab, an item can be shared and restored.

**5.6 Same function, any size.** Changing window size changes how much is visible (tab bar to sidebar, overflow menu to inline actions), never what the product can do.

**5.7 Modals interrupt; use them only for a focused, short task or a decision that must happen now.** A modal has an obvious way out (close, Cancel, Escape, back gesture) and does not stack on another modal.

**5.8 Search when the set is large.** If people look for a known item among dozens or more, give search, and keep the query visible on the results.

## 6. Interaction, states and feedback [`states`]

**6.1 Every interactive element has all its states designed:** default, hover (pointer platforms), focus, pressed, selected or checked, disabled, loading, and error where it applies.
Check: in code, look for the component's style for each state. In an audit, tab through and press each control type once.

**6.2 Every data view has all five content states:** loading, empty, error, partial (some data, some failed or still loading) and ideal. Plus offline when the product works on mobile networks.
- Loading: skeleton in the shape of the content for lists and pages; spinner only for short, unknown-shape waits.
- Empty: says why it is empty and offers the next action ("No invoices yet. Create your first invoice").
- Error: what happened, in plain words; what the person can do; a retry. No raw codes or stack traces.

**6.3 Response times.** Visible response within 0.1 s; over about 1 s show progress; over about 10 s show determinate progress and allow cancelling or leaving (Nielsen's response-time limits).

**6.4 Interactive things look interactive; static things do not.** No underlined text that is not a link, no card that looks tappable but is not, no hidden controls without a hint.

**6.5 Targets meet the platform minimum** (web 6.1, mobile sections 2 and 3). A small icon can keep its drawn size if its hit area is enlarged.

**6.6 Destructive actions: prefer undo to confirmation.** Confirm only what cannot be undone, and name the action in the confirm button ("Delete 3 files", not "OK"). Put destructive actions apart from the primary action and style them as destructive.

**6.7 Optimistic updates only when failure is rare and reversible**, and a failure is reported where the person will see it.

**6.8 Nothing important disappears on a timer.** Toasts with actions stay long enough or until dismissed; time limits can be extended (WCAG 2.2.1).

## 7. Forms and input [`forms`]

**7.1 Every field has a visible label.** A placeholder is not a label: it disappears on typing and usually fails contrast.

**7.2 One column, in the order people think about the data.** Related fields are grouped with a heading (fieldset and legend on the web).

**7.3 Right input for the data:** keyboard type, autofill and autocomplete hints, pickers for dates, steppers or sliders only for small ranges. Never block paste.

**7.4 Validate when the person leaves a field or submits, not on every keystroke.** The error sits next to the field, in text with an icon, and says how to fix it. On submit with errors, move focus to the first one; long forms also get a summary at the top.

**7.5 Never lose input.** Errors, rotation, backgrounding or a failed request keep what was typed.

**7.6 Do not ask twice** for information already given in the same flow (WCAG 3.3.7). Authentication does not require memorising or transcribing; allow password managers and paste (WCAG 3.3.8).

**7.7 Required versus optional is marked one consistent way**, and if most fields are required, mark the optional ones.

**7.8 The submit button says what happens** ("Create account", "Pay $40"), stays visible or reachable when the keyboard is open, and shows a loading state that prevents double submission.

## 8. Content and copy [`content`]

**8.1 One name per concept, taken from the project's glossary.**

**8.2 Plain language, front-loaded.** The first words of a heading, label or button carry the meaning.

**8.3 Buttons are verb plus object** ("Save draft"), links say where they go, not "click here".

**8.4 Error messages: what happened, why if it helps, and what to do.** No blame, no jargon.

**8.5 One capitalisation style** (usually sentence case) across the product.

**8.6 Dates, numbers, currencies and units follow the person's locale.**

## 9. Motion [`motion`]

**9.1 Motion explains something:** where an element came from, what changed, that an action registered. Decoration that delays the task goes.

**9.2 Durations are short.** Small changes about 100 to 200 ms; larger transitions about 200 to 400 ms. Elements entering ease out; elements leaving ease in or simply fade.

**9.3 Reduce Motion is honoured.** When the setting is on, replace movement, zoom, parallax and depth changes with fades or instant changes.

**9.4 Nothing flashes more than three times per second** (WCAG 2.3.1). Content that moves or updates on its own for more than 5 s can be paused (WCAG 2.2.2). Audio and video do not autoplay with sound.

## 10. Accessibility beyond contrast [`accessibility`]

**10.1 Every control exposes a name, a role and its state** to assistive technology. Icon-only buttons have a label; images that carry meaning have a description; decorative images are hidden.

**10.2 Focus order follows the visual order, focus is always visible and never hidden** behind sticky headers, bars or sheets (WCAG 2.4.7, 2.4.11).

**10.3 Every gesture has a simple alternative.** Drag, swipe, pinch and multi-finger gestures have an on-screen control that does the same (WCAG 2.5.7; Apple's "offer alternatives to gestures").

**10.5 Orientation is not locked** unless essential (WCAG 1.3.4).

**10.6 Captions or transcripts for audio and video; visual and haptic cues accompany audio cues.**

## 11. Perceived performance and stability [`performance`]

**11.1 Content does not jump.** Reserve space for images, ads, banners and late-loading content.

**11.2 Show structure immediately** (skeletons, cached data) and fill it in, instead of a blank screen.

## 12. Internationalisation [`i18n`]

**12.1 Leave room for longer text.** Translations often run 30 to 40% longer than English, more for short labels. No fixed-width containers around text.

**12.2 RTL layouts mirror** layout and directional icons (back arrows, progress), but not media controls, clocks or logos.

**12.3 No concatenated strings**; full sentences with placeholders so grammar and order can change.

## 13. Consistency [`consistency`]

**13.1 Platform conventions beat invention.** People spend most of their time in other apps (Jakob's law); a custom control must be clearly better to justify relearning.

**13.2 Same pattern, same behaviour.** Two lists, two dialogs or two forms in the product work the same way.

**13.3 Components come from the design system**; a one-off is either promoted to the system or replaced.

## 14. Final pass

Sweep with Nielsen's ten heuristics for anything the sections above missed.
