// Pure, framework-free game logic for LumineBlock.
export type Shape = readonly (readonly [number, number])[];
export interface Piece {
  id: number;
  shape: Shape;
  color: number; // 1..6
  w: number;
  h: number;
}
export type Board = Uint8Array; // 0 = empty, 1..6 = color

export const BOARD_SIZES = [
  { size: 5, name: "Compacto" },
  { size: 6, name: "Pequeno" },
  { size: 8, name: "Clássico" },
  { size: 10, name: "Amplo" },
  { size: 12, name: "Desafio" },
] as const;
export type BoardSize = (typeof BOARD_SIZES)[number]["size"];
export const isBoardSize = (n: unknown): n is BoardSize =>
  BOARD_SIZES.some((b) => b.size === n);

const RAW: string[][] = [
  ["#"],
  ["##"],
  ["#", "#"],
  ["###"],
  ["#", "#", "#"],
  ["####"],
  ["#", "#", "#", "#"],
  ["#####"],
  ["#", "#", "#", "#", "#"],
  ["##", "##"],
  ["###", "###", "###"],
  ["##", "#."],
  ["##", ".#"],
  ["#.", "##"],
  [".#", "##"],
  ["###", "#..", "#.."],
  ["###", "..#", "..#"],
  ["#..", "#..", "###"],
  ["..#", "..#", "###"],
  ["###", ".#."],
  [".#.", "###"],
  ["#.", "##", "#."],
  [".#", "##", ".#"],
  ["##.", ".##"],
  [".##", "##."],
  ["#.", "##", ".#"],
  [".#", "##", "#."],
  ["#..", "###"],
  ["###", "#.."],
  ["..#", "###"],
  ["###", "..#"],
];

export const SHAPES: Shape[] = RAW.map((rows) => {
  const cells: [number, number][] = [];
  rows.forEach((row, r) => [...row].forEach((ch, c) => ch === "#" && cells.push([r, c])));
  return cells;
});

export const shapeDims = (s: Shape) => ({
  h: Math.max(...s.map(([r]) => r)) + 1,
  w: Math.max(...s.map(([, c]) => c)) + 1,
});

export const createBoard = (n: number): Board => new Uint8Array(n * n);

let pieceSeq = 1;
export function makePiece(shape: Shape, color: number): Piece {
  const { w, h } = shapeDims(shape);
  return { id: pieceSeq++, shape, color, w, h };
}

/** Shapes allowed for a given board size (smaller boards avoid oversized pieces). */
export function shapesFor(n: number): Shape[] {
  const max = n <= 5 ? 3 : n <= 6 ? 4 : 5;
  return SHAPES.filter((s) => {
    const { w, h } = shapeDims(s);
    return w <= max && h <= max && !(n <= 5 && s.length > 5);
  });
}

export function randomPieces(n: number, count = 3, rnd: () => number = Math.random): Piece[] {
  const pool = shapesFor(n);
  return Array.from({ length: count }, () =>
    makePiece(pool[Math.floor(rnd() * pool.length)]!, 1 + Math.floor(rnd() * 6)),
  );
}

/** Generates pieces guaranteeing at least one fits the board, when possible. */
export function nextPieces(board: Board, n: number, rnd: () => number = Math.random): Piece[] {
  for (let i = 0; i < 12; i++) {
    const p = randomPieces(n, 3, rnd);
    if (hasAnyMove(board, n, p)) return p;
  }
  const pool = shapesFor(n);
  const fitting = pool.filter((s) => canPlaceAnywhere(board, n, s));
  if (!fitting.length) return randomPieces(n, 3, rnd);
  const p = randomPieces(n, 3, rnd);
  p[0] = makePiece(fitting[Math.floor(rnd() * fitting.length)]!, p[0]!.color);
  return p;
}

export function canPlace(board: Board, n: number, shape: Shape, row: number, col: number): boolean {
  for (const [dr, dc] of shape) {
    const r = row + dr,
      c = col + dc;
    if (r < 0 || c < 0 || r >= n || c >= n || board[r * n + c] !== 0) return false;
  }
  return true;
}

export function canPlaceAnywhere(board: Board, n: number, shape: Shape): boolean {
  const { w, h } = shapeDims(shape);
  for (let r = 0; r <= n - h; r++)
    for (let c = 0; c <= n - w; c++) if (canPlace(board, n, shape, r, c)) return true;
  return false;
}

export function hasAnyMove(board: Board, n: number, pieces: (Piece | null)[]): boolean {
  return pieces.some((p) => p && canPlaceAnywhere(board, n, p.shape));
}

export function placePiece(board: Board, n: number, piece: Piece, row: number, col: number): Board {
  const next = board.slice();
  for (const [dr, dc] of piece.shape) next[(row + dr) * n + col + dc] = piece.color;
  return next;
}

export function findFullLines(board: Board, n: number): { rows: number[]; cols: number[] } {
  const rows: number[] = [],
    cols: number[] = [];
  for (let r = 0; r < n; r++) {
    let full = true;
    for (let c = 0; c < n && full; c++) if (!board[r * n + c]) full = false;
    if (full) rows.push(r);
  }
  for (let c = 0; c < n; c++) {
    let full = true;
    for (let r = 0; r < n && full; r++) if (!board[r * n + c]) full = false;
    if (full) cols.push(c);
  }
  return { rows, cols };
}

/** Returns indices that would be cleared plus the new board. */
export function clearLines(board: Board, n: number, rows: number[], cols: number[]) {
  const next = board.slice();
  const cleared = new Set<number>();
  for (const r of rows) for (let c = 0; c < n; c++) cleared.add(r * n + c);
  for (const c of cols) for (let r = 0; r < n; r++) cleared.add(r * n + c);
  cleared.forEach((i) => (next[i] = 0));
  return { board: next, cleared };
}

/** Points per cleared row or column. Placing blocks alone scores nothing. */
export const POINTS_PER_LINE = 10;
/** Score for one move: 10 per distinct full row/column cleared, nothing else. */
export function scoreMove(lines: number): number {
  return lines * POINTS_PER_LINE;
}
/** Celebration tier 1..5 (5 = five or more lines); 0 = no clear. */
export const comboTier = (lines: number) => Math.min(Math.max(lines, 0), 5);

export interface MoveResult {
  board: Board;
  cleared: Set<number>;
  lines: number;
  gained: number;
  combo: number;
}

export function applyMove(
  board: Board,
  n: number,
  piece: Piece,
  row: number,
  col: number,
  combo: number,
): MoveResult | null {
  if (!canPlace(board, n, piece.shape, row, col)) return null;
  const placed = placePiece(board, n, piece, row, col);
  const { rows, cols } = findFullLines(placed, n);
  const lines = rows.length + cols.length;
  const { board: next, cleared } = clearLines(placed, n, rows, cols);
  const gained = scoreMove(lines);
  return { board: next, cleared, lines, gained, combo: lines ? combo + 1 : 0 };
}
