import { describe, expect, it } from "vitest";
import { EMPTY_STATS, settingsStore, withGameResult } from "./storage";

describe("stats", () => {
  it("keeps the personal record and counts games", () => {
    let s = withGameResult(EMPTY_STATS, 120, 8, 3);
    s = withGameResult(s, 80, 5, 1);
    expect(s.best).toBe(120);
    expect(s.games).toBe(2);
    expect(s.last).toBe(80);
    expect(s.bestBySize).toEqual({ "8": 120, "5": 80 });
  });
});

describe("settings", () => {
  it("persists preferences locally", () => {
    settingsStore.set({ theme: "dark", boardSize: 12, haptics: false });
    const saved = JSON.parse(localStorage.getItem("lumineblock.settings")!);
    expect(saved.theme).toBe("dark");
    expect(saved.boardSize).toBe(12);
    expect(saved.haptics).toBe(false);
  });
});
