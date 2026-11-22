// The Velvet Vault — the guards: patrols, vision cones, the chase.
// A guard walks his waypoints until the alarm passes 50%, then he chases Wren.
// He catches her by touch. His cone only counts when nothing stands between
// them, and smoke hides her outright.

import {
  GUARD_RADIUS,
  GUARD_PATROL_SPEED,
  GUARD_CHASE_SPEED,
  GUARD_VISION_RANGE,
  GUARD_VISION_HALF_ANGLE,
  GUARD_CATCH_DISTANCE,
  ALARM_GUARD_RATE,
  ALARM_SNEAK_FACTOR,
  ALARM_CHASE_THRESHOLD,
} from './config.js';
import { sfx } from './audio.js';

/** Does the segment (x1,y1)-(x2,y2) cross the rectangle? (slab test) */
export function segmentHitsRect(x1, y1, x2, y2, rect) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tMin = 0;
  let tMax = 1;
  // X slab.
  if (Math.abs(dx) < 1e-9) {
    if (x1 < rect.x || x1 > rect.x + rect.w) return false;
  } else {
    let t1 = (rect.x - x1) / dx;
    let t2 = (rect.x + rect.w - x1) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  // Y slab.
  if (Math.abs(dy) < 1e-9) {
    if (y1 < rect.y || y1 > rect.y + rect.h) return false;
  } else {
    let t1 = (rect.y - y1) / dy;
    let t2 = (rect.y + rect.h - y1) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  return true;
}

/** True when the segment is blocked by any wall or locked door. */
export function lineBlocked(x1, y1, x2, y2, level) {
  const rects = level.walls;
  for (const rect of rects) {
    if (segmentHitsRect(x1, y1, x2, y2, rect)) return true;
  }
  for (const door of level.doors) {
    if (door.locked && segmentHitsRect(x1, y1, x2, y2, door)) return true;
  }
  return false;
}

/** Is the point inside the cone from (ox,oy) facing `angle`? */
export function inCone(ox, oy, angle, range, halfAngle, px, py) {
  const dx = px - ox;
  const dy = py - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range || dist < 1) return false;
  let diff = Math.atan2(dy, dx) - angle;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return Math.abs(diff) <= halfAngle;
}

/** Is the player hidden inside any smoke cloud? */
export function hiddenBySmoke(player, level) {
  return player.smokes.some((s) => Math.hypot(player.x - s.x, player.y - s.y) < 92);
}

/** Move a circle against the solid rects, axis by axis (slides along walls). */
function moveCircle(entity, dx, dy, radius, level) {
  const rects = level.walls.concat(level.doors.filter((d) => d.locked));
  const hits = (x, y) => {
    for (const r of rects) {
      const cx = Math.max(r.x, Math.min(x, r.x + r.w));
      const cy = Math.max(r.y, Math.min(y, r.y + r.h));
      const ddx = x - cx;
      const ddy = y - cy;
      if (ddx * ddx + ddy * ddy < radius * radius) return true;
    }
    return false;
  };
  if (!hits(entity.x + dx, entity.y)) entity.x += dx;
  if (!hits(entity.x, entity.y + dy)) entity.y += dy;
}

export function updateGuards(level, player, dt, game) {
  // While a screenshot scene is being staged, guards patrol only: no chase,
  // no catch, so the staged frame is the one the maker asked for.
  const chasing = game.alarm > ALARM_CHASE_THRESHOLD && !game.staging;
  let anyGuardSees = false;
  for (const guard of level.guards) {
    // Vision: cone + range + a clear line of sight + not in smoke.
    const sees =
      !hiddenBySmoke(player, level) &&
      inCone(guard.x, guard.y, guard.angle, GUARD_VISION_RANGE, GUARD_VISION_HALF_ANGLE, player.x, player.y) &&
      !lineBlocked(guard.x, guard.y, player.x, player.y, level);
    if (sees && !guard.seen) sfx.spotted();
    guard.seen = sees;
    if (sees) {
      anyGuardSees = true;
      const rate = ALARM_GUARD_RATE * (player.sneaking ? ALARM_SNEAK_FACTOR : 1);
      game.alarm = Math.min(100, game.alarm + rate * dt);
      guard.loseSightTimer = 0;
    } else {
      guard.loseSightTimer += dt;
    }

    if (chasing && guard.loseSightTimer < 3) {
      // Chase: straight at Wren, faster than her sneak, slower than her sprint.
      guard.mode = 'chase';
      const dx = player.x - guard.x;
      const dy = player.y - guard.y;
      const dist = Math.hypot(dx, dy) || 1;
      guard.angle = Math.atan2(dy, dx);
      moveCircle(guard, (dx / dist) * GUARD_CHASE_SPEED * dt, (dy / dist) * GUARD_CHASE_SPEED * dt, GUARD_RADIUS, level);
    } else {
      // Patrol: walk the waypoints, facing the direction of travel.
      guard.mode = 'patrol';
      const target = guard.waypoints[guard.waypointIndex];
      const dx = target[0] - guard.x;
      const dy = target[1] - guard.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 6) {
        guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
      } else {
        guard.angle = Math.atan2(dy, dx);
        moveCircle(guard, (dx / dist) * GUARD_PATROL_SPEED * dt, (dy / dist) * GUARD_PATROL_SPEED * dt, GUARD_RADIUS, level);
      }
    }

    // A guard's touch catches Wren (never while a screenshot is staged).
    if (!game.staging && Math.hypot(player.x - guard.x, player.y - guard.y) < GUARD_CATCH_DISTANCE) {
      game.caught = true;
      game.caughtReason = 'A guard grabbed Wren.';
    }
  }
  game.anyGuardSees = anyGuardSees;
}
