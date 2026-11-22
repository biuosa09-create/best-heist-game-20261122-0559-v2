// The Velvet Vault — shared tuning and palette.
// One place for every number the rest of the game reads, so a level designer
// can retune the heist without touching game logic.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const HUD_H = 56;

// Play area: the floor the thief and the guards walk on, inside the border walls.
export const FLOOR = { x: 14, y: HUD_H + 14, w: VIEW_W - 28, h: VIEW_H - HUD_H - 28 };

export const PLAYER_RADIUS = 12;
export const PLAYER_WALK_SPEED = 175;
export const PLAYER_SNEAK_SPEED = 88;
export const GUARD_RADIUS = 13;
export const GUARD_PATROL_SPEED = 72;
export const GUARD_CHASE_SPEED = 152;
export const GUARD_CATCH_DISTANCE = 26;

export const GUARD_VISION_RANGE = 235;
export const GUARD_VISION_HALF_ANGLE = 0.61; // ~35 degrees
export const CAMERA_VISION_RANGE = 205;
export const CAMERA_VISION_HALF_ANGLE = 0.49; // ~28 degrees

// Alarm: 0..100. Guards and cameras add to it while they see Wren; it drains
// slowly while nobody does. Above 50 the guards chase; at 100 she is caught.
export const ALARM_GUARD_RATE = 26;
export const ALARM_CAMERA_RATE = 20;
export const ALARM_SNEAK_FACTOR = 0.5;
export const ALARM_DECAY_RATE = 5;
export const ALARM_CHASE_THRESHOLD = 50;
export const ALARM_CAUGHT = 100;

export const LOCKPICK_SECONDS = 1.2;
export const SAFE_CRACK_SECONDS = 2.0;
export const TARGET_GRAB_SECONDS = 2.5;
export const INTERACT_RANGE = 56;

export const SAFE_VALUE = 1200;
export const LOOT_VALUE = 400;
export const TARGET_VALUE = 2500;

export const SMOKE_COUNT = 2;
export const SMOKE_RADIUS = 92;
export const SMOKE_SECONDS = 6;
export const EMP_COUNT = 1;
export const EMP_SECONDS = 10;

export const SAVE_KEY = 'velvetVaultSaveV1';

export const COLORS = {
  floor: '#2b2620',
  floorAlt: '#322c24',
  wall: '#17130f',
  wallTrim: '#c9a227',
  hud: '#14100c',
  hudText: '#f2e6c9',
  alarm: '#e5484d',
  alarmLow: '#c9a227',
  player: '#2dd4bf',
  playerDark: '#0f766e',
  guard: '#8b2f39',
  guardSuit: '#3d2b2b',
  cone: 'rgba(229, 72, 77, 0.20)',
  coneEdge: 'rgba(229, 72, 77, 0.55)',
  cameraCone: 'rgba(245, 158, 11, 0.18)',
  cameraConeEdge: 'rgba(245, 158, 11, 0.55)',
  loot: '#ffd166',
  safe: '#8d99ae',
  target: '#ff5d8f',
  door: '#6b4f1d',
  doorOpen: '#3f6b2f',
  exit: '#2f9e44',
  smoke: 'rgba(200, 200, 200, 0.35)',
  minimapBg: 'rgba(10, 8, 6, 0.72)',
};
