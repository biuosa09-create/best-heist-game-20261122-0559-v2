// The Velvet Vault — everything drawn: the room, the cones, the HUD and
// every screen. One canvas, one module, so the look stays consistent.

import { VIEW_W, VIEW_H, HUD_H, COLORS, FLOOR } from './config.js';
import { LEVELS } from './levels.js';

function drawCone(ctx, x, y, angle, range, halfAngle, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawFloor(ctx, level) {
  ctx.fillStyle = level.floorTint;
  ctx.fillRect(0, HUD_H, VIEW_W, VIEW_H - HUD_H);
  // Checker tiles, so the floor reads as a room and not a void.
  const tile = 64;
  ctx.fillStyle = COLORS.floorAlt;
  for (let ty = HUD_H; ty < VIEW_H; ty += tile) {
    for (let tx = 0; tx < VIEW_W; tx += tile) {
      if (((tx / tile) | 0) % 2 === ((ty / tile) | 0) % 2) continue;
      ctx.fillRect(tx, ty, tile, tile);
    }
  }
}

function drawWalls(ctx, level) {
  for (const wall of level.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.strokeStyle = COLORS.wallTrim;
    ctx.lineWidth = 1;
    ctx.strokeRect(wall.x + 0.5, wall.y + 0.5, wall.w - 1, wall.h - 1);
  }
}

function drawDoors(ctx, level) {
  for (const door of level.doors) {
    ctx.fillStyle = door.locked ? COLORS.door : COLORS.doorOpen;
    ctx.fillRect(door.x, door.y, door.w, door.h);
    ctx.strokeStyle = '#f2e6c9';
    ctx.lineWidth = 1;
    ctx.strokeRect(door.x + 0.5, door.y + 0.5, door.w - 1, door.h - 1);
    if (door.locked) {
      // A small drawn padlock, so the lock reads even without an emoji font.
      const cx = door.x + door.w / 2;
      const cy = door.y + door.h / 2;
      ctx.strokeStyle = '#f2e6c9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 5, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = '#f2e6c9';
      ctx.fillRect(cx - 5, cy - 2, 10, 7);
    }
  }
}

function drawSafes(ctx, level) {
  for (const safe of level.safes) {
    if (safe.taken) continue;
    ctx.fillStyle = COLORS.safe;
    ctx.fillRect(safe.x - 23, safe.y - 23, 46, 46);
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 2;
    ctx.strokeRect(safe.x - 23, safe.y - 23, 46, 46);
    ctx.beginPath();
    ctx.arc(safe.x, safe.y, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#212529';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', safe.x, safe.y + 1);
    ctx.fillStyle = '#f2e6c9';
    ctx.font = '10px sans-serif';
    ctx.fillText('SAFE', safe.x, safe.y + 32);
  }
}

function drawLoot(ctx, level) {
  for (const item of level.loot) {
    if (item.taken) continue;
    ctx.fillStyle = COLORS.loot;
    ctx.beginPath();
    ctx.arc(item.x, item.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a6d00';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#8a6d00';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', item.x, item.y + 1);
  }
}

function drawTarget(ctx, level) {
  const t = level.target;
  if (t.taken) return;
  // A pulsing gold ring marks the thing the whole contract is about.
  const pulse = 1 + 0.12 * Math.sin(performance.now() / 300);
  ctx.strokeStyle = COLORS.target;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(t.x, t.y, 26 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#3d0c1e';
  ctx.fillRect(t.x - 20, t.y - 20, 40, 40);
  ctx.strokeStyle = COLORS.target;
  ctx.lineWidth = 2;
  ctx.strokeRect(t.x - 20, t.y - 20, 40, 40);
  ctx.fillStyle = COLORS.target;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', t.x, t.y + 1);
  ctx.fillStyle = '#f2e6c9';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(t.label.toUpperCase(), t.x, t.y + 32);
}

function drawExit(ctx, level, targetTaken) {
  const e = level.exit;
  ctx.fillStyle = targetTaken ? 'rgba(47, 158, 68, 0.45)' : 'rgba(47, 158, 68, 0.15)';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = COLORS.exit;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.setLineDash([]);
  ctx.fillStyle = targetTaken ? '#b2f2bb' : '#69b578';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2);
}

function drawSmoke(ctx, player) {
  for (const s of player.smokes) {
    ctx.fillStyle = COLORS.smoke;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 92, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGuards(ctx, level) {
  for (const guard of level.guards) {
    drawCone(ctx, guard.x, guard.y, guard.angle, 235, 0.61, COLORS.cone, COLORS.coneEdge);
  }
  for (const guard of level.guards) {
    ctx.fillStyle = COLORS.guardSuit;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = guard.mode === 'chase' ? '#ff8787' : '#f2e6c9';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Facing tick.
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.lineTo(guard.x + Math.cos(guard.angle) * 18, guard.y + Math.sin(guard.angle) * 18);
    ctx.strokeStyle = '#f2e6c9';
    ctx.stroke();
    if (guard.seen) {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', guard.x, guard.y - 22);
    }
  }
}

function drawCameras(ctx, level) {
  for (const camera of level.cameras) {
    if (camera.disabledTimer <= 0) {
      drawCone(ctx, camera.x, camera.y, camera.angle, 205, 0.49, COLORS.cameraCone, COLORS.cameraConeEdge);
    }
  }
  for (const camera of level.cameras) {
    ctx.fillStyle = camera.disabledTimer > 0 ? '#555' : '#f59f00';
    ctx.beginPath();
    ctx.arc(camera.x, camera.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f2e6c9';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(camera.x, camera.y);
    ctx.lineTo(
      camera.x + Math.cos(camera.angle) * 14,
      camera.y + Math.sin(camera.angle) * 14,
    );
    ctx.stroke();
    if (camera.seen) {
      ctx.fillStyle = '#ffd43b';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', camera.x, camera.y - 18);
    }
  }
}

function drawPlayer(ctx, player) {
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e6fffa';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x + Math.cos(player.angle) * 18, player.y + Math.sin(player.angle) * 18);
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Hood point.
  ctx.fillStyle = COLORS.playerDark;
  ctx.beginPath();
  ctx.arc(player.x - Math.cos(player.angle) * 4, player.y - Math.sin(player.angle) * 4, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2e6c9';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WREN', player.x, player.y - 20);
  if (player.sneaking) {
    ctx.fillStyle = '#adb5bd';
    ctx.font = '10px sans-serif';
    ctx.fillText('sneaking', player.x, player.y + 24);
  }
}

function drawHud(ctx, game, level, player) {
  ctx.fillStyle = COLORS.hud;
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.strokeStyle = COLORS.wallTrim;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HUD_H - 1);
  ctx.lineTo(VIEW_W, HUD_H - 1);
  ctx.stroke();

  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(level.name, 16, 20);
  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#c9b896';
  const objective = game.targetTaken ? 'Target secured — reach the EXIT!' : `Steal ${level.target.label} — then reach the EXIT`;
  ctx.fillText(objective, 16, 40);

  // Alarm meter.
  const ax = 560;
  const aw = 260;
  ctx.fillStyle = '#f2e6c9';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', ax, 20);
  ctx.fillStyle = '#3a3230';
  ctx.fillRect(ax, 30, aw, 14);
  const alarmColor = game.alarm > 50 ? COLORS.alarm : COLORS.alarmLow;
  ctx.fillStyle = alarmColor;
  ctx.fillRect(ax, 30, (aw * game.alarm) / 100, 14);
  ctx.strokeStyle = '#f2e6c9';
  ctx.lineWidth = 1;
  ctx.strokeRect(ax + 0.5, 30.5, aw, 14);
  ctx.fillStyle = '#f2e6c9';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`${Math.floor(game.alarm)}%`, ax + aw + 8, 37);
  if (game.alarm > 50) {
    ctx.fillStyle = COLORS.alarm;
    ctx.fillText('CHASE!', ax + aw + 52, 37);
  }

  // Loot and tools.
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.loot;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(`$${game.loot.toLocaleString()}`, 1080, 20);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '12px sans-serif';
  ctx.fillText(`Smoke [Q] ×${player.smokeLeft}   EMP [F] ×${player.empLeft}`, 1080, 40);

  // Interaction prompt and progress.
  if (player.interacting) {
    const cx = VIEW_W / 2;
    const cy = VIEW_H - 34;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f2e6c9';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`Hold E — ${player.interactLabel}`, cx, cy - 16);
    ctx.fillStyle = '#3a3230';
    ctx.fillRect(cx - 100, cy - 6, 200, 10);
    ctx.fillStyle = COLORS.loot;
    ctx.fillRect(cx - 100, cy - 6, 200 * player.interactProgress, 10);
    ctx.strokeStyle = '#f2e6c9';
    ctx.strokeRect(cx - 100.5, cy - 6.5, 200, 10);
  } else if (player.interactLabel) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c9b896';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Hold E — ${player.interactLabel}`, VIEW_W / 2, VIEW_H - 40);
  }

  // Transient message line.
  if (game.messageTimer > 0) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(game.message, VIEW_W / 2, HUD_H + 24);
  }
}

function drawMinimap(ctx, level, player) {
  const scale = 0.14;
  const mw = VIEW_W * scale;
  const mh = VIEW_H * scale;
  const mx = VIEW_W - mw - 12;
  const my = HUD_H + 12;
  ctx.fillStyle = COLORS.minimapBg;
  ctx.fillRect(mx, my, mw, mh);
  ctx.strokeStyle = COLORS.wallTrim;
  ctx.lineWidth = 1;
  ctx.strokeRect(mx + 0.5, my + 0.5, mw - 1, mh - 1);
  const px = (x) => mx + x * scale;
  const py = (y) => my + y * scale;
  ctx.fillStyle = '#8d99ae';
  for (const wall of level.walls) ctx.fillRect(px(wall.x), py(wall.y), Math.max(1, wall.w * scale), Math.max(1, wall.h * scale));
  ctx.fillStyle = COLORS.loot;
  for (const item of level.loot) {
    if (!item.taken) ctx.fillRect(px(item.x) - 2, py(item.y) - 2, 4, 4);
  }
  ctx.fillStyle = COLORS.target;
  if (!level.target.taken) ctx.fillRect(px(level.target.x) - 3, py(level.target.y) - 3, 6, 6);
  ctx.fillStyle = '#ff6b6b';
  for (const guard of level.guards) ctx.fillRect(px(guard.x) - 2, py(guard.y) - 2, 4, 4);
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(px(player.x), py(player.y), 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawPanel(ctx, title, lines, buttons) {
  ctx.fillStyle = 'rgba(10, 8, 6, 0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const pw = 640;
  const ph = 120 + lines.length * 30 + buttons.length * 56;
  const px = (VIEW_W - pw) / 2;
  const py = (VIEW_H - ph) / 2;
  ctx.fillStyle = '#1d1812';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = COLORS.wallTrim;
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, pw, ph);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, VIEW_W / 2, py + 48);
  ctx.font = '15px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillStyle = i === 0 ? '#ffd166' : '#e8dcc0';
    ctx.fillText(line, VIEW_W / 2, py + 96 + i * 30);
  });
  const rects = [];
  buttons.forEach((button, i) => {
    const bw = 260;
    const bh = 42;
    const bx = (VIEW_W - bw) / 2;
    const by = py + ph - 66 - (buttons.length - 1 - i) * 56;
    ctx.fillStyle = '#6b4f1d';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = COLORS.wallTrim;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#f2e6c9';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(button.label, VIEW_W / 2, by + bh / 2);
    rects.push({ x: bx, y: by, w: bw, h: bh, action: button.action });
  });
  return rects;
}

