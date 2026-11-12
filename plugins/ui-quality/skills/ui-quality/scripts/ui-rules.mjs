// The thresholds the UI scan, the scorer and the code scan judge by, in one place.
// What each one means for the loop: ../references/loop.md.

// Spacing sits on a 4 px grid. Values up to 2 px are hairlines and borders, not spacing,
// and computed values are rounded to whole pixels first (1rem at 15.6px is 16).
export const GRID_PX = 4;
export const HAIRLINE_PX = 2;

export function isOffGrid(px) {
  const size = Math.abs(px);
  return size > HAIRLINE_PX && Math.round(size) % GRID_PX !== 0;
}

// Text below this size is too small to read.
export const MIN_TEXT_PX = 12;

// WCAG 2.5.8: a target under 24x24 passes only if a 24 px circle centred on it clears the
// other targets, so its centre stays half that away from any other target.
export const MIN_TARGET_PX = 24;
export const TARGET_RADIUS_PX = MIN_TARGET_PX / 2;

// Consistency: each style keeps full marks up to `allowed` distinct values, then loses
// `perExtra` points for each value more. `stat` is the scan's styleStats key it counts.
export const CONSISTENCY_BUDGETS = {
  fontSizes: { stat: 'fontSize', allowed: 8, perExtra: 8 },
  fontFamilies: { stat: 'fontFamily', allowed: 2, perExtra: 25 },
  fontWeights: { stat: 'fontWeight', allowed: 3, perExtra: 15 },
  textColors: { stat: 'textColor', allowed: 8, perExtra: 6 },
  backgrounds: { stat: 'background', allowed: 8, perExtra: 5 },
  radii: { stat: 'radius', allowed: 4, perExtra: 10 },
};

// Two colours closer than this in RGB are one token meant twice; each pair costs points.
export const NEAR_DUPLICATE_DISTANCE = 12;
export const NEAR_DUPLICATE_PENALTY = 5;

// Spacing loses 2 points per 1% of values off the grid.
export const OFF_GRID_PENALTY_PER_PERCENT = 2;

// Points the semantics score loses for each page-level failure.
export const SEMANTICS_PENALTIES = {
  noLang: 25,
  zoomBlocked: 25,
  unnamedControls: 25,
  unlabelledFields: 25,
  imagesWithoutAlt: 25,
  noTitle: 10,
  notOneH1: 5,
  skippedHeadings: 5,
};

// A category starts at 10 and loses these points per open finding.
export const MAX_CATEGORY_SCORE = 10;
export const FINDING_PENALTIES = { Blocker: 4, Major: 2, Minor: 0.5 };

// The most a category can score while it has an open finding of this severity.
export const SEVERITY_CAPS = { Blocker: 3, Major: 7 };
