// The Velvet Vault — the game itself: state machine, loop, save and the
// staged ?shot= scenes the screenshots are taken from.
// States: title, briefing, play, paused, caught, levelComplete, campaignComplete.

import { VIEW_W, VIEW_H, SAVE_KEY, SMOKE_RADIUS, SMOKE_SECONDS } from './config.js';
import { LEVELS, loadLevel } from './levels.js';
import { createPlayer, updatePlayer } from './player.js';
import { updateGuards } from './guards.js';
import { updateCameras, updateAlarm } from './cameras.js';
import {
  renderGame,
  renderTitle,
  renderBriefing,
  renderPaused,
  renderCaught,
  renderLevelComplete,
  renderCampaignComplete,
} from './render.js';
import { initInput, isDown, moveVector, takeClicks, pointInRect } from './input.js';
import { sfx, unlockAudio } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { unlocked: 0, bestTake: 0 };
    const parsed = JSON.parse(raw);
    return {
      unlocked: Number.isInteger(parsed.unlocked) ? Math.max(0, Math.min(2, parsed.unlocked)) : 0,
      bestTake: Number.isInteger(parsed.bestTake) ? Math.max(0, parsed.bestTake) : 0,
    };
  } catch {
    return { unlocked: 0, bestTake: 0 };
  }
}

function storeSave(save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // A save that cannot be stored is a shrug, not a crash.
  }
}

const save = loadSave();

const game = {
  state: 'title',
  levelIndex: 0,
  level: null,
  player: null,
  loot: 0,
  campaignLoot: 0,
  targetTaken: false,
  alarm: 0,
  anyGuardSees: false,
  elapsed: 0,
  message: '',
  messageTimer: 0,
  caught: false,
  caughtReason: '',
  levelComplete: false,
  alarmBeepTimer: 0,
  buttons: [],
  shot: null,
};

function startLevel(index) {
  game.levelIndex = index;
  game.level = loadLevel(index);
  game.player = createPlayer(game.level.playerStart);
  game.loot = 0;
  game.targetTaken = false;
  game.alarm = 0;
  game.anyGuardSees = false;
  game.elapsed = 0;
  game.message = '';
  game.messageTimer = 0;
  game.caught = false;
  game.caughtReason = '';
  game.levelComplete = false;
  game.alarmBeepTimer = 0;
  game.state = 'play';
}

function finishLevel() {
  game.campaignLoot += game.loot;
  if (game.levelIndex < LEVELS.length - 1) {
    save.unlocked = Math.max(save.unlocked, game.levelIndex + 1);
    storeSave(save);
    game.state = 'levelComplete';
    sfx.levelComplete();
  } else {
    save.bestTake = Math.max(save.bestTake, game.campaignLoot);
    storeSave(save);
    game.state = 'campaignComplete';
    sfx.levelComplete();
  }
}

function retryLevel() {
  startLevel(game.levelIndex);
}

function toTitle() {
  game.state = 'title';
  game.level = null;
  game.player = null;
}

function handleButton(action) {
  sfx.click();
  if (action === 'start') startLevel(game.levelIndex);
  else if (action === 'resume') game.state = 'play';
  else if (action === 'restart') retryLevel();
  else if (action === 'retry') retryLevel();
  else if (action === 'next') startLevel(game.levelIndex + 1);
  else if (action === 'replay') {
    game.campaignLoot = 0;
    startLevel(0);
  } else if (action === 'title') toTitle();
}

function handleClicks() {
  for (const click of takeClicks()) {
    unlockAudio();
    for (const button of game.buttons) {
      if (pointInRect(click.x, click.y, button)) {
        handleButton(button.action);
        return;
      }
    }
    // A click anywhere on the title screen begins.
    if (game.state === 'title') {
      game.levelIndex = save.unlocked;
      game.state = 'briefing';
    }
  }
}

function update(dt) {
  if (game.state !== 'play') return;
  game.elapsed += dt;
  if (game.messageTimer > 0) game.messageTimer -= dt;

  const input = {
    move: moveVector(),
    sneak: isDown('shift'),
    interact: isDown('e'),
    smokePressed: false,
    empPressed: false,
  };
  // Edge-trigger the tools: a press only fires once per key-down.
  if (isDown('q') && !update._qDown) input.smokePressed = true;
  if (isDown('f') && !update._fDown) input.empPressed = true;
  update._qDown = isDown('q');
  update._fDown = isDown('f');

  updatePlayer(game.player, input, dt, game.level, game);
  updateGuards(game.level, game.player, dt, game);
  const cameraSees = updateCameras(game.level, game.player, dt, game);
  updateAlarm(game, dt, cameraSees);

  if (game.message && game.messageTimer <= 0 && game.message !== update._lastMessage) {
    update._lastMessage = game.message;
    game.messageTimer = 3.5;
  }
  if (game.caught) {
    game.state = 'caught';
    sfx.caught();
    return;
  }
  if (game.levelComplete) {
    finishLevel();
  }
}

