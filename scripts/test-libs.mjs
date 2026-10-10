#!/usr/bin/env node
/**
 * Runs the Vitest unit tests of the libraries under projects/myrmidon, one
 * library at a time, and reports which ones failed.
 *
 * Note that @myrmidon/cadmus-part-itinera-pg resolves the other libraries
 * through tsconfig.json's compilerOptions.paths -> ./dist/myrmidon/<name>,
 * so run `pnpm run build:libs` before testing it.
 *
 * Usage:
 *   node scripts/test-libs.mjs                  test all the libraries
 *   node scripts/test-libs.mjs <name>...        test only these libraries
 *   node scripts/test-libs.mjs --coverage <...> also collect coverage
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LIBS_DIR = join(ROOT, 'projects', 'myrmidon');
const NG = join(ROOT, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');

const local = readdirSync(LIBS_DIR)
  .map((dir) => join(LIBS_DIR, dir, 'package.json'))
  .filter((file) => existsSync(file))
  .map((file) => JSON.parse(readFileSync(file, 'utf8')).name)
  .sort();

const args = process.argv.slice(2);
const coverage = args.includes('--coverage');
const requested = args
  .filter((a) => a !== '--coverage')
  .map((r) => (r.startsWith('@myrmidon/') ? r : `@myrmidon/${r}`));

for (const name of requested) {
  if (!local.includes(name)) {
    console.error(`ERROR: unknown library "${name}"`);
    process.exit(1);
  }
}
const targets = requested.length ? requested : local;

const failed = [];
for (const [i, name] of targets.entries()) {
  console.log(`\n[${i + 1}/${targets.length}] ${name}`);
  const ngArgs = [NG, 'test', name, '--watch=false'];
  if (coverage) ngArgs.push('--coverage');
  const { status } = spawnSync(process.execPath, ngArgs, {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (status !== 0) failed.push(name);
}

if (failed.length) {
  console.error(`\nFAILED (${failed.length}/${targets.length}):`);
  for (const name of failed) console.error(`  ${name}`);
  process.exit(1);
}
console.log(`\nAll ${targets.length} libraries passed.`);
