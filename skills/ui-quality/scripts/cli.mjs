import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// A plugin install can reach these scripts through a symlink, so compare real paths.
export function runIfMain(meta, main) {
  if (!process.argv[1] || meta.url !== pathToFileURL(realpathSync(process.argv[1])).href) return;
  const code = main(process.argv.slice(2));
  if (code instanceof Promise) {
    code.then((resolved) => {
      process.exitCode = resolved;
    });
  } else {
    process.exitCode = code;
  }
}

// --key value pairs and bare --flags; everything else is positional.
export function parseArgs(argv, { flags = [], repeatable = [] } = {}) {
  const positional = [];
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    let value = true;
    if (!flags.includes(key) && next !== undefined && !next.startsWith('--')) {
      value = next;
      i += 1;
    }
    if (repeatable.includes(key)) (options[key] ??= []).push(value);
    else options[key] = value;
  }
  return { positional, options };
}
