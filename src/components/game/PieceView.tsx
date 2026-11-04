import { memo } from "react";
import type { Piece } from "@/game/engine";

export const PieceView = memo(function PieceView({ piece, cell, gap }: { piece: Piece; cell: number; gap: number }) {
  const r = Math.max(3, cell * 0.18);
  return (
    <div className="relative" style={{ width: piece.w * cell + (piece.w - 1) * gap, height: piece.h * cell + (piece.h - 1) * gap }}>
      {piece.shape.map(([y, x], i) => (
        <span
          key={i}
          className="tile absolute"
          style={{
            left: x * (cell + gap),
            top: y * (cell + gap),
            width: cell,
            height: cell,
            borderRadius: r,
            ["--c" as string]: `var(--block-${piece.color})`,
          }}
        />
      ))}
    </div>
  );
});
