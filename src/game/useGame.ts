import { useCallback, useReducer } from "react";
import {
  applyMove,
  createBoard,
  hasAnyMove,
  nextPieces,
  placePiece,
  type Board,
  type Piece,
} from "./engine";

export interface GameState {
  n: number;
  board: Board;
  pieces: (Piece | null)[];
  score: number;
  combo: number;
  lines: number;
  moves: number;
  over: boolean;
  flash: Map<number, number> | null;
  flashKey: number;
  lastGain: { value: number; combo: number; lines: number; key: number } | null;
}

type Action =
  | { type: "place"; index: number; row: number; col: number }
  | { type: "reset"; n: number }
  | { type: "clearFlash" };

function init(n: number): GameState {
  const board = createBoard(n);
  return {
    n,
    board,
    pieces: nextPieces(board, n),
    score: 0,
    combo: 0,
    lines: 0,
    moves: 0,
    over: false,
    flash: null,
    flashKey: 0,
    lastGain: null,
  };
}

export function gameReducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case "reset":
      return init(a.n);
    case "clearFlash":
      return s.flash ? { ...s, flash: null } : s;
    case "place": {
      const piece = s.pieces[a.index];
      if (!piece || s.over) return s;
      const res = applyMove(s.board, s.n, piece, a.row, a.col, s.combo);
      if (!res) return s;
      let pieces = s.pieces.map((p, i) => (i === a.index ? null : p));
      if (pieces.every((p) => !p)) pieces = nextPieces(res.board, s.n);
      let flash: Map<number, number> | null = null;
      if (res.cleared.size) {
        const placed = placePiece(s.board, s.n, piece, a.row, a.col);
        flash = new Map();
        res.cleared.forEach((i) => flash!.set(i, placed[i]!));
      }
      return {
        ...s,
        board: res.board,
        pieces,
        score: s.score + res.gained,
        combo: res.combo,
        lines: s.lines + res.lines,
        moves: s.moves + 1,
        over: !hasAnyMove(res.board, s.n, pieces),
        flash,
        flashKey: flash ? s.flashKey + 1 : s.flashKey,
        lastGain: { value: res.gained, combo: res.combo, lines: res.lines, key: s.moves + 1 },
      };
    }
  }
}

export function useGame(n: number) {
  const [state, dispatch] = useReducer(gameReducer, n, init);
  const place = useCallback((index: number, row: number, col: number) => dispatch({ type: "place", index, row, col }), []);
  const reset = useCallback(() => dispatch({ type: "reset", n }), [n]);
  const clearFlash = useCallback(() => dispatch({ type: "clearFlash" }), []);
  return { state, place, reset, clearFlash };
}
