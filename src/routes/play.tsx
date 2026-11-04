import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, Pause, Play as PlayIcon, RotateCcw, Trophy } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { BoardView, gapFor } from "@/components/game/BoardView";
import { PieceView } from "@/components/game/PieceView";
import { canPlace, canPlaceAnywhere, hasAnyMove, findFullLines, isBoardSize, placePiece, type BoardSize, type Piece } from "@/game/engine";
import { useGame } from "@/game/useGame";
import { haptic } from "@/lib/haptics";
import { recordGame, useStats } from "@/lib/storage";
import { useI18n } from "@/i18n";
import { playSfx } from "@/lib/audio";

export const Route = createFileRoute("/play")({
  validateSearch: (s: Record<string, unknown>): { size: BoardSize } => {
    const n = Number(s["size"]);
    return { size: isBoardSize(n) ? n : 8 };
  },
  head: () => ({
    meta: [
      { title: "Partida — LumineBlock" },
      { name: "description", content: "Encaixe peças, limpe linhas e colunas e bata seu recorde no LumineBlock." },
      { property: "og:title", content: "Partida — LumineBlock" },
      { property: "og:description", content: "Jogue LumineBlock: encaixe blocos com fluidez." },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const { size } = Route.useSearch();
  // key forces a fresh game when board size changes
  return <Game key={size} n={size} />;
}

interface Drag {
  index: number;
  piece: Piece;
  pitch: number;
  rect: DOMRect;
  lift: number;
}

const BOARD_WIDTH = "min(calc(100vw - 24px), calc(100dvh - 320px), 520px)";

function Game({ n }: { n: number }) {
  const { state, place, reset, clearFlash } = useGame(n);
  const stats = useStats();
  const { t, n: nf } = useI18n();
  const recordChimed = useRef(false);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState<{ index: number; r: number; c: number } | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [boardPx, setBoardPx] = useState(300);
  const gridRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const hoverRef = useRef<{ index: number; r: number; c: number } | null>(null);
  const recorded = useRef(false);
  const startBest = useRef(stats.best);
  const best = Math.max(stats.best, state.score);
  // Re-derived from the current board on every change: never a stale check.
  const fits = useMemo(() => state.pieces.map((p) => !!p && canPlaceAnywhere(state.board, n, p.shape)), [state.board, state.pieces, n]);
  const over = state.over || !hasAnyMove(state.board, n, state.pieces);
  const sizeName = t(`size${n}` as "size8");
  const gap = gapFor(n);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoardPx(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!state.flash) return;
    const t = setTimeout(clearFlash, 380);
    return () => clearTimeout(t);
  }, [state.flash, clearFlash]);

  useEffect(() => {
    if (over && !recorded.current) {
      recorded.current = true;
      recordGame(state.score, n, state.lines);
      haptic([30, 60, 30]);
      playSfx("gameOver");
    }
    if (!over) recorded.current = false;
  }, [over, state.score, state.lines, n]);

  // Gentle sparkle the first time a run beats the previous personal best
  useEffect(() => {
    if (!recordChimed.current && startBest.current > 0 && state.score > startBest.current) {
      recordChimed.current = true;
      playSfx("record");
    }
  }, [state.score]);

  // Preview mask: ghost cells + lines that would clear
  const preview = useMemo(() => {
    if (!hover) return null;
    const piece = state.pieces[hover.index];
    if (!piece) return null;
    const mask = new Uint8Array(n * n);
    const valid = canPlace(state.board, n, piece.shape, hover.r, hover.c);
    for (const [dr, dc] of piece.shape) {
      const r = hover.r + dr,
        c = hover.c + dc;
      if (r >= 0 && c >= 0 && r < n && c < n) mask[r * n + c] = valid ? 1 : 2;
    }
    if (valid) {
      const placed = placePiece(state.board, n, piece, hover.r, hover.c);
      const { rows, cols } = findFullLines(placed, n);
      for (const r of rows) for (let c = 0; c < n; c++) mask[r * n + c] = 3;
      for (const c of cols) for (let r = 0; r < n; r++) mask[r * n + c] = 3;
    }
    return mask;
  }, [hover, state.board, state.pieces, n]);

  const pitch = (boardPx + gap) / n; // cell + gap
  const cell = pitch - gap;
  const trayCell = Math.min(cell * 0.62, ((boardPx - 16) / 3 - 32) / 5, 22);

  const moveFloat = (x: number, y: number) => {
    const d = drag.current;
    const el = floatRef.current;
    if (!d || !el) return;
    const w = d.piece.w * d.pitch - gap;
    const h = d.piece.h * d.pitch - gap;
    const left = x - w / 2;
    const top = y - h - d.lift;
    el.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    const c = Math.round((left - d.rect.left) / d.pitch);
    const r = Math.round((top - d.rect.top) / d.pitch);
    const inside = r > -d.piece.h && c > -d.piece.w && r < n && c < n;
    const prev = hoverRef.current;
    const next = inside ? { index: d.index, r, c } : null;
    if (prev === next || (prev && next && prev.r === r && prev.c === c && prev.index === next.index)) return;
    hoverRef.current = next;
    setHover(next);
  };

  const onPointerDown = (index: number) => (e: RPointerEvent<HTMLDivElement>) => {
    const piece = state.pieces[index];
    if (!piece || !fits[index] || paused || over || !gridRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = gridRef.current.getBoundingClientRect();
    const p = (rect.width + gap) / n;
    drag.current = { index, piece, pitch: p, rect, lift: Math.max(40, p * 1.1) };
    setDragIndex(index);
    haptic(6);
    playSfx("select");
    requestAnimationFrame(() => moveFloat(e.clientX, e.clientY));
  };
  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (drag.current) moveFloat(e.clientX, e.clientY);
  };
  const endDrag = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    setDragIndex(null);
    const h = hoverRef.current;
    hoverRef.current = null;
    setHover(null);
    if (d && h && !over && h.index === d.index && canPlace(state.board, n, d.piece.shape, h.r, h.c)) {
      place(d.index, h.r, h.c);
      const placed = placePiece(state.board, n, d.piece, h.r, h.c);
      const { rows, cols } = findFullLines(placed, n);
      haptic(rows.length + cols.length ? [14, 40, 22] : 10);
      const total = rows.length + cols.length;
      playSfx(total > 1 ? "multi" : rows.length ? "line" : cols.length ? "column" : "place");
    } else if (d) haptic(4);
  }, [state.board, n, place, over]);

  const restart = () => {
    haptic(12);
    setPaused(false);
    startBest.current = stats.best;
    recordChimed.current = false;
    reset();
  };

  const dragged = dragIndex !== null ? state.pieces[dragIndex] : null;
  const newRecord = over && state.score > 0 && state.score > startBest.current;

  return (
    <main className="safe-pad relative z-10 mx-auto flex h-dvh w-full max-w-xl select-none flex-col items-center overflow-hidden px-3" style={{ touchAction: "none" }}>
      {/* HUD */}
      <header className="anim-rise flex w-full items-center gap-2" style={{ maxWidth: BOARD_WIDTH }}>
        <button aria-label={t("pause")} onClick={() => (haptic(8), setPaused(true))} className="glass press grid size-11 place-items-center rounded-2xl">
          <Pause className="size-5" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            <bdi>{n}×{n}</bdi> · {sizeName}
          </p>
        </div>
        <button aria-label={t("restart")} onClick={restart} className="glass press grid size-11 place-items-center rounded-2xl">
          <RotateCcw className="size-5" />
        </button>
      </header>

      <div className="anim-rise mt-3 flex w-full items-end justify-between px-1" style={{ maxWidth: BOARD_WIDTH, animationDelay: "60ms" }}>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">{t("score")}</p>
          <p className="font-display text-4xl font-extrabold tabular-nums leading-tight text-gradient">{nf(state.score)}</p>
        </div>
        <div className="glass-flat flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm">
          <Trophy className="size-4 text-primary" />
          <span className="font-display font-bold tabular-nums">{nf(best)}</span>
        </div>
      </div>

      {/* Board */}
      <div dir="ltr" className="relative mt-3 anim-rise" style={{ animationDelay: "120ms" }}>
        <BoardView
          ref={gridRef}
          n={n}
          board={state.board}
          preview={preview}
          previewColor={hover ? (state.pieces[hover.index]?.color ?? 1) : 1}
          flash={state.flash}
          flashKey={state.flashKey}
          width={BOARD_WIDTH}
        />
        {state.lastGain && state.lastGain.lines > 0 && (
          <div key={state.lastGain.key} className="anim-score pointer-events-none absolute left-1/2 top-1/3 text-center">
            <p className="font-display text-3xl font-extrabold text-gradient">+{state.lastGain.value}</p>
            {state.lastGain.combo > 1 && <p className="text-sm font-bold text-primary">{t("combo", { n: state.lastGain.combo })}</p>}
          </div>
        )}
      </div>

      {/* Tray */}
      <div dir="ltr" className="mt-auto mb-2 grid w-full grid-cols-3 gap-2" style={{ maxWidth: BOARD_WIDTH, height: 130 }}>
        {state.pieces.map((p, i) => (
          <div
            key={p ? p.id : `empty-${i}`}
            onPointerDown={onPointerDown(i)}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            aria-disabled={p ? !fits[i] : undefined}
            aria-label={p && !fits[i] ? t("unavailable") : undefined}
            className={`glass-flat relative flex items-center justify-center rounded-3xl transition-[opacity,filter] duration-300 ${p ? "anim-pop" : ""} ${p && fits[i] ? "cursor-grab" : ""} ${p && !fits[i] ? "cursor-not-allowed" : ""}`}
            style={{ opacity: dragIndex === i ? 0.25 : p && !fits[i] ? 0.35 : 1, filter: p && !fits[i] ? "grayscale(0.85) brightness(0.9)" : "none", animationDelay: `${i * 60}ms`, touchAction: "none" }}
          >
            {p && <PieceView piece={p} cell={trayCell} gap={3} />}
            {p && !fits[i] && (
              <span className="absolute bottom-1.5 rounded-full bg-background/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{t("unavailable")}</span>
            )}
          </div>
        ))}
      </div>

      {/* Floating dragged piece */}
      {dragged && (
        <div ref={floatRef} className="pointer-events-none fixed left-0 top-0 z-40" style={{ transform: "translate3d(-999px,-999px,0)", willChange: "transform" }}>
          <div className="drop-shadow-2xl">
            <PieceView piece={dragged} cell={cell} gap={gap} />
          </div>
        </div>
      )}

      {(paused || over) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/40 px-6 backdrop-blur-md">
          <div className="glass anim-pop w-full max-w-xs rounded-[32px] p-6 text-center">
            {over ? (
              <>
                <h2 className="text-2xl font-extrabold tracking-tight">{t("gameOverTitle")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("noMoves")}</p>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">{t("finalScore")}</p>
                <p className="mt-1 font-display text-5xl font-extrabold text-gradient tabular-nums">{nf(state.score)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {newRecord ? t("newRecord") : t("recordValue", { n: nf(best) })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{t("summary", { lines: nf(state.lines), moves: nf(state.moves) })}</p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{t("paused")}</p>
                <p className="mt-3 font-display text-3xl font-bold tabular-nums">{nf(state.score)}</p>
              </>
            )}
            <div className="mt-6 flex flex-col gap-2">
              {!over && (
                <button onClick={() => (haptic(8), setPaused(false))} className="press flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary font-semibold text-primary-foreground shadow-glow">
                  <PlayIcon className="size-5 fill-current" /> {t("resume")}
                </button>
              )}
              <button
                onClick={restart}
                className={`press flex h-12 items-center justify-center gap-2 rounded-2xl font-semibold ${over ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground"}`}
              >
                <RotateCcw className="size-5" /> {t("restart")}
              </button>
              <Link to="/" className="press flex h-12 items-center justify-center gap-2 rounded-2xl bg-secondary font-semibold text-secondary-foreground">
                <Home className="size-5" /> {over ? t("backHome") : t("home")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
