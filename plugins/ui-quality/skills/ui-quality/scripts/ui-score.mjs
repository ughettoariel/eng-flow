#!/usr/bin/env node
// Scores one round of the UI quality loop and decides whether it can stop.
// Rules and thresholds: ../references/loop.md.
//
// Usage: ui-score.mjs [--scans ui-audit] [--scan file.json ...] [--findings ui-audit/findings.json]
//                     [--history ui-audit/history.json] [--out ui-audit/scorecard.md]
//                     [--round "2: fixed contrast tokens"] [--gates '{"auto":95}'] [--max-rounds 5]
// --scans reads every scan*.json under a folder (one subfolder per screen).
// Exit codes: 0 every gate passes, 1 a gate does not, 2 bad input.

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { parseArgs, runIfMain } from './cli.mjs';
import {
  CONSISTENCY_BUDGETS,
  FINDING_PENALTIES,
  GRID_PX,
  MAX_CATEGORY_SCORE,
  NEAR_DUPLICATE_DISTANCE,
  NEAR_DUPLICATE_PENALTY,
  OFF_GRID_PENALTY_PER_PERCENT,
  SEMANTICS_PENALTIES,
  SEVERITY_CAPS,
  isOffGrid,
} from './ui-rules.mjs';

export const USAGE = `Usage: ui-score.mjs [--scans ui-audit] [--scan file.json ...] [--findings ui-audit/findings.json]
                    [--history ui-audit/history.json] [--out ui-audit/scorecard.md]
                    [--round "2: fixed contrast tokens"] [--gates '{"auto":95}'] [--max-rounds 5]
Exit codes: 0 every gate passes, 1 a gate does not, 2 bad input.`;

// Universal sections 1 to 13 in references/universal.md.
export const CATEGORIES = {
  hierarchy: 'Hierarchy and layout',
  spacing: 'Spacing',
  typography: 'Typography',
  color: 'Colour and contrast',
  navigation: 'Navigation and IA',
  states: 'Interaction, states and feedback',
  forms: 'Forms and input',
  content: 'Content and copy',
  motion: 'Motion',
  accessibility: 'Accessibility beyond contrast',
  performance: 'Perceived performance',
  i18n: 'Internationalisation',
  consistency: 'Consistency',
};

export const DEFAULT_GATES = { auto: 90, consistency: 85, category: 8, maxOpenMajor: 0, maxOpenBlocker: 0 };

const SEVERITIES = ['Blocker', 'Major', 'Minor'];
const STATUSES = ['open', 'fixed', 'wontfix'];

// Rejects values that would silently drop out of the score.
export function validateFindings(doc, categories = CATEGORIES) {
  const errors = [];
  const keys = Object.keys(categories);
  for (const field of ['reviewed', 'notApplicable']) {
    if (doc[field] !== undefined && !Array.isArray(doc[field])) errors.push(`${field} must be a list`);
    for (const c of doc[field] || []) if (!keys.includes(c)) errors.push(`${field}: unknown category "${c}"`);
  }
  (doc.findings || []).forEach((f, i) => {
    const id = f.id || `#${i + 1}`;
    if (!keys.includes(f.category))
      errors.push(`${id}: category "${f.category}" is not one of ${keys.join(', ')}`);
    if (!SEVERITIES.includes(f.severity))
      errors.push(`${id}: severity "${f.severity}" is not one of ${SEVERITIES.join(', ')}`);
    if (f.status !== undefined && !STATUSES.includes(f.status))
      errors.push(`${id}: status "${f.status}" is not one of ${STATUSES.join(', ')}`);
  });
  return errors;
}

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const pct = (bad, total) => (total > 0 ? clamp(100 * (1 - bad / total)) : 100);

export function countScore(distinct, target, step) {
  return distinct <= target ? 100 : clamp(100 - (distinct - target) * step);
}

