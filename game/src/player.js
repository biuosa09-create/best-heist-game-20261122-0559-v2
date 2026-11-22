// The Velvet Vault — the thief Wren: movement, collision and interaction.
// She walks with WASD/arrows, sneaks with Shift, and holds E to pick locks,
// crack safes and lift the marked target. Q drops a smoke bomb, F fires an EMP.

import {
  PLAYER_RADIUS,
  PLAYER_WALK_SPEED,
  PLAYER_SNEAK_SPEED,
  LOCKPICK_SECONDS,
  SAFE_CRACK_SECONDS,
  TARGET_GRAB_SECONDS,
  INTERACT_RANGE,
  SAFE_VALUE,
  TARGET_VALUE,
  SMOKE_COUNT,
  SMOKE_SECONDS,
  EMP_COUNT,
  EMP_SECONDS,
} from './config.js';
import { sfx } from './audio.js';

export function createPlayer(start) {
  return {
    x: start.x,
    y: start.y,
    radius: PLAYER_RADIUS,
    angle: -Math.PI / 2,
    sneaking: false,
    moving: false,
    smokeLeft: SMOKE_COUNT,
    empLeft: EMP_COUNT,
    smokes: [],
    interacting: null, // { kind: 'door'|'safe'|'target', ref, label }
    interactProgress: 0,
    interactLabel: '',
  };
}

/** Circle-vs-rectangle overlap, for one wall rect. */
function circleHitsRect(x, y, radius, rect) {
  const cx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy < radius * radius;
}

/** Every solid rect right now: walls plus locked doors. */
function solidRects(level) {
  const rects = level.walls.slice();
  for (const door of level.doors) {
    if (door.locked) rects.push(door);
  }
  return rects;
}

/** Move one axis, cancelling it when a wall is hit (so Wren slides along walls). */
function tryMove(player, dx, dy, level) {
  const rects = solidRects(level);
  const nx = player.x + dx;
  if (!rects.some((r) => circleHitsRect(nx, player.y, player.radius, r))) {
    player.x = nx;
  }
  const ny = player.y + dy;
  if (!rects.some((r) => circleHitsRect(player.x, ny, player.radius, r))) {
    player.y = ny;
  }
}

function rectCenter(rect) {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

function nearestInteractable(player, level) {
  let best = null;
  let bestDist = INTERACT_RANGE;
  const consider = (kind, cx, cy, ref, label) => {
    const d = Math.hypot(player.x - cx, player.y - cy);
    if (d < bestDist) {
      bestDist = d;
      best = { kind, ref, label, dist: d };
    }
  };
  for (const door of level.doors) {
    if (!door.locked) continue;
    const c = rectCenter(door);
    consider('door', c.x, c.y, door, `Pick ${door.label}`);
  }
  for (const safe of level.safes) {
    if (safe.taken) continue;
    consider('safe', safe.x, safe.y, safe, 'Crack the safe ($1,200)');
  }
  if (!level.target.taken) {
    consider('target', level.target.x, level.target.y, level.target, `Lift ${level.target.label} ($2,500)`);
  }
  return best;
}

export function updatePlayer(player, input, dt, level, game) {
  player.sneaking = input.sneak;
  const speed = player.sneaking ? PLAYER_SNEAK_SPEED : PLAYER_WALK_SPEED;
  const move = input.move;
  player.moving = move.x !== 0 || move.y !== 0;
  if (player.moving) {
    player.angle = Math.atan2(move.y, move.x);
    tryMove(player, move.x * speed * dt, move.y * speed * dt, level);
  }

  // Walk-over loot.
  for (const item of level.loot) {
    if (item.taken) continue;
    if (Math.hypot(player.x - item.x, player.y - item.y) < player.radius + 12) {
      item.taken = true;
      game.loot += 400;
      sfx.pickup();
    }
  }

  // Hold-to-interact: lockpick, safe crack, target lift.
  const near = nearestInteractable(player, level);
  if (near && input.interact) {
    if (!player.interacting || player.interacting.ref !== near.ref) {
      player.interacting = near;
      player.interactProgress = 0;
    }
    const need =
      near.kind === 'door' ? LOCKPICK_SECONDS : near.kind === 'safe' ? SAFE_CRACK_SECONDS : TARGET_GRAB_SECONDS;
    player.interactProgress += dt / need;
    player.interactLabel = near.label;
    if (Math.floor(player.interactProgress * 8) !== Math.floor((player.interactProgress - dt / need) * 8)) {
      sfx.lockpickTick();
    }
    if (player.interactProgress >= 1) {
      if (near.kind === 'door') {
        near.ref.locked = false;
        sfx.doorUnlock();
        game.message = `${near.ref.label} open — slip through.`;
      } else if (near.kind === 'safe') {
        near.ref.taken = true;
        game.loot += SAFE_VALUE;
        sfx.safeOpen();
        game.message = `Safe cracked — +$${SAFE_VALUE.toLocaleString()}.`;
      } else {
        near.ref.taken = true;
        game.loot += TARGET_VALUE;
        game.targetTaken = true;
        sfx.targetGrab();
        game.message = `${level.target.label} secured — get to the EXIT!`;
      }
      player.interacting = null;
      player.interactProgress = 0;
    }
  } else {
    player.interacting = null;
    player.interactProgress = 0;
    player.interactLabel = near ? near.label : '';
  }

  // Tools, on a fresh press.
  if (input.smokePressed && player.smokeLeft > 0) {
    player.smokeLeft -= 1;
    player.smokes.push({ x: player.x, y: player.y, timer: SMOKE_SECONDS });
    sfx.smoke();
    game.message = 'Smoke out — they cannot see through it.';
  }
  if (input.empPressed && player.empLeft > 0) {
    player.empLeft -= 1;
    for (const camera of level.cameras) camera.disabledTimer = EMP_SECONDS;
    sfx.emp();
    game.message = 'EMP fired — cameras dark for 10 seconds.';
  }
  for (const smoke of player.smokes) smoke.timer -= dt;
  player.smokes = player.smokes.filter((s) => s.timer > 0);

  // The exit only counts once the target is lifted.
  if (game.targetTaken) {
    const e = level.exit;
    if (player.x > e.x && player.x < e.x + e.w && player.y > e.y && player.y < e.y + e.h) {
      game.levelComplete = true;
    }
  }
}
