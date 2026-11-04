import { describe, expect, it } from "vitest";
import { canPlaceAnywhere, createBoard, makePiece, SHAPES } from "./engine";
import { gameReducer, type GameState } from "./useGame";

const sq3 = SHAPES.find((s) => s.length === 9)!;
const dot = SHAPES.find((s) => s.length === 1)!;
const row2 = [[0, 0], [0, 1]] as const;

function state(board: Uint8Array, pieces: GameState["pieces"]): GameState {
  return { n: 5, board, pieces, score: 0, combo: 0, lines: 0, moves: 0, over: false, flash: null, flashKey: 0, lastGain: null };
}

describe("piece availability and game over", () => {
  it("a 3x3 piece has no spot on a board with a full checker pattern, a single block does", () => {
    const b = createBoard(5);
    for (let i = 0; i < 25; i += 2) b[i] = 1;
    expect(canPlaceAnywhere(b, 5, sq3)).toBe(false);
    expect(canPlaceAnywhere(b, 5, dot)).toBe(true);
  });

  it("game ends automatically when no remaining piece fits", () => {
    const b = createBoard(5);
    for (let i = 0; i < 25; i += 2) b[i] = 1; // checker: only isolated holes
    b[1] = 0; // hole at (0,1) next to filled cells; placing a dot fills it
    const s = state(b, [makePiece(dot, 2), makePiece(sq3, 3), null]);
    const after = gameReducer(s, { type: "place", index: 0, row: 0, col: 1 });
    // row 0 now: 1,2,1,?,1 -> not full; remaining 3x3 cannot fit anywhere
    expect(after.over).toBe(true);
  });

  it("game continues while another piece still fits", () => {
    const b = createBoard(5);
    for (let i = 0; i < 25; i += 2) b[i] = 1;
    const s = state(b, [makePiece(dot, 2), makePiece(sq3, 3), makePiece(dot, 4)]);
    const after = gameReducer(s, { type: "place", index: 0, row: 0, col: 1 });
    expect(after.over).toBe(false);
  });

  it("clearing a line frees space so a blocked piece becomes available again", () => {
    const b = createBoard(5);
    b.fill(1);
    b[0] = 0; // only (0,0) free -> a 2-wide piece cannot fit
    const two = makePiece(row2, 5);
    expect(canPlaceAnywhere(b, 5, two.shape)).toBe(false);
    const s = state(b, [makePiece(dot, 2), two, null]);
    const after = gameReducer(s, { type: "place", index: 0, row: 0, col: 0 });
    expect(after.lines).toBe(10); // all 5 rows + 5 cols cleared
    expect(canPlaceAnywhere(after.board, 5, two.shape)).toBe(true);
    expect(after.over).toBe(false);
  });

  it("restart clears board and score", () => {
    const b = createBoard(5);
    b.fill(1);
    const s = { ...state(b, [null, null, null]), score: 120, over: true };
    const r = gameReducer(s, { type: "reset", n: 5 });
    expect(r.score).toBe(0);
    expect(r.over).toBe(false);
    expect([...r.board].every((v) => v === 0)).toBe(true);
    expect(r.pieces.filter(Boolean).length).toBe(3);
  });
});