const parseHex = (k) => {
  const m = String(k).match(/^#([0-9a-f]{6})/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// Colours that differ but are visually almost equal are usually a mistake
// (#333333 next to #343434): one token was meant.
export function nearDuplicates(keys, threshold = NEAR_DUPLICATE_DISTANCE) {
  const cols = keys.map((k) => [k, parseHex(k)]).filter(([, c]) => c);
  const pairs = [];
  for (let i = 0; i < cols.length; i++)
    for (let j = i + 1; j < cols.length; j++) {
      const [a, ca] = cols[i];
      const [b, cb] = cols[j];
      const d = Math.hypot(ca[0] - cb[0], ca[1] - cb[1], ca[2] - cb[2]);
      if (d > 0 && d < threshold) pairs.push([a, b]);
    }
  return pairs;
}

const keys = (m) => Object.keys(m || {});

// Each style budget scores its distinct values; colour budgets also lose points per near-duplicate pair.
function budgetScores(stats, nearPairs) {
  const metrics = {};
  for (const [metric, { stat, allowed, perExtra }] of Object.entries(CONSISTENCY_BUDGETS)) {
    const score = countScore(keys(stats[stat]).length, allowed, perExtra);
    metrics[metric] = clamp(score - NEAR_DUPLICATE_PENALTY * (nearPairs[metric]?.length ?? 0));
  }
  return metrics;
}

// Share of spacing values on the 4 px grid, losing points per 1% off it.
function spacingGrid(stats) {
  const spacing = Object.entries(stats.spacing || {});
  const total = spacing.reduce((n, [, c]) => n + c, 0);
  const offGrid = spacing.filter(([v]) => isOffGrid(parseFloat(v)));
  const offCount = offGrid.reduce((n, [, c]) => n + c, 0);
  const score = total ? clamp(100 - (OFF_GRID_PENALTY_PER_PERCENT * 100 * offCount) / total) : 100;
  return { score, offGrid };
}

export function consistencyScores(stats) {
  const nearPairs = {
    textColors: nearDuplicates(keys(stats.textColor)),
    backgrounds: nearDuplicates(keys(stats.background)),
  };
  const grid = spacingGrid(stats);
  const metrics = { ...budgetScores(stats, nearPairs), spacingGrid: grid.score };
  const values = Object.values(metrics);
  return {
    metrics,
    overall: clamp(values.reduce((a, b) => a + b, 0) / values.length),
    details: {
      ...Object.fromEntries(
        Object.entries(CONSISTENCY_BUDGETS).map(([metric, { stat }]) => [metric, keys(stats[stat])]),
      ),
      offGridSpacing: grid.offGrid.toSorted((a, b) => b[1] - a[1]).map(([v, c]) => `${v}px x${c}`),
      nearDuplicateColors: [...nearPairs.textColors, ...nearPairs.backgrounds].map(([a, b]) => `${a} ~ ${b}`),
    },
  };
}

// Each page-level failure the semantics score checks, keyed as in SEMANTICS_PENALTIES.
const SEMANTICS_FAILS = {
  noLang: (r) => !r.lang,
  zoomBlocked: (r) => r.zoomBlocked,
  unnamedControls: (r) => r.unnamedControls?.length,
  unlabelledFields: (r) => r.unlabelledFields?.length,
  imagesWithoutAlt: (r) => r.imagesWithoutAlt?.length,
  noTitle: (r) => !r.title?.trim(),
  notOneH1: (r) => r.h1Count !== 1,
  skippedHeadings: (r) => r.skippedHeadings?.length,
};

function semanticsScore(r) {
  const failed = Object.entries(SEMANTICS_FAILS)
    .filter(([, fails]) => fails(r))
    .map(([name]) => name);
  return clamp(100 - failed.reduce((n, name) => n + SEMANTICS_PENALTIES[name], 0));
}

export function accessibilityScores(r) {
  const contrastBad = r.textFailing ?? (r.contrast || []).reduce((n, c) => n + (c.count || 1), 0);
  const focusBad = new Set(
    [...(r.focusNoIndicator || []), ...(r.focusCovered || [])].map((f) => f.key ?? f.selector),
  ).size;
  return {
    contrast: pct(contrastBad, r.textChecked),
    targets: pct((r.targets || []).length, r.targetsChecked ?? (r.targets || []).length),
    focus: pct(focusBad, r.focusChecked),
    reflow: r.horizontalOverflow > 1 ? 0 : 100,
    semantics: semanticsScore(r),
  };
}

// Worst value of each metric across every scanned width and theme.
export function autoScores(scans) {
  const per = scans.flatMap((s) =>
    s.results.map((r) => ({
      a11y: accessibilityScores(r),
      cons: consistencyScores(r.styleStats || {}),
      label: `${s.screen ? `${s.screen} ` : ''}${r.width}px${s.dark ? ' dark' : ''}`,
    })),
  );
  if (!per.length) return null;
  const worst = (pick) => {
    const out = {};
    for (const k of Object.keys(pick(per[0]))) {
      const min = per.reduce((m, p) => (pick(p)[k] < m.v ? { v: pick(p)[k], at: p.label } : m), {
        v: Infinity,
        at: '',
      });
      out[k] = min;
    }
    return out;
  };
  const cons = per.reduce((m, p) => (p.cons.overall < m.overall ? p.cons : m), per[0].cons);
  return {
    accessibility: worst((p) => p.a11y),
    consistency: worst((p) => p.cons.metrics),
    consistencyOverall: cons.overall,
    consistencyDetails: cons.details,
  };
}

// A category's score from its open findings: the maximum minus each finding's penalty,
// then held under the cap of every severity still open.
function openFindingsScore(open) {
  let score = MAX_CATEGORY_SCORE - open.reduce((n, f) => n + (FINDING_PENALTIES[f.severity] ?? 0), 0);
  for (const [severity, cap] of Object.entries(SEVERITY_CAPS))
    if (open.some((f) => f.severity === severity)) score = Math.min(score, cap);
  return Math.max(0, Math.round(score * 10) / 10);
}

export function categoryScores(doc, categories = CATEGORIES) {
  const out = {};
  const reviewed = new Set(doc.reviewed || []);
  const na = new Set(doc.notApplicable || []);
  for (const cat of Object.keys(categories)) {
    if (na.has(cat)) {
      out[cat] = { score: null, status: 'n/a' };
      continue;
    }
    const open = (doc.findings || []).filter((f) => f.category === cat && (f.status ?? 'open') === 'open');
    if (!reviewed.has(cat) && !open.length) {
      out[cat] = { score: null, status: 'not reviewed' };
      continue;
    }
    const count = (sev) => open.filter((f) => f.severity === sev).length;
    out[cat] = {
      score: openFindingsScore(open),
      status: 'scored',
      blocker: count('Blocker'),
      major: count('Major'),
      minor: count('Minor'),
    };
  }
  return out;
}

export function overallScore(auto, cats) {
  const parts = [];
  if (auto) {
    const a = Object.values(auto.accessibility).map((m) => m.v);
    parts.push(a.reduce((x, y) => x + y, 0) / a.length, auto.consistencyOverall);
  }
  const scored = Object.values(cats)
    .filter((c) => c.score !== null)
    .map((c) => c.score * 10);
  if (scored.length) parts.push(scored.reduce((x, y) => x + y, 0) / scored.length);
  return parts.length ? clamp(parts.reduce((x, y) => x + y, 0) / parts.length) : null;
}

export function evaluateGates(auto, cats, doc, gates = DEFAULT_GATES, categories = CATEGORIES) {
  const checks = [];
  const open = (doc.findings || []).filter((f) => (f.status ?? 'open') === 'open');
  const blockers = open.filter((f) => f.severity === 'Blocker').length;
  const majors = open.filter((f) => f.severity === 'Major').length;
  checks.push({ name: 'No open Blockers', pass: blockers <= gates.maxOpenBlocker, value: blockers });
  checks.push({ name: 'No open Majors', pass: majors <= gates.maxOpenMajor, value: majors });
  if (auto) {
    for (const [k, m] of Object.entries(auto.accessibility))
      checks.push({
        name: `Automated ${k} >= ${gates.auto}`,
        pass: m.v >= gates.auto,
        value: `${m.v} (worst at ${m.at})`,
      });
    checks.push({
      name: `Consistency >= ${gates.consistency}`,
      pass: auto.consistencyOverall >= gates.consistency,
      value: auto.consistencyOverall,
    });
  }
  for (const [k, c] of Object.entries(cats)) {
    if (c.status === 'n/a') continue;
    checks.push({
      name: `${categories[k] ?? k} >= ${gates.category}/10`,
      pass: c.score !== null && c.score >= gates.category,
      value: c.score === null ? 'not reviewed' : c.score,
    });
  }
  return { pass: checks.every((c) => c.pass), checks };
}

// Stalled: the overall score did not rise in the last two rounds.
export function isStalled(history) {
  if (history.length < 3) return false;
  const [a, b, c] = history.slice(-3).map((h) => h.overall ?? 0);
  return b <= a && c <= a;
}

function consistencyLines(d) {
  const lines = [
    `- Font sizes (${d.fontSizes.length}): ${d.fontSizes.join(', ')}`,
    `- Font families (${d.fontFamilies.length}): ${d.fontFamilies.join(', ')}`,
    `- Font weights (${d.fontWeights.length}): ${d.fontWeights.join(', ')}`,
    `- Text colours (${d.textColors.length}): ${d.textColors.join(', ')}`,
    `- Backgrounds (${d.backgrounds.length}): ${d.backgrounds.join(', ')}`,
    `- Radii (${d.radii.length}): ${d.radii.join(', ')}`,
  ];
  if (d.offGridSpacing.length)
    lines.push(`- Spacing off the ${GRID_PX}px grid: ${d.offGridSpacing.slice(0, 15).join(', ')}`);
  if (d.nearDuplicateColors.length)
    lines.push(`- Near-duplicate colours (probably one token): ${d.nearDuplicateColors.join('; ')}`);
  return lines;
}

function trendTable(history, rows) {
  const recent = history.slice(-6);
  const offset = history.length - recent.length;
  const lines = [
    `| Metric | ${recent.map((_, i) => `R${offset + i + 1}`).join(' | ')} | Change |`,
    `| --- |${recent.map(() => ' --- |').join('')} --- |`,
  ];
  for (const [label, vals] of rows) {
    const v = vals.slice(-recent.length).map((x) => (x === null || x === undefined ? '-' : x));
    const [prev, last] = [vals.at(-2), vals.at(-1)];
    const delta =
      typeof prev === 'number' && typeof last === 'number' && prev !== last
        ? last > prev
          ? `+${Math.round((last - prev) * 10) / 10}`
          : `${Math.round((last - prev) * 10) / 10}`
        : '';
    lines.push(`| ${label} | ${v.join(' | ')} | ${delta} |`);
  }
  return lines;
}

export function scorecard(history, current) {
  const L = ['# UI scorecard', ''];
  L.push(
    `Round ${history.length}${current.round ? `: ${current.round}` : ''} · ${current.date} · Overall **${current.overall ?? '-'}**/100 · Gate **${current.gate.pass ? 'PASSED' : 'not passed'}**`,
    '',
  );
  const rows = new Map();
  const add = (label, pick) => rows.set(label, history.map(pick));
  add('Overall', (h) => h.overall);
  if (current.auto) {
    for (const k of Object.keys(current.auto.accessibility))
      add(`Auto: ${k}`, (h) => h.auto?.accessibility?.[k]?.v);
    add('Auto: consistency', (h) => h.auto?.consistencyOverall);
    for (const k of Object.keys(current.auto.consistency)) add(`  ${k}`, (h) => h.auto?.consistency?.[k]?.v);
  }
  for (const [k, label] of Object.entries(CATEGORIES)) add(label, (h) => h.categories?.[k]?.score);
  add('Open Blocker / Major / Minor', (h) => `${h.open.Blocker} / ${h.open.Major} / ${h.open.Minor}`);
  L.push(...trendTable(history, rows));
  L.push('', '## Gate', '');
  for (const c of current.gate.checks) L.push(`- [${c.pass ? 'x' : ' '}] ${c.name}: ${c.value}`);
  if (current.auto)
    L.push(
      '',
      '## Consistency details (worst width)',
      '',
      ...consistencyLines(current.auto.consistencyDetails),
    );
  if (current.stalled)
    L.push(
      '',
      '**Stalled:** the overall score has not risen for two rounds. Stop and report what is left (loop.md section 5).',
    );
  if (current.roundLimit)
    L.push(
      '',
      `**Round limit:** ${history.length} rounds without passing. Stop and report what is left (loop.md section 5).`,
    );
  return L.join('\n') + '\n';
}

function readOptions(argv) {
  const { options } = parseArgs(argv, { repeatable: ['scan', 'scans'] });
  const text = (name, fallback) => (typeof options[name] === 'string' ? options[name] : fallback);
  return {
    scans: options.scan ?? [],
    scanDirs: options.scans ?? [],
    findings: text('findings', null),
    history: text('history', 'ui-audit/history.json'),
    out: text('out', 'ui-audit/scorecard.md'),
    round: text('round', ''),
    gates: options.gates !== undefined ? JSON.parse(options.gates) : {},
    maxRounds: options['max-rounds'] !== undefined ? Number(options['max-rounds']) : 5,
  };
}

const readJson = async (p, fallback) => {
  try {
    return JSON.parse(await readFile(p, 'utf8'));
  } catch (e) {
    if (fallback !== undefined && e.code === 'ENOENT') return fallback;
    throw new Error(`${p}: ${e.message}`, { cause: e });
  }
};

async function findScans(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await findScans(p)));
    else if (/^scan.*\.json$/.test(e.name)) out.push(p);
  }
  return out;
}

