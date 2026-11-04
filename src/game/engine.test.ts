import { describe, expect, it } from "vitest";
import {
  BOARD_SIZES,
  applyMove,
  canPlace,
  createBoard,
  hasAnyMove,
  makePiece,
  nextPieces,
  scoreMove,
  shapeDims,
  shapesFor,
} from "./engine";

const line = (len: number) => makePiece(Array.from({ length: len }, (_, i) => [0, i] as const), 1);
const col = (len: number) => makePiece(Array.from({ length: len }, (_, i) => [i, 0] as const), 2);

describe("engine", () => {
  it("offers five board sizes", () => {
    expect(BOARD_SIZES.map((b) => b.size)).toEqual([5, 6, 8, 10, 12]);
  });

  it("every board size only gets pieces that fit", () => {
    for (const { size } of BOARD_SIZES)
      for (const s of shapesFor(size)) {
        const { w, h } = shapeDims(s);
        expect(w).toBeLessThanOrEqual(size);
        expect(h).toBeLessThanOrEqual(size);
      }
  });

  it("rejects out-of-bounds and overlapping placement", () => {
    const b = createBoard(5);
    const p = line(3);
    expect(canPlace(b, 5, p.shape, 0, 2)).toBe(true);
    expect(canPlace(b, 5, p.shape, 0, 3)).toBe(false);
    const after = applyMove(b, 5, p, 0, 0, 0)!.board;
    expect(canPlace(after, 5, line(1).shape, 0, 1)).toBe(false);
  });

  it("clears a full row and a full column", () => {
    let b = createBoard(5);
    b = applyMove(b, 5, line(4), 0, 0, 0)!.board;
    const r = applyMove(b, 5, line(1), 0, 4, 0)!;
    expect(r.lines).toBe(1);
    expect([...r.board].every((v) => v === 0)).toBe(true);

    let c = createBoard(5);
    c = applyMove(c, 5, col(4), 0, 2, 0)!.board;
    const rc = applyMove(c, 5, line(1), 4, 2, 0)!;
    expect(rc.lines).toBe(1);
    expect(rc.cleared.size).toBe(5);
  });

  it("scores only cleared lines, 10 each", () => {
    expect(scoreMove(0)).toBe(0);
    expect(scoreMove(1)).toBe(10);
    expect(scoreMove(2)).toBe(20);
    expect(scoreMove(3)).toBe(30);
    expect(scoreMove(5)).toBe(50);
  });

  it("detects game over when nothing fits", () => {
    const b = createBoard(5).fill(1);
    b[0] = 0;
    expect(hasAnyMove(b, 5, [line(2), col(2), null])).toBe(false);
    expect(hasAnyMove(b, 5, [line(1)])).toBe(true);
  });

  it("generates at least one placeable piece when possible", () => {
    const b = createBoard(8).fill(1);
    b[0] = 0;
    for (let i = 0; i < 20; i++) expect(hasAnyMove(b, 8, nextPieces(b, 8))).toBe(true);
  });
});
