# Tablet, foldable and large-window rules

Adds to `universal.md` and `mobile.md` for iPad, Android tablets, foldables, Chromebooks, desktop windowing and any window wider than a phone. The core idea: a tablet is not a stretched phone, and the window, not the device, decides the layout.

## 1. Decide by window size, not device

**1.1 Use size classes.** Apple and Android both say not to branch on device type or orientation: a tablet app can run in a phone-sized window, and a phone app can run resized on a desktop.

| Android width class | Width | Typical layout |
| --- | --- | --- |
| Compact | < 600 dp | One pane, navigation bar |
| Medium | 600 to 839 dp | One pane, or list-detail with a narrow list; navigation rail |
| Expanded | 840 to 1199 dp | Two panes; rail or drawer |
| Large | 1200 to 1599 dp | Two or three panes |
| Extra-large | >= 1600 dp | Three panes or wide content with side panels |

Height classes: compact < 480 dp, medium 480 to 899 dp, expanded >= 900 dp. A phone in landscape is compact height, so tall sheets and fixed headers must shrink there.

On iOS and iPadOS there are two classes per axis, compact and regular. A full-screen iPad is regular in both; a narrow iPad window behaves like an iPhone (compact width). On the web, the same thresholds work as breakpoints, with container queries for components.

**1.2 Every window size works.** iPadOS windows resize freely, and Android ignores orientation, resizability and aspect-ratio restrictions on displays of 600 dp smallest width or more (games excepted). No letterboxing, no stretched phone layout, no "rotate your device".
Check: resize from the narrowest to the widest window and through split screen. Nothing stretches past a readable width, overlaps or goes off screen.

## 2. Use the space

**2.1 Multi-pane canonical layouts.** List-detail (mail, settings, files), supporting pane (main content with a related panel), feed (grid of cards that adds columns). When a second pane appears, the selection in the first pane stays visible and highlighted.

**2.2 Navigation moves to the side.** iPad: the tab bar can become a sidebar in regular width. Android: navigation rail at medium, rail or permanent drawer at expanded and wider.

**2.3 Cap text width.** Long text keeps its 45 to 75 character measure; extra width goes to margins, panes or media, not to longer lines. Forms do not stretch input fields across 1200 px.

**2.4 Reveal more, never different.** Wider windows can show inline actions, more columns or a persistent inspector, but the same functions exist in the compact layout (in menus or detail screens).

**2.5 Grids adapt their column count** to the available width, keeping item size and spacing in a comfortable range, instead of scaling items up.

## 3. Many inputs at once

**3.1 Pointer.** Hover states on interactive elements, right-click or long-press context menus with the same actions, pointer-friendly scroll bars and resize handles. Pointer precision allows smaller controls in dense areas, but touch targets still apply because the same screen is also touched.

**3.2 Hardware keyboard.** Shortcuts for frequent actions, discoverable through the menu bar (iPadOS 26 and later) or the shortcuts helper (Android: Meta + /); Tab and arrow-key focus navigation; Return submits and Escape cancels; standard system shortcuts are not overridden.

**3.3 Stylus.** Where drawing or handwriting makes sense, support pressure and palm rejection; Scribble on iPad and handwriting input on Android work in text fields by default, so do not break them with custom fields.

**3.4 Drag and drop** between panes and between apps for content people move around (images, files, text), always with a non-drag alternative.

## 4. Multitasking and windows

**4.1 Several windows of the same app** are supported where it helps (documents, chats), each with its own state.

**4.2 State survives resizing, split screen, rotation and moving between displays.** Configuration changes recreate activities on Android; persist UI state.

**4.3 External displays and desktop modes** (Stage Manager, Android desktop windowing, Chromebooks): content scales to the window, not to the physical screen.

## 5. Foldables

**5.1 Continuity.** Folding and unfolding keeps the task, scroll position and input; the layout switches size class without restarting the flow.

**5.2 Avoid the hinge.** On devices with a visible fold or separating hinge, do not place text or controls across it; split panes at the fold.

**5.3 Tabletop posture** (half-open, horizontal fold): content on the top half, controls on the bottom; Android's default navigation switches to a bar in this posture.

## 6. Checks specific to large screens

- Portrait and landscape, full screen and split view (one-third, half, two-thirds).
- Narrowest window: behaves exactly like the phone layout.
- Widest window: no line of text longer than about 75 characters, no single input wider than its content needs, no empty canvas with content stuck in a corner.
- Keyboard only: every action reachable, focus visible.
- Mouse or trackpad: hover feedback and context menus everywhere a long press works.
