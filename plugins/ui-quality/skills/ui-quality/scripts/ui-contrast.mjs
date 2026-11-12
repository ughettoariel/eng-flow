#!/usr/bin/env node
// WCAG 2 contrast ratio between two colours.
// Usage: ui-contrast.mjs <foreground> <background> [--size 16] [--bold]
// Colours: #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), rgba(). A translucent
// foreground is composited over the background before measuring.
// Exit codes: 0 the text passes AA at its size, 1 it does not, 2 usage error.

import { parseArgs, runIfMain } from './cli.mjs';

export const USAGE = `Usage: ui-contrast.mjs <foreground> <background> [--size 16] [--bold]
Exit codes: 0 the text passes AA at its size, 1 it does not, 2 usage error.`;

const channel = (v) => (v.endsWith('%') ? (parseFloat(v) * 255) / 100 : parseFloat(v));

export function parseColor(input) {
  const s = String(input).trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) throw new Error(`Bad hex colour: ${input}`);
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    const a =
      parts[3] === undefined ? 1 : parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    return [channel(parts[0]), channel(parts[1]), channel(parts[2]), a];
  }
  throw new Error(`Unsupported colour: ${input} (use hex or rgb())`);
}

export function composite([r, g, b, a = 1], [br, bg, bb]) {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a)];
}

const linear = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

export function luminance([r, g, b]) {
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function ratio(fg, bg) {
  const back = bg.length === 4 && bg[3] < 1 ? composite(bg, [255, 255, 255]) : bg;
  const front = fg.length === 4 && fg[3] < 1 ? composite(fg, back) : fg;
  const [hi, lo] = [luminance(front), luminance(back)].toSorted((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Large text per WCAG: >= 24px regular, or >= 18.66px (14pt) at weight 700+.
export function isLargeText(px, weight = 400) {
  return px >= 24 || (px >= 18.66 && weight >= 700);
}

export function requiredRatio(px, weight) {
  return isLargeText(px, weight) ? 3 : 4.5;
}

function main(argv) {
  const { positional: pos, options } = parseArgs(argv, { flags: ['bold'] });
  if (pos.length < 2) {
    console.error(USAGE);
    return 2;
  }
  const px = options.size !== undefined ? parseFloat(options.size) : 16;
  const weight = options.bold ? 700 : 400;
  const r = ratio(parseColor(pos[0]), parseColor(pos[1]));
  const need = requiredRatio(px, weight);
  const line = (label, min) => `${label.padEnd(34)} ${min}:1  ${r >= min ? 'pass' : 'FAIL'}`;
  console.log(`Contrast ${r.toFixed(2)}:1  (${pos[0]} on ${pos[1]})`);
  console.log(line(`Text at ${px}px${weight >= 700 ? ' bold' : ''} (AA)`, need));
  console.log(line('UI components and graphics (AA)', 3));
  console.log(line(`Text at ${px}px (AAA)`, need === 3 ? 4.5 : 7));
  return r >= need ? 0 : 1;
}

runIfMain(import.meta, main);
