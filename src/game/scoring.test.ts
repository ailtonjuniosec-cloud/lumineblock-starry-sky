import { describe, expect, it } from "vitest";
import { createBoard, makePiece, SHAPES } from "./engine";
import { gameReducer, type GameState } from "./useGame";

const dot = SHAPES.find((s) => s.length === 1)!;
const st = (board: Uint8Array, score = 0): GameState => ({
  n: 5, board, pieces: [makePiece(dot, 1), makePiece(dot, 2), makePiece(dot, 3)],
  score, combo: 0, lines: 0, moves: 0, over: false, flash: null, flashKey: 0, lastGain: null,
});
const play = (b: Uint8Array, r: number, c: number, score = 0) => gameReducer(st(b, score), { type: "place", index: 0, row: r, col: c });

describe("scoring: 10 points per cleared line only", () => {
  it("placing without clearing scores 0", () => {
    expect(play(createBoard(5), 2, 2).score).toBe(0);
  });
  it("one row = 10", () => {
    const b = createBoard(5);
    for (let c = 1; c < 5; c++) b[c] = 1;
    expect(play(b, 0, 0).score).toBe(10);
  });
  it("two rows at once = 20, three = 30", () => {
    const two = createBoard(5);
    for (let c = 0; c < 5; c++) { two[c] = 1; two[5 + c] = 1; }
    two[0] = 0; two[5] = 0; // column 0 of rows 0-1 empty
    // fill column 0 rows 0..1 with a vertical domino
    const vert = makePiece([[0, 0], [1, 0]], 4);
    const s2 = { ...st(two), pieces: [vert, null, makePiece(dot, 1)] };
    expect(gameReducer(s2, { type: "place", index: 0, row: 0, col: 0 }).score).toBe(20);
    const three = createBoard(5);
    for (let r = 0; r < 3; r++) for (let c = 1; c < 5; c++) three[r * 5 + c] = 1;
    const v3 = makePiece([[0, 0], [1, 0], [2, 0]], 4);
    const s3 = { ...st(three), pieces: [v3, null, makePiece(dot, 1)] };
    expect(gameReducer(s3, { type: "place", index: 0, row: 0, col: 0 }).score).toBe(30);
  });
  it("row + column sharing a cell = 20, no double count", () => {
    const b = createBoard(5);
    for (let i = 0; i < 5; i++) { b[i] = 1; b[i * 5] = 1; }
    b[0] = 0;
    expect(play(b, 0, 0).score).toBe(20);
  });
  it("adds to existing score; restart resets it to 0", () => {
    const b = createBoard(5);
    for (let c = 1; c < 5; c++) b[c] = 1;
    const s = play(b, 0, 0, 40);
    expect(s.score).toBe(50);
    expect(gameReducer(s, { type: "reset", n: 5 }).score).toBe(0);
  });
});
