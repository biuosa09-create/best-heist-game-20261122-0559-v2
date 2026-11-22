// The Velvet Vault — a heist game, handed in.
// Node 22, standard library only. This program copies game/ and screenshots/
// from beside this file to /output and writes /output/dossier.json with the
// vendored make.fun library, the summary the judge reads.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The program runs twice and both runs must write the same bytes: the copy
// below is a plain recursive copy of fixed files, and the dossier is
// deterministic, so a second run into the same /output writes identical bytes.

import { cpSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail fast, with a readable reason, when the game is not where it should be.
if (!existsSync(join(here, 'game', 'index.html'))) {
  throw new Error('game/index.html is missing: the game is not in this repository');
}
if (!existsSync(join(here, 'screenshots'))) {
  throw new Error('screenshots/ is missing: the entry needs 3 or 4 screenshots');
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of
// game files, in all, or a path under game/ over 1000 bytes: game/ counts
// beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};
// The gate refuses a dossier over 1.5 MiB; check it here so a bad entry fails
// loudly at build time instead of silently at the gate.
const DOSSIER_MAX_BYTES = 1572864;

/** Copy a directory to /output, removing the destination first. */
function copyFresh(source, dest) {
  // cpSync refuses to copy over a previous run's read-only files, so a second
  // run into the same /output would fail unless the destination is removed
  // first. Removing it makes every run start from the same empty state.
  rmSync(dest, { recursive: true, force: true });
  cpSync(source, dest, { recursive: true });
}

mkdirSync(out, { recursive: true });
copyFresh(join(here, 'game'), join(out, 'game'));
copyFresh(join(here, 'screenshots'), join(out, 'screenshots'));

const dossierPath = join(out, 'dossier.json');
writeFileSync(dossierPath, buildDossier(out, DOSSIER_CAPS));
checkDossierSize(dossierPath);

/** The gate refuses a dossier over 1.5 MiB; fail here instead of at the gate. */
function checkDossierSize(path) {
  const bytes = statSync(path).size;
  if (bytes > DOSSIER_MAX_BYTES) {
    throw new Error(`dossier.json is ${bytes} bytes, over the ${DOSSIER_MAX_BYTES} the gate allows`);
  }
}
