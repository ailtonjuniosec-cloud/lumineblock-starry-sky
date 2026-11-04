import { useSyncExternalStore } from "react";
import { isBoardSize, type BoardSize } from "@/game/engine";

export type ThemeMode = "light" | "dark" | "auto";
export interface Settings {
  theme: ThemeMode;
  boardSize: BoardSize;
  animations: boolean;
  effects: boolean;
  haptics: boolean;
}
export interface GameRecord {
  score: number;
  size: number;
  at: number;
}
export interface Stats {
  best: number;
  games: number;
  last: number;
  bestLines: number;
  totalScore: number;
  history: GameRecord[];
  bestBySize: Record<string, number>;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "auto",
  boardSize: 8,
  animations: true,
  effects: true,
  haptics: true,
};
export const EMPTY_STATS: Stats = {
  best: 0,
  games: 0,
  last: 0,
  bestLines: 0,
  totalScore: 0,
  history: [],
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
}));
export const statsStore = createStore<Stats>("lumineblock.stats", EMPTY_STATS);

export function useSettings(): Settings {
  return useSyncExternalStore(settingsStore.subscribe, settingsStore.get, () => DEFAULT_SETTINGS);
}
export function useStats(): Stats {
  return useSyncExternalStore(statsStore.subscribe, statsStore.get, () => EMPTY_STATS);
}

/** Pure reducer for recording a finished game (testable). */
export function withGameResult(s: Stats, score: number, size: number, lines: number, at = Date.now()): Stats {
  const key = String(size);
  return {
    best: Math.max(s.best, score),
    games: s.games + 1,
    last: score,
    bestLines: Math.max(s.bestLines, lines),
    totalScore: s.totalScore + score,
    history: [{ score, size, at }, ...s.history].slice(0, 20),
    bestBySize: { ...s.bestBySize, [key]: Math.max(s.bestBySize[key] ?? 0, score) },
  };
}

export function recordGame(score: number, size: number, lines: number) {
  statsStore.set(withGameResult(statsStore.get(), score, size, lines));
}
