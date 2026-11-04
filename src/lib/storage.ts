import { useSyncExternalStore } from "react";
import { isBoardSize, type BoardSize } from "@/game/engine";
import { isLocale, type LocaleCode } from "@/i18n/languages";

export type ThemeMode = "light" | "dark" | "auto";
export interface Settings {
  theme: ThemeMode;
  boardSize: BoardSize;
  animations: boolean;
  effects: boolean;
  haptics: boolean;
  sfx: boolean;
  sfxVolume: number;
  ambient: boolean;
  ambientVolume: number;
  language: LocaleCode | "auto";
}
export interface Stats {
  best: number;
  games: number;
  last: number;
  bestLines: number;
  totalScore: number;
  bestBySize: Record<string, number>;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "auto",
  boardSize: 8,
  animations: true,
  effects: true,
  haptics: true,
  sfx: true,
  sfxVolume: 0.7,
  ambient: false,
  ambientVolume: 0.4,
  language: "auto",
};
export const EMPTY_STATS: Stats = {
  best: 0,
  games: 0,
  last: 0,
  bestLines: 0,
  totalScore: 0,
  bestBySize: {},
};

function createStore<T extends object>(key: string, defaults: T, sanitize: (v: T) => T = (v) => v) {
  let value: T = defaults;
  let loaded = false;
  const listeners = new Set<() => void>();
  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = localStorage.getItem(key);
      if (raw) value = sanitize({ ...defaults, ...JSON.parse(raw) });
    } catch {
      /* ignore corrupt data */
    }
  };
  return {
    get: () => (load(), value),
    set(patch: Partial<T>) {
      load();
      value = sanitize({ ...value, ...patch });
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage full / private mode */
      }
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    defaults,
  };
}

export const settingsStore = createStore<Settings>("lumineblock.settings", DEFAULT_SETTINGS, (s) => ({
  ...s,
  boardSize: isBoardSize(s.boardSize) ? s.boardSize : 8,
  theme: ["light", "dark", "auto"].includes(s.theme) ? s.theme : "auto",
  sfxVolume: clamp01(s.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
  ambientVolume: clamp01(s.ambientVolume, DEFAULT_SETTINGS.ambientVolume),
  language: s.language === "auto" || isLocale(s.language) ? s.language : "auto",
}));
function clamp01(v: unknown, d: number) {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : d;
}
export const statsStore = createStore<Stats>("lumineblock.stats", EMPTY_STATS, (v) => {
  const { history: _drop, ...rest } = v as Stats & { history?: unknown };
  return rest;
});

export function useSettings(): Settings {
  return useSyncExternalStore(settingsStore.subscribe, settingsStore.get, () => DEFAULT_SETTINGS);
}
export function useStats(): Stats {
  return useSyncExternalStore(statsStore.subscribe, statsStore.get, () => EMPTY_STATS);
}

/** Pure reducer for recording a finished game (testable). */
export function withGameResult(s: Stats, score: number, size: number, lines: number): Stats {
  const key = String(size);
  return {
    best: Math.max(s.best, score),
    games: s.games + 1,
    last: score,
    bestLines: Math.max(s.bestLines, lines),
    totalScore: s.totalScore + score,
    bestBySize: { ...s.bestBySize, [key]: Math.max(s.bestBySize[key] ?? 0, score) },
  };
}

export function recordGame(score: number, size: number, lines: number) {
  statsStore.set(withGameResult(statsStore.get(), score, size, lines));
}
