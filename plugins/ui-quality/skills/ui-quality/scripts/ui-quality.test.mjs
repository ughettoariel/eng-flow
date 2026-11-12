import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseColor, ratio, isLargeText, requiredRatio } from './ui-contrast.mjs';
import { targetFailures, contrastFailures, auditViolations } from './ui-scan.mjs';
import { autoScores, scorecard } from './ui-score.mjs';
import { isOffGrid } from './ui-rules.mjs';

const r = (a, b) => Math.round(ratio(parseColor(a), parseColor(b)) * 100) / 100;

test('contrast ratio matches WCAG reference values', () => {
  assert.equal(r('#000', '#fff'), 21);
  assert.equal(r('#fff', '#fff'), 1);
  assert.equal(r('#777777', '#ffffff'), 4.48);
  assert.equal(r('#767676', '#ffffff'), 4.54);
  assert.equal(r('#fff', '#000'), r('#000', '#fff'));
});

test('parses rgb(), rgba() and short hex with alpha', () => {
  assert.deepEqual(parseColor('rgb(10, 20, 30)'), [10, 20, 30, 1]);
  assert.deepEqual(parseColor('rgba(0 0 0 / 50%)'), [0, 0, 0, 0.5]);
  assert.deepEqual(parseColor('#0008').slice(0, 3), [0, 0, 0]);
});

test('translucent foreground is composited over the background', () => {
  assert.equal(
    r('rgba(0,0,0,0.5)', '#fff'),
    Math.round(ratio([127.5, 127.5, 127.5], [255, 255, 255]) * 100) / 100,
  );
});

test('large text thresholds', () => {
  assert.equal(isLargeText(24), true);
  assert.equal(isLargeText(18.66, 700), true);
  assert.equal(isLargeText(18.66, 400), false);
  assert.equal(requiredRatio(16, 400), 4.5);
  assert.equal(requiredRatio(24, 400), 3);
});

test('target size: spaced small targets pass, crowded ones fail', () => {
  const spaced = [
    { x: 0, y: 0, w: 16, h: 16 },
    { x: 40, y: 0, w: 16, h: 16 },
  ];
  assert.equal(targetFailures(spaced).length, 0);
  const crowded = [
    { x: 0, y: 0, w: 16, h: 16 },
    { x: 18, y: 0, w: 16, h: 16 },
  ];
  assert.equal(targetFailures(crowded).length, 2);
  const nextToBig = [
    { x: 0, y: 0, w: 16, h: 16 },
    { x: 17, y: 0, w: 100, h: 44 },
  ];
  assert.equal(targetFailures(nextToBig).length, 1);
  assert.equal(
    targetFailures([
      { x: 0, y: 0, w: 10, h: 10, inline: true },
      { x: 11, y: 0, w: 10, h: 10, inline: true },
    ]).length,
    0,
  );
});

test('contrast failures skip disabled text and use large-text threshold', () => {
  const grey = [119, 119, 119, 1];
  const items = [
    { fg: grey, bg: [255, 255, 255], px: 16, weight: 400 },
    { fg: grey, bg: [255, 255, 255], px: 24, weight: 400 },
    { fg: grey, bg: [255, 255, 255], px: 16, weight: 400, disabled: true },
  ];
  const f = contrastFailures(items);
  assert.equal(f.length, 1);
  assert.equal(f[0].px, 16);
});

import {
  countScore,
  nearDuplicates,
  consistencyScores,
  categoryScores,
  evaluateGates,
  isStalled,
  accessibilityScores,
  validateFindings,
} from './ui-score.mjs';

test('count score: full marks up to the target, then a step per extra value', () => {
  assert.equal(countScore(8, 8, 8), 100);
  assert.equal(countScore(10, 8, 8), 84);
  assert.equal(countScore(30, 8, 8), 0);
});

test('near-duplicate colours are detected, identical and distant ones are not', () => {
  assert.deepEqual(nearDuplicates(['#333333', '#343434', '#ffffff']), [['#333333', '#343434']]);
  assert.equal(nearDuplicates(['#000000', '#ffffff']).length, 0);
});

