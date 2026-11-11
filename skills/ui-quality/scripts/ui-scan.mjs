#!/usr/bin/env node
// Automated first pass of a web UI audit. It finds candidates; a person
// confirms them. See ../SKILL.md (Audit) for how it fits the audit.
//
// Usage: ui-scan.mjs <url> [--widths 320,390,768,1280] [--out ./ui-audit]
//                    [--dark] [--max-tabs 60]
// Needs Playwright (resolved from this folder or from the current project).
// Writes <out>/scan.md, <out>/scan.json and a full-page screenshot per width.
// Exit codes: 0 scanned, 1 the scan failed, 2 usage error.

import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parseArgs, runIfMain } from './cli.mjs';
import { ratio, requiredRatio } from './ui-contrast.mjs';
import { MIN_TARGET_PX, MIN_TEXT_PX, TARGET_RADIUS_PX } from './ui-rules.mjs';

export const USAGE = `Usage: ui-scan.mjs <url> [--widths 320,390,768,1280] [--out ./ui-audit]
                   [--dark] [--max-tabs 60]
Exit codes: 0 scanned, 1 the scan failed, 2 usage error.`;

// How much of the page the in-page collector reads.
const PAGE_LIMITS = {
  maxTextElements: 3000,
  // Spacing above this is layout, not a spacing token.
  maxSpacingPx: 160,
  // Equal horizontal margins above this are auto-centering, not spacing.
  centeringMarginPx: 32,
  // Zoom below this maximum scale blocks zoom (WCAG 1.4.4 asks for 200%).
  minMaxScale: 2,
};

function readOptions(argv) {
  const { positional, options } = parseArgs(argv, { flags: ['dark'] });
  return {
    url: positional[0],
    widths:
      typeof options.widths === 'string' ? options.widths.split(',').map(Number) : [320, 390, 768, 1280],
    out: typeof options.out === 'string' ? options.out : 'ui-audit',
    dark: Boolean(options.dark),
    maxTabs: options['max-tabs'] !== undefined ? Number(options['max-tabs']) : 60,
  };
}

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const req = createRequire(join(process.cwd(), 'package.json'));
    return req('playwright');
  }
}

