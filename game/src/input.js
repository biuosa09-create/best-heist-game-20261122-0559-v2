// The Velvet Vault — keyboard and mouse input.
// One shared key set plus click hit-testing for the menu buttons.

const keys = new Set();
let mouseX = 0;
let mouseY = 0;
let clickQueue = [];

export function initInput(canvas) {
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
      event.preventDefault();
    }
    keys.add(key);
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.key.toLowerCase());
  });
  window.addEventListener('blur', () => keys.clear());
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  });
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    clickQueue.push({
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    });
  });
}

export function isDown(key) {
  return keys.has(key.toLowerCase());
}

/** True while any of the given keys is held. */
export function anyDown(...names) {
  return names.some((name) => keys.has(name.toLowerCase()));
}

/** Movement vector from WASD / arrows, normalised. */
export function moveVector() {
  let x = 0;
  let y = 0;
  if (anyDown('a', 'arrowleft')) x -= 1;
  if (anyDown('d', 'arrowright')) x += 1;
  if (anyDown('w', 'arrowup')) y -= 1;
  if (anyDown('s', 'arrowdown')) y += 1;
  if (x !== 0 && y !== 0) {
    const inv = 1 / Math.hypot(x, y);
    x *= inv;
    y *= inv;
  }
  return { x, y };
}

/** Consume clicks since the last frame; returns them as {x, y} points. */
export function takeClicks() {
  const out = clickQueue;
  clickQueue = [];
  return out;
}

/** True when the point lies inside the button rect. */
export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

export function mousePosition() {
  return { x: mouseX, y: mouseY };
}
