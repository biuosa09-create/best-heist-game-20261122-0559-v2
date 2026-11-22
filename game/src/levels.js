// The Velvet Vault — the three contracts.
// Each level is pure data: walls, locked doors, safes, loot, the marked target,
// guard patrols, sweeping cameras, the player's start and the getaway exit.
// The game loads a level by deep-copying its definition, so a replay is fresh.

const BORDER = [
  { x: 0, y: 56, w: 1280, h: 14 }, // top, under the HUD
  { x: 0, y: 706, w: 1280, h: 14 }, // bottom
  { x: 0, y: 56, w: 14, h: 650 }, // left
  { x: 1266, y: 56, w: 14, h: 650 }, // right
];

export const LEVELS = [
  {
    name: 'Contract 1 — The Gallery',
    shortName: 'Gallery',
    subtitle: 'Lift the Rose Portrait. Two guards, one camera, one locked door.',
    floorTint: '#2b2620',
    playerStart: { x: 180, y: 640 },
    exit: { x: 40, y: 640, w: 90, h: 56 },
    walls: [
      ...BORDER,
      // The back gallery: a locked room holding the portrait and a safe.
      { x: 820, y: 70, w: 16, h: 252 },
      { x: 820, y: 322, w: 180, h: 16 },
      { x: 1052, y: 322, w: 214, h: 16 },
      // Low cover blocks in the main hall.
      { x: 450, y: 480, w: 120, h: 18 },
      { x: 850, y: 520, w: 18, h: 120 },
    ],
    doors: [{ x: 1000, y: 322, w: 52, h: 16, label: 'Gallery door' }],
    safes: [{ x: 900, y: 150 }],
    loot: [
      { x: 1100, y: 280 },
      { x: 400, y: 550 },
      { x: 200, y: 620 },
    ],
    target: { x: 1150, y: 180, label: 'Rose Portrait' },
    guards: [
      { waypoints: [[300, 500], [700, 500], [700, 620], [300, 620]] },
      { waypoints: [[900, 450], [1150, 450], [1150, 600], [900, 600]] },
    ],
    cameras: [{ x: 640, y: 70, baseAngle: Math.PI / 2, sweep: 0.9, period: 6, phase: 0 }],
  },
  {
    name: 'Contract 2 — The Bank',
    shortName: 'Bank',
    subtitle: 'Crack the vault. Three guards, two cameras, two locked doors.',
    floorTint: '#262a2b',
    playerStart: { x: 250, y: 650 },
    exit: { x: 30, y: 650, w: 80, h: 46 },
    walls: [
      ...BORDER,
      // The vault, bottom right, behind a locked door in its top wall.
      { x: 880, y: 400, w: 16, h: 306 },
      { x: 880, y: 400, w: 170, h: 16 },
      { x: 1102, y: 400, w: 164, h: 16 },
      // The manager's office, top left, behind a locked door in its right wall.
      { x: 420, y: 70, w: 16, h: 110 },
      { x: 420, y: 232, w: 16, h: 68 },
      { x: 14, y: 300, w: 422, h: 16 },
      // Cover in the banking hall.
      { x: 560, y: 180, w: 18, h: 130 },
      { x: 700, y: 520, w: 130, h: 18 },
    ],
    doors: [
      { x: 1050, y: 400, w: 52, h: 16, label: 'Vault door' },
      { x: 420, y: 180, w: 16, h: 52, label: 'Office door' },
    ],
    safes: [
      { x: 960, y: 470 },
      { x: 150, y: 150 },
    ],
    loot: [
      { x: 650, y: 200 },
      { x: 600, y: 600 },
      { x: 1200, y: 650 },
    ],
    target: { x: 1120, y: 560, label: 'The Vault' },
    guards: [
      { waypoints: [[500, 420], [800, 420], [800, 580], [500, 580]] },
      { waypoints: [[150, 450], [150, 640], [450, 640], [450, 450]] },
      { waypoints: [[700, 150], [1000, 150], [1000, 300], [700, 300]] },
    ],
    cameras: [
      { x: 640, y: 70, baseAngle: Math.PI / 2, sweep: 0.9, period: 6, phase: 0 },
      { x: 1252, y: 560, baseAngle: Math.PI, sweep: 0.8, period: 7, phase: 2 },
    ],
  },
  {
    name: 'Contract 3 — The Casino',
    shortName: 'Casino',
    subtitle: 'Empty the high-roller room. Four guards, three cameras, two locked doors.',
    floorTint: '#2b2027',
    playerStart: { x: 520, y: 670 },
    exit: { x: 590, y: 655, w: 100, h: 45 },
    walls: [
      ...BORDER,
      // The high-roller room, top right, behind a locked door in its bottom wall.
      { x: 900, y: 70, w: 16, h: 260 },
      { x: 900, y: 330, w: 160, h: 16 },
      { x: 1112, y: 330, w: 154, h: 16 },
      // The cashier's cage, bottom left, behind a locked door in its top wall.
      { x: 14, y: 480, w: 166, h: 16 },
      { x: 232, y: 480, w: 148, h: 16 },
      { x: 380, y: 480, w: 16, h: 226 },
      // Rows of slot machines make cover on the casino floor.
      { x: 500, y: 200, w: 180, h: 26 },
      { x: 500, y: 300, w: 180, h: 26 },
      { x: 500, y: 560, w: 180, h: 26 },
      { x: 760, y: 150, w: 26, h: 120 },
    ],
    doors: [
      { x: 1060, y: 330, w: 52, h: 16, label: 'High-roller door' },
      { x: 180, y: 480, w: 52, h: 16, label: 'Cashier door' },
    ],
    safes: [
      { x: 980, y: 150 },
      { x: 120, y: 580 },
    ],
    loot: [
      { x: 600, y: 250 },
      { x: 620, y: 620 },
      { x: 1150, y: 280 },
      { x: 850, y: 450 },
    ],
    target: { x: 1130, y: 180, label: 'The Diamond Chip' },
    guards: [
      { waypoints: [[480, 120], [820, 120], [820, 220], [480, 220]] },
      { waypoints: [[480, 400], [820, 400], [820, 640], [480, 640]] },
      { waypoints: [[950, 420], [1200, 420], [1200, 620], [950, 620]] },
      { waypoints: [[150, 120], [400, 120], [400, 380], [150, 380]] },
    ],
    cameras: [
      { x: 640, y: 70, baseAngle: Math.PI / 2, sweep: 0.9, period: 6, phase: 0 },
      { x: 1252, y: 500, baseAngle: Math.PI, sweep: 0.8, period: 7, phase: 2 },
      { x: 450, y: 692, baseAngle: -Math.PI / 2, sweep: 0.8, period: 8, phase: 4 },
    ],
  },
];

/** A fresh, mutable copy of a level definition, with run-time fields added. */
export function loadLevel(index) {
  const def = LEVELS[index];
  const level = JSON.parse(JSON.stringify(def));
  level.index = index;
  level.doors = level.doors.map((d) => ({ ...d, locked: true, progress: 0 }));
  level.safes = level.safes.map((s) => ({ ...s, taken: false, progress: 0 }));
  level.loot = level.loot.map((l) => ({ ...l, taken: false }));
  level.target = { ...level.target, taken: false, progress: 0 };
  level.guards = level.guards.map((g) => ({
    waypoints: g.waypoints,
    x: g.waypoints[0][0],
    y: g.waypoints[0][1],
    waypointIndex: 1,
    angle: 0,
    mode: 'patrol',
    seen: false,
    loseSightTimer: 0,
    alertTimer: 0,
  }));
  level.cameras = level.cameras.map((c) => ({
    ...c,
    angle: c.baseAngle,
    disabledTimer: 0,
    seen: false,
  }));
  return level;
}
