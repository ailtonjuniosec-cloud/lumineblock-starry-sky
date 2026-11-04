/**
 * LumineBlock sound identity — fully synthesized with Web Audio (original sounds,
 * zero audio files to download). Soft sine/triangle voices, crystalline overtones,
 * gentle envelopes. A voice cap and per-sound cooldown prevent pile-ups.
 */
export type Sfx = "select" | "place" | "line" | "column" | "multi" | "record" | "gameOver";

export interface AudioPrefs {
  sfx: boolean;
  sfxVolume: number;
  ambient: boolean;
  ambientVolume: number;
}

let ctx: AudioContext | null = null;
let sfxBus: GainNode | null = null;
let ambBus: GainNode | null = null;
let prefs: AudioPrefs = { sfx: true, sfxVolume: 0.7, ambient: false, ambientVolume: 0.4 };
let active = 0;
const MAX_VOICES = 10;
const COOLDOWN = 0.05;
const last: Partial<Record<Sfx, number>> = {};

/** Perceptual curve so the slider feels linear; capped so nothing is ever loud. */
export const toGain = (v: number, max: number) => Math.pow(Math.min(1, Math.max(0, v)), 2) * max;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    // "ambient" lets iOS honour the silent switch and mix with other audio.
    try {
      const s = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
      if (s) s.type = "ambient";
    } catch {
      /* unsupported */
    }
    ctx = new AC({ latencyHint: "interactive" });
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    comp.connect(ctx.destination);
    sfxBus = ctx.createGain();
    ambBus = ctx.createGain();
    sfxBus.gain.value = toGain(prefs.sfxVolume, 0.9);
    ambBus.gain.value = 0;
    sfxBus.connect(comp);
    ambBus.connect(comp);
  }
  if (ctx.state === "suspended" && document.visibilityState === "visible") void ctx.resume();
  return ctx;
}

function tone(
  bus: GainNode,
  freq: number,
  at: number,
  dur: number,
  gain: number,
  type: OscillatorType = "sine",
  attack = 0.006,
) {
  if (!ctx || active >= MAX_VOICES) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(bus);
  active++;
  o.onended = () => {
    active--;
    o.disconnect();
    g.disconnect();
  };
  o.start(at);
  o.stop(at + dur + 0.02);
}

/** A soft bell: fundamental + quiet octave shimmer. */
function chime(freq: number, at: number, dur: number, gain: number) {
  if (!sfxBus) return;
  tone(sfxBus, freq, at, dur, gain, "sine", 0.008);
  tone(sfxBus, freq * 2, at, dur * 0.55, gain * 0.22, "sine", 0.004);
}

export function playSfx(name: Sfx) {
  if (!prefs.sfx || prefs.sfxVolume <= 0) return;
  const c = ensure();
  if (!c || !sfxBus || c.state !== "running") return;
  const now = c.currentTime;
  if (now - (last[name] ?? -1) < COOLDOWN) return;
  last[name] = now;
  const t = now + 0.005;
  switch (name) {
    case "select":
      chime(1318.5, t, 0.16, 0.05);
      break;
    case "place":
      tone(sfxBus, 587.3, t, 0.16, 0.08, "triangle", 0.003);
      tone(sfxBus, 1174.7, t, 0.09, 0.025, "sine", 0.003);
      break;
    case "line":
      [1046.5, 1318.5, 1568].forEach((f, i) => chime(f, t + i * 0.06, 0.6, 0.06));
      break;
    case "column":
      [880, 1108.7, 1318.5].forEach((f, i) => chime(f, t + i * 0.06, 0.6, 0.06));
      break;
    case "multi":
      [1046.5, 1318.5, 1568, 1975.5, 2349.3].forEach((f, i) => chime(f, t + i * 0.055, 0.8, 0.055));
      break;
    case "record":
      [1568, 2093, 2637, 3136].forEach((f, i) => chime(f, t + i * 0.05, 0.45, 0.035));
      break;
    case "gameOver":
      [784, 659.3, 523.3].forEach((f, i) => chime(f, t + i * 0.2, 1.3, 0.06));
      break;
  }
}

/* ---------------- Ambient pad ---------------- */
let amb: { stop: () => void } | null = null;

function startAmbient() {
  if (amb || !ctx || !ambBus || ctx.state !== "running") return;
  const c = ctx;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.4;
  const pad = c.createGain();
  pad.gain.value = 0.0001;
  pad.gain.exponentialRampToValueAtTime(0.12, c.currentTime + 3);
  filter.connect(pad).connect(ambBus);
  const oscs: OscillatorNode[] = [];
  // Cmaj9 voicing, slightly detuned for a slow, breathing chorus.
  [130.81, 196, 246.94, 293.66, 329.63].forEach((f, i) => {
    const o = c.createOscillator();
    o.type = i < 2 ? "sine" : "triangle";
    o.frequency.value = f;
    o.detune.value = (i % 2 ? 1 : -1) * 6;
    const g = c.createGain();
    g.gain.value = i < 2 ? 0.35 : 0.12;
    const lfo = c.createOscillator();
    const lg = c.createGain();
    lfo.frequency.value = 0.05 + i * 0.023;
    lg.gain.value = g.gain.value * 0.6;
    lfo.connect(lg).connect(g.gain);
    o.connect(g).connect(filter);
    o.start();
    lfo.start();
    oscs.push(o, lfo);
  });
  // Occasional distant star twinkles.
  let timer: ReturnType<typeof setTimeout>;
  const notes = [1568, 1760, 2093, 2349.3, 2637];
  const twinkle = () => {
    if (c.state === "running" && ambBus) tone(ambBus, notes[Math.floor(Math.random() * notes.length)]!, c.currentTime, 2.2, 0.025, "sine", 0.4);
    timer = setTimeout(twinkle, 4000 + Math.random() * 6000);
  };
  timer = setTimeout(twinkle, 2500);
  amb = {
    stop() {
      clearTimeout(timer);
      const t = c.currentTime;
      pad.gain.cancelScheduledValues(t);
      pad.gain.setTargetAtTime(0.0001, t, 0.4);
      oscs.forEach((o) => o.stop(t + 2));
      setTimeout(() => {
        filter.disconnect();
        pad.disconnect();
      }, 2200);
    },
  };
}

function stopAmbient() {
  amb?.stop();
  amb = null;
}

function syncAmbient() {
  if (!ctx || !ambBus) return;
  ambBus.gain.setTargetAtTime(prefs.ambient ? toGain(prefs.ambientVolume, 0.8) : 0, ctx.currentTime, 0.2);
  if (prefs.ambient && prefs.ambientVolume > 0 && ctx.state === "running") startAmbient();
  else if (!prefs.ambient) stopAmbient();
}

export function configureAudio(p: AudioPrefs) {
  prefs = p;
  if (!ctx || !sfxBus) return;
  sfxBus.gain.setTargetAtTime(toGain(p.sfxVolume, 0.9), ctx.currentTime, 0.05);
  syncAmbient();
}

/** Call from a user gesture: browsers only allow audio after interaction. */
export function unlockAudio() {
  const c = ensure();
  if (!c) return;
  void c.resume().then(syncAmbient);
}

export function setAudioVisible(visible: boolean) {
  if (!ctx) return;
  if (visible) void ctx.resume().then(syncAmbient);
  else void ctx.suspend();
}
