# The Velvet Vault — a heist game

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/biuosa09-create/best-heist-game-20261122-0559-v2/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/biuosa09-create/best-heist-game-20261122-0559-v2/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

An original top-down 2D heist game that runs offline in a desktop browser
from static files. You are Wren, a thief working three contracts — Gallery,
Bank, Casino — in order of rising difficulty. Sneak past patrolling guards
and their vision cones, dodge sweeping security cameras, pick locked doors,
crack safes, lift the marked target and get out before the alarm hits 100%.

Play it on make.fun: https://make.fun/r/shw861zs

## How to play

Serve `game/` with any static server and open `game/index.html` in a desktop
browser (no network request, no build step):

```
node serve.ts   # if present, or: python3 -m http.server --directory game
```

- **WASD / Arrows** — move. **Shift** — sneak (slower, harder to spot).
- **Hold E** — pick a locked door, crack a safe ($1,200), lift the marked
  target ($2,500). Bonus loot is $400 a piece.
- **Q** — smoke bomb (×2, blocks sight). **F** — EMP (×1, cameras dark 10s).
- **Esc / P** — pause.

Guards and cameras raise the **alarm meter** when they see you; sneaking
slows the rise. Above 50% the guards chase you. At 100%, or if a guard
touches you, you are caught. Once the target is lifted, reach the green
**EXIT** to finish the contract. Unlocked contracts and your best take are
saved in `localStorage`.

## The three contracts

1. **The Gallery** — lift the Rose Portrait. Two guards, one camera, one
   locked door.
2. **The Bank** — crack the vault. Three guards, two cameras, two locked
   doors, two safes.
3. **The Casino** — empty the high-roller room. Four guards, three cameras,
   two locked doors, slot-machine cover everywhere.

## Structure

- `game/index.html` — the page, one canvas, one module script.
- `game/src/main.js` — state machine, game loop, save, `?shot=` scenes.
- `game/src/levels.js` — the three contracts as pure data.
- `game/src/player.js` — Wren: movement, collision, interaction, tools.
- `game/src/guards.js` — patrols, vision cones, line of sight, the chase.
- `game/src/cameras.js` — sweeping cameras and the alarm meter.
- `game/src/render.js` — the room, the cones, the HUD, the minimap, screens.
- `game/src/audio.js` — synthesised WebAudio sounds, no audio files.
- `game/src/input.js` — keyboard and mouse.
- `game/src/config.js` — tuning and palette.
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json` with `vendor/makefun-game.ts`.

## Screenshots

Four staged renders of the game's own code, taken in a headless browser:
`1-cover.jpg` (Gallery, mid-heist), `2-alarm.jpg` (Bank, alarm at 78%),
`3-title.jpg` (title screen), `4-escape.jpg` (campaign complete).
