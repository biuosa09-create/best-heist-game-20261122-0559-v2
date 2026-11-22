// The Velvet Vault — the security cameras and the alarm meter.
// A camera sweeps its cone back and forth on a fixed period. While it sees
// Wren the alarm climbs; an EMP blanks every camera for ten seconds. The
// alarm drains slowly while nobody sees her, and at 100 she is caught.

import {
  CAMERA_VISION_RANGE,
  CAMERA_VISION_HALF_ANGLE,
  ALARM_CAMERA_RATE,
  ALARM_SNEAK_FACTOR,
  ALARM_DECAY_RATE,
  ALARM_CAUGHT,
} from './config.js';
import { inCone, lineBlocked, hiddenBySmoke } from './guards.js';
import { sfx } from './audio.js';

export function updateCameras(level, player, dt, game) {
  let anyoneSees = false;
  for (const camera of level.cameras) {
    // Sweep: a sine swing around the base angle, so the cone's motion is
    // smooth and perfectly repeatable.
    camera.angle = camera.baseAngle + Math.sin(game.elapsed * ((2 * Math.PI) / camera.period) + camera.phase) * camera.sweep;
    if (camera.disabledTimer > 0) {
      camera.disabledTimer -= dt;
      camera.seen = false;
      continue;
    }
    const sees =
      !hiddenBySmoke(player, level) &&
      inCone(camera.x, camera.y, camera.angle, CAMERA_VISION_RANGE, CAMERA_VISION_HALF_ANGLE, player.x, player.y) &&
      !lineBlocked(camera.x, camera.y, player.x, player.y, level);
    camera.seen = sees;
    if (sees) {
      anyoneSees = true;
      const rate = ALARM_CAMERA_RATE * (player.sneaking ? ALARM_SNEAK_FACTOR : 1);
      game.alarm = Math.min(ALARM_CAUGHT, game.alarm + rate * dt);
    }
  }
  return anyoneSees;
}

/** The alarm meter: drains when nobody sees Wren, trips the catch at 100. */
export function updateAlarm(game, dt, anyoneSees) {
  if (!anyoneSees && !game.anyGuardSees) {
    game.alarm = Math.max(0, game.alarm - ALARM_DECAY_RATE * dt);
  }
  if (game.alarm >= ALARM_CAUGHT && !game.staging) {
    game.caught = true;
    game.caughtReason = 'The alarm hit 100% — security swarmed the room.';
  }
  // A short beep while the meter is in the red, so the danger is audible.
  if (game.alarm > 70) {
    game.alarmBeepTimer -= dt;
    if (game.alarmBeepTimer <= 0) {
      game.alarmBeepTimer = 0.9;
      sfx.alarmLoop();
    }
  }
}
