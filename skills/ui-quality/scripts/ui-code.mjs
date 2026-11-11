#!/usr/bin/env node
// The code pass of a UI audit: styles and markup that bypass the design system or break
// accessibility in ways a reader of the code can confirm. Each hit is a candidate.
// Usage: ui-code.mjs [<dir or file> ...] [--tokens <glob-ish substring,...>] [--json]
//   Defaults to the current directory. Skips node_modules, dist, build, .git, tests and the
//   token files themselves (paths containing tokens, theme or variables, or --tokens).
//   Rules:
//     colour-literal  a hex, rgb() or hsl() colour outside a token file or a custom property
//     off-grid        margin, padding, gap or inset in px off the 4 px grid (ui-rules.mjs)
//     raw-font-size   a font-size in px (use rem or a type token)
//     outline-none    outline: none or 0 with no :focus-visible style in the same file
//     click-div       onClick or @click on a div or span with no role
// Prints file:line rule text.
// Exit codes: 0 nothing found, 1 candidates found, 2 usage error.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { parseArgs, runIfMain } from './cli.mjs';
import { isOffGrid } from './ui-rules.mjs';

export const USAGE = `Usage: ui-code.mjs [<dir or file> ...] [--tokens <glob-ish substring,...>] [--json]
Exit codes: 0 nothing found, 1 candidates found, 2 usage error.`;

const EXT = /\.(css|scss|less|tsx|jsx|vue|svelte|astro|html)$/;
const SKIP_DIR = new Set(['node_modules', 'dist', 'build', '.git', '.next', 'coverage', 'out']);
const TEST = /(^|\/)(__tests__|tests?|e2e)\/|\.(test|spec|stories)\.[^/]+$/;

export const isScannedFile = (file) => EXT.test(file);

const RULES = [
  {
    rule: 'colour-literal',
    re: /#[0-9a-fA-F]{3,8}\b(?![\w-])|\b(?:rgba?|hsla?)\(\s*\d/g,
    skipLine: /^\s*(\/\/|\*|\/\*|--[\w-]+\s*:)|url\(|href=/,
  },
  {
    rule: 'off-grid',
    re: /\b(?:margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left)(?:-(?:top|right|bottom|left|inline|block)(?:-start|-end)?)?\s*:\s*([^;}{]+)/g,
    check: (m) => [...m[1].matchAll(/(-?\d+(?:\.\d+)?)px/g)].some(([, n]) => isOffGrid(Number(n))),
  },
  { rule: 'raw-font-size', re: /font-size\s*:\s*\d+(?:\.\d+)?px|fontSize\s*:\s*['"]?\d+(?:px)?['"]?/g },
  {
    rule: 'outline-none',
    re: /outline\s*:\s*(?:none|0)\b/g,
    fileCheck: (text) => !/:focus-visible/.test(text),
  },
  { rule: 'click-div', re: /<(div|span)\b(?![^>]*\brole=)[^>]*\s(?:onClick|@click|v-on:click|on:click)=/g },
];

export function scanText(text, file = '') {
  const hits = [];
  const lines = text.split('\n');
  for (const r of RULES) {
    if (r.fileCheck && !r.fileCheck(text)) continue;
    lines.forEach((line, i) => {
      if (r.skipLine && r.skipLine.test(line)) return;
      for (const m of line.matchAll(r.re)) {
        if (r.check && !r.check(m)) continue;
        hits.push({ file, line: i + 1, rule: r.rule, text: line.trim().slice(0, 120) });
        break;
      }
    });
  }
  return hits.toSorted((a, b) => a.line - b.line);
}

export function isTokenFile(file, extra = []) {
  return /(^|\/)[^/]*(tokens?|theme|variables)[^/]*$/i.test(file) || extra.some((t) => file.includes(t));
}

function walk(target, out = []) {
  const s = statSync(target);
  if (s.isFile()) return out.concat(target);
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIR.has(entry.name) && !entry.name.startsWith('.')) walk(path.join(target, entry.name), out);
    } else if (isScannedFile(entry.name)) out.push(path.join(target, entry.name));
  }
  return out;
}

function main(argv) {
  const { positional: targets, options } = parseArgs(argv, { flags: ['json'] });
  const unknown = Object.keys(options).find((k) => !['tokens', 'json'].includes(k));
  if (unknown) {
    console.error(`code-scan: unknown option --${unknown}\n${USAGE}`);
    return 2;
  }
  const tokens = typeof options.tokens === 'string' ? options.tokens.split(',').filter(Boolean) : [];
  const json = Boolean(options.json);
  const files = (targets.length ? targets : ['.']).flatMap((t) => walk(t)).filter((f) => !TEST.test(f));
  const hits = [];
  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    const found = scanText(readFileSync(file, 'utf8'), rel);
    hits.push(...(isTokenFile(rel, tokens) ? found.filter((h) => h.rule !== 'colour-literal') : found));
  }
  if (json) console.log(JSON.stringify(hits, null, 2));
  else for (const h of hits) console.log(`${h.file}:${h.line} ${h.rule} ${h.text}`);
  if (!json) console.log(`${hits.length} candidates in ${files.length} files`);
  return hits.length ? 1 : 0;
}

runIfMain(import.meta, main);