// Runs inside the page, so it is self-contained: the page helpers first, then one
// function per rule it collects for, then the result.
function collect(limits) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const toRgba = (c) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const name = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) return `${s}#${el.id}`;
    const cls = [...el.classList].slice(0, 2).join('.');
    return cls ? `${s}.${cls}` : s;
  };
  const path = (el) => {
    const parts = [];
    for (let e = el, i = 0; e && e.nodeType === 1 && i < 4; e = e.parentElement, i++) {
      parts.unshift(name(e));
      if (e.id) break;
    }
    return parts.join(' > ');
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    for (let e = el; e; e = e.parentElement) if (parseFloat(getComputedStyle(e).opacity) === 0) return false;
    return true;
  };
  const background = (el) => {
    const layers = [];
    let uncertain = false;
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      const c = toRgba(cs.backgroundColor);
      if (cs.backgroundImage !== 'none' && c[3] < 1) uncertain = true;
      if (c[3] > 0) {
        layers.push(c);
        if (c[3] >= 1) break;
      }
    }
    let base = [255, 255, 255];
    for (const [r, g, b, a] of layers.toReversed())
      base = [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)];
    return { bg: base.map(Math.round), uncertain };
  };
  const skip = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'svg', 'SVG', 'OPTION']);

  // Contrast and text size: every visible element with its own text.
  function textSamples() {
    const text = [];
    for (const el of document.body.querySelectorAll('*')) {
      if (skip.has(el.tagName) || text.length >= limits.maxTextElements) continue;
      const own = [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join(' ')
        .trim();
      if (!own || !visible(el)) continue;
      const cs = getComputedStyle(el);
      const { bg, uncertain } = background(el);
      text.push({
        selector: path(el),
        sample: own.replace(/\s+/g, ' ').slice(0, 60),
        fg: toRgba(cs.color),
        bg,
        uncertain,
        px: parseFloat(cs.fontSize),
        weight: parseInt(cs.fontWeight, 10) || 400,
        disabled: !!el.closest('[disabled],[aria-disabled="true"]'),
      });
    }
    return text;
  }

  // Target size: the box of every visible interactive element.
  function targets() {
    const interactiveSel =
      'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=checkbox],[role=radio],[role=switch],[role=tab],[role=menuitem],[tabindex]:not([tabindex="-1"])';
    return [...document.querySelectorAll(interactiveSel)].filter(visible).map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const parentText = (el.parentElement?.textContent || '').replace(el.textContent || '', '').trim();
      return {
        selector: path(el),
        x: r.x + scrollX,
        y: r.y + scrollY,
        w: r.width,
        h: r.height,
        inline: el.tagName === 'A' && cs.display === 'inline' && parentText.length > 20,
      };
    });
  }

  // Name: buttons and links a screen reader cannot name.
  function unnamedControls() {
    const named = (el) => {
      if (el.getAttribute('aria-label')?.trim()) return true;
      const by = el.getAttribute('aria-labelledby');
      if (by && by.split(/\s+/).some((id) => document.getElementById(id)?.textContent.trim())) return true;
      if (el.getAttribute('title')?.trim()) return true;
      if ((el.textContent || '').trim()) return true;
      if (el.querySelector('img[alt]:not([alt=""]), svg[aria-label], [aria-label]')) return true;
      if (el.tagName === 'INPUT' && ['submit', 'button', 'reset'].includes(el.type) && el.value) return true;
      if (el.tagName === 'INPUT' && el.type === 'image' && el.alt) return true;
      return false;
    };
    return [...document.querySelectorAll('button,a[href],[role=button],[role=link]')]
      .filter((el) => visible(el) && !named(el))
      .map(path);
  }

  // Label: form fields with no label of any kind.
  function unlabelledFields() {
    return [
      ...document.querySelectorAll(
        'input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=image]),select,textarea',
      ),
    ]
      .filter(
        (el) =>
          visible(el) &&
          !(el.labels && el.labels.length) &&
          !el.getAttribute('aria-label') &&
          !el.getAttribute('aria-labelledby') &&
          !el.getAttribute('title'),
      )
      .map((el) => ({ selector: path(el), placeholderOnly: !!el.getAttribute('placeholder') }));
  }

  // Alt: images with no alt attribute.
  function imagesWithoutAlt() {
    return [...document.querySelectorAll('img:not([alt])')].filter(visible).map(path);
  }

  // Headings: the visible levels in order, for the h1 count and skipped levels.
  function headingLevels() {
    return [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .filter(visible)
      .map((h) => Number(h.tagName[1]));
  }

  function skippedHeadings(levels) {
    const skipped = [];
    levels.forEach((lvl, i) => {
      if (i > 0 && lvl > levels[i - 1] + 1) skipped.push(`h${levels[i - 1]} -> h${lvl}`);
    });
    return skipped;
  }

  // Consistency: how often each distinct style value appears.
  function styleStats() {
    const stats = {
      fontSize: {},
      fontFamily: {},
      fontWeight: {},
      textColor: {},
      background: {},
      radius: {},
      spacing: {},
    };
    const bump = (m, k) => {
      m[k] = (m[k] || 0) + 1;
    };
    const colorKey = (c) => {
      const [r, g, b, a] = toRgba(c);
      const h = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
      return a < 1 ? `${h}/${Math.round(a * 100)}` : h;
    };
    const spacingProps = [
      'marginTop',
      'marginBottom',
      'paddingTop',
      'paddingBottom',
      'paddingLeft',
      'paddingRight',
      'rowGap',
      'columnGap',
    ];
    for (const el of document.body.querySelectorAll('*')) {
      if (skip.has(el.tagName) || !visible(el)) continue;
      const cs = getComputedStyle(el);
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (own) {
        bump(stats.fontSize, cs.fontSize);
        bump(stats.fontFamily, cs.fontFamily.split(',')[0].trim().replace(/["']/g, ''));
        bump(stats.fontWeight, cs.fontWeight);
        bump(stats.textColor, colorKey(cs.color));
      }
      if (toRgba(cs.backgroundColor)[3] > 0) bump(stats.background, colorKey(cs.backgroundColor));
      if (parseFloat(cs.borderTopLeftRadius) > 0) bump(stats.radius, cs.borderTopLeftRadius);
      const props = [...spacingProps];
      if (!(cs.marginLeft === cs.marginRight && parseFloat(cs.marginLeft) > limits.centeringMarginPx))
        props.push('marginLeft', 'marginRight');
      for (const p of props) {
        const v = parseFloat(cs[p]);
        if (v > 0 && v <= limits.maxSpacingPx) bump(stats.spacing, String(Math.round(v * 100) / 100));
      }
    }
    return stats;
  }

  // Zoom: a viewport meta that disables or caps zooming.
  function zoomBlocked(viewport) {
    const maxScale = viewport.match(/maximum-scale\s*=\s*([\d.]+)/);
    return (
      /user-scalable\s*=\s*(no|0)/.test(viewport) ||
      Boolean(maxScale && parseFloat(maxScale[1]) < limits.minMaxScale)
    );
  }

  const levels = headingLevels();
  const viewport = document.querySelector('meta[name=viewport]')?.getAttribute('content') || '';
  return {
    text: textSamples(),
    targets: targets(),
    styleStats: styleStats(),
    unnamedControls: unnamedControls(),
    unlabelledFields: unlabelledFields(),
    imagesWithoutAlt: imagesWithoutAlt(),
    h1Count: levels.filter((l) => l === 1).length,
    skippedHeadings: skippedHeadings(levels),
    lang: document.documentElement.getAttribute('lang') || '',
    title: document.title,
    viewport,
    zoomBlocked: zoomBlocked(viewport),
    horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
  };
}

// Records unfocused styles of every focusable element (runs in the page).
function markFocusables() {
  const props = [
    'outlineStyle',
    'outlineWidth',
    'outlineColor',
    'boxShadow',
    'backgroundColor',
    'borderColor',
    'color',
    'textDecorationLine',
  ];
  const els = [
    ...document.querySelectorAll(
      'a[href],button,input:not([type=hidden]),select,textarea,summary,[tabindex]:not([tabindex="-1"])',
    ),
  ];
  window.uiQualityFocus = {
    props,
    styles: els.map((el, i) => {
      el.setAttribute('data-uiq', String(i));
      const cs = getComputedStyle(el);
      return Object.fromEntries(props.map((p) => [p, cs[p]]));
    }),
  };
}

function inspectFocus() {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const idx = el.getAttribute('data-uiq');
  const cs = getComputedStyle(el);
  const before = idx !== null ? window.uiQualityFocus.styles[Number(idx)] : null;
  const now = Object.fromEntries(window.uiQualityFocus.props.map((p) => [p, cs[p]]));
  const outline = now.outlineStyle !== 'none' && parseFloat(now.outlineWidth) > 0;
  const changed = before ? window.uiQualityFocus.props.some((p) => before[p] !== now[p]) : outline;
  const r = el.getBoundingClientRect();
  const cx = Math.min(Math.max(r.x + r.width / 2, 0), innerWidth - 1);
  const cy = Math.min(Math.max(r.y + r.height / 2, 0), innerHeight - 1);
  const top = document.elementFromPoint(cx, cy);
  const covered =
    top &&
    !el.contains(top) &&
    !top.contains(el) &&
    !(el.labels && [...el.labels].some((l) => l.contains(top)));
  let s = el.tagName.toLowerCase();
  if (el.id) s += `#${el.id}`;
  else if (el.classList.length) s += `.${[...el.classList].slice(0, 2).join('.')}`;
  return {
    key: idx ?? s,
    selector: s,
    text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40),
    visibleChange: changed,
    covered: !!covered,
    coveredBy: covered ? top.tagName.toLowerCase() + (top.id ? `#${top.id}` : '') : null,
  };
}

function rectDistance(cx, cy, t) {
  const dx = Math.max(t.x - cx, 0, cx - (t.x + t.w));
  const dy = Math.max(t.y - cy, 0, cy - (t.y + t.h));
  return Math.hypot(dx, dy);
}

// WCAG 2.5.8: undersized targets pass if a circle of the minimum target size on each does not
// intersect another target or another undersized target's circle.
export function targetFailures(targets) {
  const small = (t) => t.w < MIN_TARGET_PX || t.h < MIN_TARGET_PX;
  const centre = (t) => [t.x + t.w / 2, t.y + t.h / 2];
  const out = [];
  targets.forEach((a, i) => {
    if (!small(a) || a.inline) return;
    const [ax, ay] = centre(a);
    const clash = targets.some((b, j) => {
      if (i === j) return false;
      if (small(b) && !b.inline) {
        const [bx, by] = centre(b);
        return Math.hypot(ax - bx, ay - by) < MIN_TARGET_PX;
      }
      return rectDistance(ax, ay, b) < TARGET_RADIUS_PX;
    });
    if (clash) out.push(a);
  });
  return out;
}

export function contrastFailures(text) {
  return text
    .filter((t) => !t.disabled)
    .map((t) => {
      const r = ratio(t.fg, [...t.bg, 1]);
      return { ...t, ratio: Math.round(r * 100) / 100, need: requiredRatio(t.px, t.weight) };
    })
    .filter((t) => t.ratio < t.need);
}

export const smallText = (text) => text.filter((t) => t.px < MIN_TEXT_PX);

// The rules certain enough to fail a page with no person confirming them, each turning the
// collected page into its violations. Text over images, focus and anything that needs a
// person stay out of it.
const AUDIT_RULES = [
  {
    rule: 'contrast',
    find: (data) =>
      contrastFailures(data.text)
        .filter((t) => !t.uncertain)
        .map((c) => ({ selector: c.selector, detail: `${c.ratio}:1, needs ${c.need}:1 (${c.sample})` })),
  },
  {
    rule: 'text-size',
    find: (data) => smallText(data.text).map((t) => ({ selector: t.selector, detail: `${t.px}px` })),
  },
  {
    rule: 'target-size',
    find: (data) =>
      targetFailures(data.targets).map((t) => ({
        selector: t.selector,
        detail: `${Math.round(t.w)}x${Math.round(t.h)}`,
      })),
  },
  {
    rule: 'reflow',
    find: (data, viewport) =>
      data.horizontalOverflow > 1
        ? [{ selector: 'html', detail: `${data.horizontalOverflow}px wider than ${viewport}` }]
        : [],
  },
  {
    rule: 'name',
    find: (data) =>
      data.unnamedControls.map((s) => ({ selector: s, detail: 'button or link with no accessible name' })),
  },
  {
    rule: 'label',
    find: (data) =>
      data.unlabelledFields.map((f) => ({ selector: f.selector, detail: 'form field without a label' })),
  },
  {
    rule: 'alt',
    find: (data) => data.imagesWithoutAlt.map((s) => ({ selector: s, detail: 'image without alt' })),
  },
  {
    rule: 'zoom',
    find: (data) => (data.zoomBlocked ? [{ selector: 'meta[name=viewport]', detail: data.viewport }] : []),
  },
];

export function auditViolations(data, viewport) {
  return AUDIT_RULES.flatMap(({ rule, find }) => find(data, viewport).map((v) => ({ rule, ...v })));
}

export async function auditPage(page, viewport) {
  return auditViolations(await page.evaluate(collect, PAGE_LIMITS), viewport);
}

export function formatReport(findings) {
  const lines = [];
  for (const f of findings) {
    lines.push(`${f.screen} at ${f.viewport}:`);
    for (const x of f.violations) lines.push(`  - ${x.rule}: ${x.selector} (${x.detail})`);
  }
  return lines.join('\n');
}

const hex = (c) =>
  '#' +
  c
    .slice(0, 3)
    .map((v) => Math.round(v).toString(16).padStart(2, '0'))
    .join('');

function dedupe(list, key) {
  const seen = new Map();
  for (const item of list) {
    const k = key(item);
    if (seen.has(k)) seen.get(k).count++;
    else seen.set(k, { ...item, count: 1 });
  }
  return [...seen.values()];
}

async function scanWidth(browser, opts, width) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: opts.dark ? 'dark' : 'light',
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page
    .goto(opts.url, { waitUntil: 'networkidle', timeout: 60000 })
    .catch(() => page.goto(opts.url, { waitUntil: 'load' }));
  await page.waitForTimeout(500);
  const shot = join(opts.out, `screen-${width}${opts.dark ? '-dark' : ''}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  const data = await page.evaluate(collect, PAGE_LIMITS);

  await page.evaluate(markFocusables);
  const focus = [];
  const seen = new Set();
  for (let i = 0; i < opts.maxTabs; i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(inspectFocus);
    if (!f) continue;
    if (seen.has(f.key)) break;
    seen.add(f.key);
    focus.push(f);
  }
  await context.close();

  const contrast = dedupe(
    contrastFailures(data.text),
    (t) => `${hex(t.fg)}|${hex(t.bg)}|${t.px}|${t.weight}`,
  );
  const uncertain = data.text.filter((t) => t.uncertain).length;
  return {
    width,
    screenshot: shot,
    textChecked: data.text.length,
    textFailing: contrastFailures(data.text).length,
    targetsChecked: data.targets.length,
    styleStats: data.styleStats,
    contrast,
    contrastUncertain: uncertain,
    smallText: dedupe(smallText(data.text), (t) => `${t.selector}|${t.px}`),
    targets: targetFailures(data.targets),
    focusNoIndicator: focus.filter((f) => !f.visibleChange),
    focusCovered: focus.filter((f) => f.covered),
    focusChecked: focus.length,
    ...Object.fromEntries(
      [
        'unnamedControls',
        'unlabelledFields',
        'imagesWithoutAlt',
        'h1Count',
        'skippedHeadings',
        'lang',
        'title',
        'viewport',
        'zoomBlocked',
        'horizontalOverflow',
      ].map((k) => [k, data[k]]),
    ),
  };
}

function report(opts, results) {
  const L = [];
  L.push(
    `# Automated UI scan`,
    '',
    `URL: ${opts.url}  `,
    `Theme: ${opts.dark ? 'dark' : 'light'}  `,
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    '',
  );
  L.push(
    'These are candidates found by heuristics. Confirm each one on the screenshot before reporting it; see the limits at the end.',
    '',
  );
  const first = results[0];
  const page = [];
  if (!first.lang) page.push('- `<html>` has no `lang` (WCAG 3.1.1). Blocker.');
  if (!first.title.trim()) page.push('- Page has no `<title>` (WCAG 2.4.2). Major.');
  if (first.zoomBlocked)
    page.push(`- Viewport meta blocks zoom: \`${first.viewport}\` (WCAG 1.4.4). Blocker.`);
  if (first.h1Count !== 1) page.push(`- ${first.h1Count} visible \`h1\` elements; expected one. Minor.`);
  if (first.skippedHeadings.length)
    page.push(`- Heading levels skip: ${[...new Set(first.skippedHeadings)].join(', ')}. Minor.`);
  if (first.imagesWithoutAlt.length)
    page.push(
      `- ${first.imagesWithoutAlt.length} images without \`alt\`: ${first.imagesWithoutAlt
        .slice(0, 8)
        .map((s) => `\`${s}\``)
        .join(', ')}. Blocker if they carry meaning.`,
    );
  if (first.unnamedControls.length)
    page.push(
      `- ${first.unnamedControls.length} buttons or links with no accessible name: ${first.unnamedControls
        .slice(0, 8)
        .map((s) => `\`${s}\``)
        .join(', ')}. Blocker.`,
    );
  if (first.unlabelledFields.length)
    page.push(
      `- ${first.unlabelledFields.length} form fields without a label${first.unlabelledFields.some((f) => f.placeholderOnly) ? ' (some rely on placeholder only)' : ''}: ${first.unlabelledFields
        .slice(0, 8)
        .map((f) => `\`${f.selector}\``)
        .join(', ')}. Blocker.`,
    );
  L.push('## Page-level', '', ...(page.length ? page : ['- No page-level issues found.']), '');

  for (const r of results) {
    L.push(`## Width ${r.width}px`, '', `Screenshot: \`${r.screenshot}\``, '');
    if (r.horizontalOverflow > 1)
      L.push(
        `- **Horizontal scroll**: content is ${r.horizontalOverflow}px wider than the viewport${r.width <= 320 ? ' (fails reflow, WCAG 1.4.10, Blocker)' : ''}.`,
      );
    L.push(
      `- Text elements checked: ${r.textChecked}; ${r.contrastUncertain} sit on background images or gradients and need a manual check.`,
    );
    if (r.contrast.length) {
      L.push(
        '',
        '### Contrast below WCAG AA',
        '',
        '| Ratio | Needs | Text | Background | Size / weight | Where (count) | Sample |',
        '| --- | --- | --- | --- | --- | --- | --- |',
      );
      for (const c of r.contrast.toSorted((a, b) => a.ratio - b.ratio).slice(0, 40))
        L.push(
          `| ${c.ratio}:1 | ${c.need}:1 | ${hex(c.fg)} | ${hex(c.bg)} | ${c.px}px / ${c.weight} | \`${c.selector}\` (${c.count}) | ${c.uncertain ? '(over image or gradient, verify) ' : ''}${c.sample.replace(/\|/g, '/')} |`,
        );
    }
    if (r.smallText.length)
      L.push(
        '',
        `### Text under ${MIN_TEXT_PX}px`,
        '',
        ...r.smallText.slice(0, 20).map((t) => `- ${t.px}px \`${t.selector}\` (${t.count}): ${t.sample}`),
      );
    if (r.targets.length)
      L.push(
        '',
        `### Targets under ${MIN_TARGET_PX}x${MIN_TARGET_PX}px without enough spacing (WCAG 2.5.8)`,
        '',
        ...r.targets.slice(0, 30).map((t) => `- ${Math.round(t.w)}x${Math.round(t.h)} \`${t.selector}\``),
      );
    L.push('', `### Keyboard focus (${r.focusChecked} stops checked)`);
    if (r.focusNoIndicator.length)
      L.push(
        '',
        'No visible style change on focus (WCAG 2.4.7, Blocker):',
        ...r.focusNoIndicator.slice(0, 30).map((f) => `- \`${f.selector}\` ${f.text}`),
      );
    if (r.focusCovered.length)
      L.push(
        '',
        'Focused element covered by another element (WCAG 2.4.11):',
        ...r.focusCovered.slice(0, 30).map((f) => `- \`${f.selector}\` under \`${f.coveredBy}\``),
      );
    if (!r.focusNoIndicator.length && !r.focusCovered.length) L.push('', '- No focus problems found.');
    L.push('');
  }
  L.push('## Not checked automatically', '');
  L.push(
    'Hierarchy, spacing consistency, copy, states (empty, loading, error), navigation, motion, forms behaviour, screen reader output, zoom at 200%, forced colours, and text over images. Contrast uses DOM ancestors for the background, so text positioned over unrelated elements can be misjudged; a "focus change" counts any style change, not whether it reaches 3:1.',
  );
  return L.join('\n') + '\n';
}

async function main(argv) {
  const opts = readOptions(argv);
  if (!opts.url) {
    console.error(USAGE);
    return 2;
  }
  opts.out = resolve(opts.out);
  await mkdir(opts.out, { recursive: true });
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const w of opts.widths) results.push(await scanWidth(browser, opts, w));
  } finally {
    await browser.close();
  }
  const suffix = opts.dark ? '-dark' : '';
  await writeFile(
    join(opts.out, `scan${suffix}.json`),
    JSON.stringify({ url: opts.url, dark: opts.dark, results }, null, 2),
  );
  await writeFile(join(opts.out, `scan${suffix}.md`), report(opts, results));
  const total = results.reduce(
    (n, r) =>
      n +
      r.contrast.length +
      r.targets.length +
      r.focusNoIndicator.length +
      r.focusCovered.length +
      (r.horizontalOverflow > 1 ? 1 : 0),
    0,
  );
  console.log(
    `Wrote ${join(opts.out, `scan${suffix}.md`)} (${total} candidate findings across ${results.length} widths)`,
  );
}

runIfMain(import.meta, (argv) =>
  main(argv).catch((e) => {
    console.error(e);
    return 1;
  }),
);