test('consistency: off-grid spacing and extra families lower the score', () => {
  const clean = consistencyScores({
    fontSize: { '16px': 9 },
    fontFamily: { Inter: 9 },
    spacing: { 8: 10, 16: 10 },
  });
  assert.equal(clean.overall, 100);
  const messy = consistencyScores({ fontFamily: { A: 1, B: 1, C: 1, D: 1 }, spacing: { 7: 10, 16: 10 } });
  assert.equal(messy.metrics.fontFamilies, 50);
  assert.equal(messy.metrics.spacingGrid, 0);
});

test('category score: capped by open Blockers and Majors, fixed findings ignored', () => {
  const s = categoryScores({
    reviewed: ['color', 'spacing', 'forms'],
    notApplicable: ['motion'],
    findings: [
      { category: 'color', severity: 'Blocker' },
      { category: 'spacing', severity: 'Minor' },
      { category: 'spacing', severity: 'Major', status: 'fixed' },
      { category: 'forms', severity: 'Major' },
    ],
  });
  assert.equal(s.color.score, 3);
  assert.equal(s.spacing.score, 9.5);
  assert.equal(s.forms.score, 7);
  assert.equal(s.motion.status, 'n/a');
  assert.equal(s.hierarchy.status, 'not reviewed');
});

test('gate fails on unreviewed categories and open Majors, passes when clean', () => {
  const all = [
    'hierarchy',
    'spacing',
    'typography',
    'color',
    'navigation',
    'states',
    'forms',
    'content',
    'motion',
    'accessibility',
    'performance',
    'i18n',
    'consistency',
  ];
  const partial = { reviewed: ['color'], findings: [] };
  assert.equal(evaluateGates(null, categoryScores(partial), partial).pass, false);
  const major = { reviewed: all, findings: [{ category: 'forms', severity: 'Major' }] };
  assert.equal(evaluateGates(null, categoryScores(major), major).pass, false);
  const clean = { reviewed: all, findings: [{ category: 'forms', severity: 'Minor' }] };
  assert.equal(evaluateGates(null, categoryScores(clean), clean).pass, true);
});

test('stalled after two rounds without improvement', () => {
  assert.equal(isStalled([{ overall: 80 }, { overall: 85 }]), false);
  assert.equal(isStalled([{ overall: 80 }, { overall: 85 }, { overall: 90 }]), false);
  assert.equal(isStalled([{ overall: 85 }, { overall: 84 }, { overall: 85 }]), true);
});

test('automated accessibility rates from a scan result', () => {
  const a = accessibilityScores({
    textChecked: 10,
    textFailing: 1,
    targetsChecked: 4,
    targets: [{}],
    focusChecked: 5,
    focusNoIndicator: [{ key: '1' }],
    focusCovered: [{ key: '1' }],
    horizontalOverflow: 0,
    lang: 'en',
    title: 't',
    h1Count: 1,
  });
  assert.deepEqual(a, { contrast: 90, targets: 75, focus: 80, reflow: 100, semantics: 100 });
});

test('findings with unknown categories, severities or statuses are rejected', () => {
  assert.deepEqual(
    validateFindings({ reviewed: ['color'], findings: [{ id: 'A', category: 'color', severity: 'Major' }] }),
    [],
  );
  const errors = validateFindings({
    reviewed: ['Colour'],
    findings: [
      { id: 'B', category: 'Contrast', severity: 'Major' },
      { id: 'C', category: 'color', severity: 'major' },
      { id: 'D', category: 'color', severity: 'Minor', status: 'done' },
    ],
  });
  assert.equal(errors.length, 4);
  assert.match(errors.join(' '), /B: category "Contrast"/);
  assert.match(errors.join(' '), /C: severity "major"/);
});

import { scanText, isTokenFile } from './ui-code.mjs';

test('code scan flags literals, off-grid spacing, raw font sizes, outline none and clickable divs', () => {
  const css = '.a { color: #333; padding: 7px 8px; font-size: 14px; outline: none; margin: 16px; }';
  const rules = scanText(css)
    .map((h) => h.rule)
    .toSorted();
  assert.deepEqual(rules, ['colour-literal', 'off-grid', 'outline-none', 'raw-font-size']);
  assert.equal(
    scanText('.a { outline: none } .a:focus-visible { outline: 2px solid }').some(
      (h) => h.rule === 'outline-none',
    ),
    false,
  );
  assert.deepEqual(
    scanText('<div onClick={go}>x</div>').map((h) => h.rule),
    ['click-div'],
  );
  assert.deepEqual(scanText('<div role="button" onClick={go}>x</div>'), []);
  assert.deepEqual(scanText('.a { margin: 0 auto; padding: 1px; gap: 24px }'), []);
  assert.deepEqual(scanText(':root {\n  --brand: #ff0000;\n}'), []);
});