function render() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  switch (game.state) {
    case 'title':
      game.buttons = renderTitle(ctx, save);
      break;
    case 'briefing':
      game.buttons = renderBriefing(ctx, LEVELS[game.levelIndex], game.levelIndex, save);
      break;
    case 'play':
    case 'paused':
      renderGame(ctx, game, game.level, game.player);
      if (game.state === 'paused') game.buttons = renderPaused(ctx);
      else game.buttons = [];
      break;
    case 'caught':
      renderGame(ctx, game, game.level, game.player);
      game.buttons = renderCaught(ctx, game.caughtReason);
      break;
    case 'levelComplete':
      game.buttons = renderLevelComplete(ctx, game.level, game.loot, game.campaignLoot);
      break;
    case 'campaignComplete':
      game.buttons = renderCampaignComplete(ctx, game.campaignLoot, save.bestTake);
      break;
    default:
      game.buttons = [];
  }
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  if (key === 'enter') {
    unlockAudio();
    if (game.state === 'title') {
      game.levelIndex = save.unlocked;
      game.state = 'briefing';
    } else if (game.state === 'briefing') {
      handleButton('start');
    } else if (game.state === 'caught') {
      handleButton('retry');
    } else if (game.state === 'levelComplete') {
      handleButton('next');
    } else if (game.state === 'campaignComplete') {
      handleButton('replay');
    }
  }
  if (key === 'escape' || key === 'p') {
    if (game.state === 'play') game.state = 'paused';
    else if (game.state === 'paused') game.state = 'play';
  }
  if (key === 'm') {
    // Mute toggle is handled by the audio module's state; kept simple here.
    sfx.click();
  }
}

// ---------------------------------------------------------------- ?shot= scenes
// A screenshot scene sets the game to a fixed, lively moment and then runs a
// fixed number of identical update steps, so the frame is the same every run.

function stageShot(kind) {
  if (kind === 'title') {
    game.state = 'title';
    return;
  }
  if (kind === 'escape') {
    // The campaign-complete screen, after a full three-contract run.
    game.campaignLoot = 7400;
    save.bestTake = Math.max(save.bestTake, 7400);
    game.state = 'campaignComplete';
    return;
  }
  if (kind === 'alarm') {
    // Contract 2, mid-chase: the alarm high, a guard closing in, a camera on her.
    startLevel(1);
    game.player.x = 650;
    game.player.y = 400;
    game.player.angle = Math.PI / 4;
    game.alarm = 78;
    const guard = game.level.guards[0];
    guard.x = 700;
    guard.y = 450;
    guard.mode = 'chase';
    game.loot = 1600;
    game.message = 'Spotted! Break line of sight — or run.';
    game.messageTimer = 99;
    stepFixed(60);
    return;
  }
  // Default: 'cover' — Contract 1 in full flow, everything visible in one frame.
  startLevel(0);
  game.player.x = 470;
  game.player.y = 520;
  game.player.angle = Math.PI / 4;
  game.player.sneaking = true;
  game.alarm = 32;
  game.loot = 400;
  game.level.loot[1].taken = true;
  game.message = 'Stay out of the cones. The Rose Portrait is upstairs, behind the locked door.';
  game.messageTimer = 99;
  stepFixed(90);
}

/** Run `steps` fixed 1/60s updates with no input, for a repeatable frame. */
function stepFixed(steps) {
  const frozen = { move: { x: 0, y: 0 }, sneak: true, interact: false, smokePressed: false, empPressed: false };
  game.staging = true;
  for (let i = 0; i < steps; i++) {
    game.elapsed += 1 / 60;
    updatePlayer(game.player, frozen, 1 / 60, game.level, game);
    updateGuards(game.level, game.player, 1 / 60, game);
    const cameraSees = updateCameras(game.level, game.player, 1 / 60, game);
    updateAlarm(game, 1 / 60, cameraSees);
  }
  game.staging = false;
  game.caught = false;
  // Keep the staged alarm and message, whatever the fixed steps did to them.
  if (game.shot === 'cover') {
    game.alarm = 32;
    game.messageTimer = 99;
  }
  if (game.shot === 'alarm') {
    game.alarm = 78;
    game.messageTimer = 99;
  }
}

// ---------------------------------------------------------------- boot

initInput(canvas);
window.addEventListener('keydown', onKeyDown);

const params = new URLSearchParams(window.location.search);
game.shot = params.get('shot');
if (game.shot) {
  stageShot(game.shot);
  render();
  window.__shotReady = true;
} else {
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    handleClicks();
    update(dt);
    render();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// A tiny handle for automated playtests: the current state, on demand.
window.__velvetVault = {
  state: () => game.state,
  alarm: () => game.alarm,
  loot: () => game.loot,
};
