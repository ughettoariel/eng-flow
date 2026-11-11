# UI

## Visual values come from the design system

Spacing, colour, type, sizes and radii come from named tokens. When no token fits, use the nearest one if the difference is negligible; otherwise raise it with design and add a token. Do not swap one valid token for another without a design reason.

**Why:** a theme change becomes one edit, the product stays consistent without policing pixels, and token churn hides real changes in review.

## One vocabulary on screen

Each concept has one name in the interface, taken from the glossary, and copy lives apart from logic.

**Why:** two names for one thing make users think there are two things.

## Each layout concern has one owner

Insets from system bars, keyboards or notches are applied by exactly one ancestor. A screen inside a layout that applies them adds nothing; a screen mounted outside one applies them itself.

**Why:** a missing inset hides controls; a doubled one leaves dead space. Both ship unnoticed unless one component clearly owns the concern.

## Screens decide nothing

A screen shows data and collects input. A rule that decides something goes to the domain first, with its test.

**Why:** rules hidden in components cannot be reused by the server and are tested only by clicking.