async function main(argv) {
  const o = readOptions(argv);
  if ([...o.scans, ...o.scanDirs].some((v) => typeof v !== 'string')) {
    console.error(USAGE);
    return 2;
  }
  for (const d of o.scanDirs) o.scans.push(...(await findScans(d)));
  if (!o.scans.length && !o.findings) {
    console.error(USAGE);
    return 2;
  }
  const scans = await Promise.all(
    o.scans.map(async (p) => ({ ...(await readJson(p)), screen: basename(dirname(p)) })),
  );
  const doc = o.findings ? await readJson(o.findings) : { reviewed: [], findings: [] };
  const errors = validateFindings(doc);
  if (errors.length) {
    console.error(`${o.findings}: fix these before scoring:\n  - ${errors.join('\n  - ')}`);
    return 2;
  }
  const gates = { ...DEFAULT_GATES, ...o.gates };
  const history = await readJson(o.history, []);
  const auto = autoScores(scans);
  const categories = categoryScores(doc);
  const open = { Blocker: 0, Major: 0, Minor: 0 };
  for (const f of doc.findings || [])
    if ((f.status ?? 'open') === 'open' && f.severity in open) open[f.severity]++;
  const current = {
    round: o.round,
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    auto,
    categories,
    open,
    overall: overallScore(auto, categories),
  };
  current.gate = evaluateGates(auto, categories, doc, gates);
  history.push(current);
  current.stalled = !current.gate.pass && isStalled(history);
  current.roundLimit = !current.gate.pass && history.length >= o.maxRounds;
  await mkdir(dirname(o.history), { recursive: true });
  await writeFile(o.history, JSON.stringify(history, null, 2));
  await writeFile(o.out, scorecard(history, current));
  const failing = current.gate.checks.filter((c) => !c.pass);
  console.log(
    `Round ${history.length}: overall ${current.overall}/100, gate ${current.gate.pass ? 'PASSED' : `not passed (${failing.length} checks failing)`}${current.stalled ? ', STALLED' : ''}${current.roundLimit ? ', ROUND LIMIT' : ''}. Scorecard: ${o.out}`,
  );
  for (const c of failing.slice(0, 12)) console.log(`  - ${c.name}: ${c.value}`);
  return current.gate.pass ? 0 : 1;
}

runIfMain(import.meta, (argv) =>
  main(argv).catch((e) => {
    console.error(e.message);
    return 2;
  }),
);
