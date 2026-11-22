// The Velvet Vault — synthesised WebAudio sounds.
// No audio files: every cue is an oscillator (and a little filtered noise)
// built at run time, so the game stays a handful of static files.

let ctx = null;
let master = null;
let muted = false;

function ensureContext() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Call from the first user gesture so the browser lets sound start. */
export function unlockAudio() {
  const c = ensureContext();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

export function setMuted(value) {
  muted = !!value;
  if (master) master.gain.value = muted ? 0 : 0.22;
}

function tone(freq, seconds, type = 'sine', volume = 0.5, slideTo = null, delay = 0) {
  if (muted) return;
  const c = ensureContext();
  if (!c || !master) return;
  try {
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + seconds);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.05);
  } catch {
    // Sound is garnish; a failed cue must never break the game.
  }
}

function noiseBurst(seconds, volume = 0.3, delay = 0) {
  if (muted) return;
  const c = ensureContext();
  if (!c || !master) return;
  try {
    const t0 = c.currentTime + delay;
    const len = Math.max(1, Math.floor(c.sampleRate * seconds));
    const buffer = c.createBuffer(1, len, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    const gain = c.createGain();
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t0);
  } catch {
    // Ignore audio failures.
  }
}

export const sfx = {
  pickup() {
    tone(880, 0.12, 'sine', 0.45);
    tone(1318, 0.16, 'sine', 0.35, null, 0.07);
  },
  safeOpen() {
    tone(220, 0.1, 'square', 0.25);
    tone(330, 0.1, 'square', 0.25, null, 0.09);
    tone(523, 0.22, 'sine', 0.4, null, 0.18);
  },
  targetGrab() {
    tone(523, 0.14, 'triangle', 0.5);
    tone(659, 0.14, 'triangle', 0.5, null, 0.1);
    tone(784, 0.3, 'triangle', 0.5, null, 0.2);
  },
  lockpickTick() {
    tone(1400, 0.04, 'square', 0.18);
  },
  doorUnlock() {
    tone(180, 0.18, 'square', 0.3, 90);
    noiseBurst(0.12, 0.2, 0.05);
  },
  spotted() {
    tone(196, 0.22, 'sawtooth', 0.4, 392);
  },
  alarmLoop() {
    tone(660, 0.16, 'square', 0.22, 520);
  },
  smoke() {
    noiseBurst(0.5, 0.35);
  },
  emp() {
    tone(1200, 0.5, 'sawtooth', 0.3, 80);
  },
  caught() {
    tone(220, 0.5, 'sawtooth', 0.5, 55);
    tone(110, 0.7, 'sawtooth', 0.4, 40, 0.15);
  },
  levelComplete() {
    tone(523, 0.14, 'triangle', 0.5);
    tone(659, 0.14, 'triangle', 0.5, null, 0.12);
    tone(784, 0.14, 'triangle', 0.5, null, 0.24);
    tone(1046, 0.4, 'triangle', 0.5, null, 0.36);
  },
  click() {
    tone(700, 0.06, 'sine', 0.3);
  },
};