const scorerSays = (px) => consistencyScores({ spacing: { [px]: 1 } }).details.offGridSpacing.length > 0;
const codeScanSays = (px) => scanText(`.a { padding: ${px}px }`).some((h) => h.rule === 'off-grid');

test('the scorer and the code scan judge the 4 px grid the same way', () => {
  const offGrid = [3, 4.6, 6, 7, 10, 15.4, 18, -6];
  const onGrid = [0, 1, 2, 4, 4.4, 8, 15.6, 16, 24, -8];
  for (const px of [...offGrid, ...onGrid]) {
    const expected = offGrid.includes(px);
    assert.equal(isOffGrid(px), expected, `rule at ${px}px`);
    assert.equal(scorerSays(px), expected, `scorer at ${px}px`);
    assert.equal(codeScanSays(px), expected, `code scan at ${px}px`);
  }
});

test('the scorecard lists spacing off the grid after a colon and a space', () => {
  const auto = autoScores([
    {
      results: [
        {
          width: 390,
          textChecked: 0,
          focusChecked: 0,
          lang: 'en',
          title: 't',
          h1Count: 1,
          styleStats: { spacing: { 12: 1, 7: 3 } },
        },
      ],
    },
  ]);
  const categories = categoryScores({ reviewed: [], findings: [] });
  const current = {
    date: 'today',
    auto,
    categories,
    open: { Blocker: 0, Major: 0, Minor: 0 },
    overall: 50,
    gate: { pass: false, checks: [] },
  };
  assert.match(scorecard([current], current), /^- Spacing off the 4px grid: 7px x3$/m);
});

const PAGE_WITH_EVERY_PROBLEM = {
  text: [
    {
      selector: 'p.grey',
      sample: 'hint',
      fg: [170, 170, 170, 1],
      bg: [255, 255, 255],
      px: 16,
      weight: 400,
    },
    {
      selector: 'p.hero',
      sample: 'over photo',
      fg: [170, 170, 170, 1],
      bg: [255, 255, 255],
      px: 16,
      weight: 400,
      uncertain: true,
    },
    { selector: 'small', sample: 'fine print', fg: [0, 0, 0, 1], bg: [255, 255, 255], px: 10, weight: 400 },
  ],
  targets: [
    { selector: 'a.x', x: 0, y: 0, w: 16, h: 16 },
    { selector: 'a.y', x: 18, y: 0, w: 16, h: 16 },
  ],
  horizontalOverflow: 40,
  unnamedControls: ['button.icon'],
  unlabelledFields: [{ selector: 'input.q' }],
  imagesWithoutAlt: ['img.logo'],
  zoomBlocked: true,
  viewport: 'user-scalable=no',
};

const EMPTY_PAGE = {
  text: [],
  targets: [],
  horizontalOverflow: 0,
  unnamedControls: [],
  unlabelledFields: [],
  imagesWithoutAlt: [],
  zoomBlocked: false,
};

test('the page audit reads its findings rule by rule', () => {
  assert.deepEqual(
    auditViolations(PAGE_WITH_EVERY_PROBLEM, 320).map((v) => `${v.rule} ${v.selector} ${v.detail}`),
    [
      'contrast p.grey 2.32:1, needs 4.5:1 (hint)',
      'text-size small 10px',
      'target-size a.x 16x16',
      'target-size a.y 16x16',
      'reflow html 40px wider than 320',
      'name button.icon button or link with no accessible name',
      'label input.q form field without a label',
      'alt img.logo image without alt',
      'zoom meta[name=viewport] user-scalable=no',
    ],
  );
  assert.deepEqual(auditViolations(EMPTY_PAGE, 1280), []);
});

test('token files may hold colour literals', () => {
  assert.equal(isTokenFile('src/styles/tokens.css'), true);
  assert.equal(isTokenFile('src/theme.ts'), true);
  assert.equal(isTokenFile('src/Button.css'), false);
  assert.equal(isTokenFile('design/palette.css', ['palette']), true);
});
