# Mobile rules (phones)

Adds to `universal.md` for phone layouts, native or cross-platform. Section 1 applies to both platforms; sections 2 and 3 are platform specific. For tablets and foldables, also read `tablet.md`. A web page viewed on a phone follows `web.md` plus section 1 here.

## 1. Both platforms

**1.1 Primary actions within thumb reach.** The bottom half of the screen is easiest to reach one-handed; top corners are hardest. Put frequent actions low (bottom bar, bottom-anchored button, sheet) and keep destructive actions away from the primary one.

**1.2 Edge to edge, with controls inside the safe area.** Backgrounds and scrolling content may run behind the status bar, home indicator, notch, Dynamic Island and navigation bar; text and controls never sit under them. Exactly one ancestor applies each inset.
Check: screenshot on a device with a notch or island and with gesture and three-button navigation. A control under a system bar is a Blocker; a doubled inset is a Minor.

**1.3 The keyboard never covers the field being edited or the submit button.** Content scrolls or resizes; the return key matches the step ("Next", "Search", "Done", "Send"); tapping outside or scrolling dismisses it where expected.

**1.4 Do not fight system gestures.** Screen-edge swipes, back, home and notification gestures belong to the system. Custom swipes on rows or cards also have a visible alternative (a button or menu).

**1.5 Test at the largest text size.** iOS: the accessibility sizes up to AX5 (Larger Accessibility Sizes). Android: font scale 200% (Android 14 and later scale nonlinearly to 200%). Horizontal arrangements stack vertically, rows grow, nothing clips.

**1.6 Rotation and interruption keep state.** Rotating, backgrounding, a phone call or the system killing the process does not lose input, scroll position or the current step.

**1.7 Slow and missing networks are normal.** Show cached content, queue actions where safe, and explain offline state without blocking what still works.

**1.8 Permissions in context.** Ask when the feature is used, explain the benefit first, and keep the feature usable (degraded) when the person says no.

**1.9 Follow each platform's conventions.** Do not ship iOS patterns on Android or the reverse: back behaviour, navigation placement, sheets, date pickers, switches and typography differ. Cross-platform frameworks should use adaptive components or platform-specific variants for these.

**1.10 Haptics confirm, never inform alone.** Pair them with a visual change, and use the system's semantic haptics (success, warning, selection).

**1.11 Smooth scrolling.** Lists are virtualised; images are decoded at display size; nothing heavy runs on the main thread during scroll.

## 2. iOS (Apple Human Interface Guidelines)

**Sizes**

| Item | Value |
| --- | --- |
| Hit target | 44 x 44 pt default, 28 x 28 pt minimum |
| Body text | 17 pt default (Dynamic Type "Body" at the Large setting), 11 pt minimum |
| Padding around controls | about 12 pt with a bezel, about 24 pt without |
| Contrast (Accessibility Inspector) | 4.5:1 up to 17 pt; 3:1 at 18 pt and above or bold |
| Images | @2x and @3x assets, or vectors / SF Symbols |

**2.1 Use Dynamic Type text styles** (Large Title, Title 1-3, Headline, Body, Callout, Subheadline, Footnote, Caption 1-2) rather than fixed sizes, including for custom fonts (scale them with the text style). Avoid thin weights at small sizes.

**2.2 Prefer system colours and materials.** They adapt to light, dark, Increase Contrast and Reduce Transparency. A custom colour needs a variant for each of those.

**2.3 Navigation structure.** A tab bar for top-level sections (from iOS 26, search can be a dedicated tab at the trailing end); a navigation stack inside each tab, with a back button that shows the previous title and the edge-swipe back gesture; sheets for focused or parallel tasks, with clear Cancel and Done. The tab bar holds destinations, never screen-specific actions such as "Checkout".

**2.4 Liquid Glass (iOS 26 and later).** Controls and navigation live in a floating glass layer above the content:
- Do not put glass on content, and do not put controls directly on content without a system material under them.
- Remove custom backgrounds and borders from bars and bar buttons; the system provides emphasis.
- Group bar items by function; keep text buttons in their own group, apart from symbols; move overflow to a menu.
- Tint and separate the primary action (for example, Done).
- Use scroll edge effects instead of hard dividers where content scrolls under floating bars; one effect per view.
- Nested shapes are concentric: the inner radius is the outer radius minus the padding.
- Check legibility with glass at its clearest and most tinted user settings, and with Reduce Transparency and Increase Contrast.

**2.5 Respect the safe area and the Dynamic Island**; full-bleed background content extends under the bars.

**2.6 Layout by size class, not by device.** iPhone in landscape is compact height; larger iPhones in landscape are regular width. iPhone apps also run resized on the Mac through iPhone Mirroring.

**2.7 Reduce Motion:** tighten springs, follow gestures directly, avoid animating depth and blur, replace slides and zooms with fades.

**2.8 VoiceOver and Voice Control:** every element has a concise label, the right traits (button, header, selected), sensible grouping, and actions for custom swipe gestures. Labels match the visible text so Voice Control commands work. Check also Full Keyboard Access with a hardware keyboard.

**2.9 Destructive and confirm patterns:** action sheets or menus spring from their source; destructive buttons use the destructive role; alerts are for decisions, not for information that could be inline.

## 3. Android (Material Design 3)

**Sizes**

| Item | Value |
| --- | --- |
| Touch target | 48 x 48 dp minimum (Compose pads Material components; use `minimumInteractiveComponentSize()` for custom ones) |
| Body text | 16 sp (bodyLarge) or 14 sp (bodyMedium); 12 sp bodySmall; 11 sp labelSmall is the smallest style |
| Grid | 4 dp base unit; 16 dp screen margins on compact widths |
| Units | `sp` for text, `dp` for everything else |

**3.1 Edge to edge is mandatory** (no opt-out when targeting API 36 or later). Handle `WindowInsets` (system bars, display cutout, IME) in one place.

**3.2 Predictive back.** Targeting API 36, predictive back animations are on by default, `onBackPressed` is not called and `KEYCODE_BACK` is not dispatched. Use `OnBackPressedCallback` or Compose `BackHandler`/`PredictiveBackHandler`, and intercept back only to close something in the current screen (a sheet, a search, unsaved-changes prompt).

**3.3 Navigation by window size.** Navigation bar with 3 to 5 destinations on compact widths; navigation rail on medium and wider; optional drawer on expanded and wider. `NavigationSuiteScaffold` switches automatically (bar when width or height is compact, rail otherwise).

**3.4 Top app bar for title and screen actions; a FAB only for the single most important constructive action** of the screen, not for navigation or destructive actions.

**3.5 Dynamic colour.** With Material You colours from the wallpaper, brand colours may not appear; verify that roles (primary, on-primary, surface containers) keep contrast with any generated scheme, or opt out deliberately.

**3.6 Material 3 Expressive** adds springier motion, more shapes and emphasised type. Use it within the same rules: motion honours "Remove animations", shape changes still show state clearly, emphasis stays on one thing per screen.

**3.7 TalkBack:** `contentDescription` on meaningful images and icon buttons, `null` on decorative ones; merge semantics for rows that act as one item; `onClickLabel` for actions whose default "Double tap to activate" is vague; headings marked with `semantics { heading() }`.

**3.8 Dark theme and high-contrast text** both verified; surfaces use tonal surface-container roles rather than custom greys.

**3.9 System bars:** status and navigation bar icons switch light/dark to keep contrast with the content behind them.