export function renderGame(ctx, game, level, player) {
  drawFloor(ctx, level);
  drawExit(ctx, level, game.targetTaken);
  drawLoot(ctx, level);
  drawSafes(ctx, level);
  drawTarget(ctx, level);
  drawWalls(ctx, level);
  drawDoors(ctx, level);
  drawSmoke(ctx, player);
  drawGuards(ctx, level);
  drawCameras(ctx, level);
  drawPlayer(ctx, player);
  drawHud(ctx, game, level, player);
  drawMinimap(ctx, level, player);
}

export function renderTitle(ctx, save) {
  ctx.fillStyle = '#14100c';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // A velvet curtain backdrop.
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#4a1020' : '#3a0c18';
    ctx.fillRect(i * 80, 0, 80, VIEW_H);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#f2e6c9';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('THE VELVET VAULT', VIEW_W / 2, 170);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'italic 22px Georgia, serif';
  ctx.fillText('Three contracts. One thief. No alarms — if you are good.', VIEW_W / 2, 235);
  ctx.fillStyle = '#e8dcc0';
  ctx.font = '16px sans-serif';
  const lines = [
    'WASD / Arrows — move      Shift — sneak (slower, harder to spot)',
    'Hold E — pick locks, crack safes ($1,200), lift the target ($2,500)',
    'Q — smoke bomb (×2)      F — EMP, cameras dark for 10s      Esc — pause',
    'Guards and cameras raise the ALARM when they see you. Over 50% they chase.',
    'At 100%, or if a guard touches you, you are caught. Grab the target, reach the EXIT.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 310 + i * 32));
  if (save.bestTake > 0) {
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Best take so far: $${save.bestTake.toLocaleString()}`, VIEW_W / 2, 500);
  }
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Press Enter or click to begin', VIEW_W / 2, 560);
  return [];
}

export function renderBriefing(ctx, level, index, save) {
  ctx.fillStyle = level.floorTint;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const locked = index > 0 && save.unlocked < index;
  const lines = [
    level.subtitle,
    locked ? 'This contract is still locked — finish the one before it.' : 'Press Enter or click Begin to start the job.',
  ];
  return drawPanel(ctx, level.name, lines, locked ? [] : [{ label: 'Begin the job', action: 'start' }]);
}

export function renderPaused(ctx) {
  return drawPanel(ctx, 'Paused', ['Take a breath. The guards will wait.'], [
    { label: 'Resume', action: 'resume' },
    { label: 'Restart contract', action: 'restart' },
    { label: 'Back to title', action: 'title' },
  ]);
}

export function renderCaught(ctx, reason) {
  return drawPanel(ctx, 'CAUGHT!', [reason, 'The crew is already planning the next job.'], [
    { label: 'Try again', action: 'retry' },
    { label: 'Back to title', action: 'title' },
  ]);
}

export function renderLevelComplete(ctx, level, take, total) {
  const lines = [
    `${level.name} — clean getaway.`,
    `This contract: $${take.toLocaleString()}`,
    `Campaign total so far: $${total.toLocaleString()}`,
  ];
  return drawPanel(ctx, 'GETAWAY!', lines, [{ label: 'Next contract', action: 'next' }]);
}

export function renderCampaignComplete(ctx, total, bestTake) {
  const lines = [
    'Gallery, Bank, Casino — all three contracts, all clean.',
    `Total take: $${total.toLocaleString()}`,
    `Best take: $${bestTake.toLocaleString()}`,
    'Wren retires to a quiet life. Probably.',
  ];
  return drawPanel(ctx, 'THE VELVET VAULT — COMPLETE', lines, [{ label: 'Play again', action: 'replay' }]);
}
