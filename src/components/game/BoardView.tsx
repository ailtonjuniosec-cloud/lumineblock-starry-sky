import { forwardRef, memo } from "react";
import type { Board } from "@/game/engine";

export const gapFor = (n: number) => (n <= 6 ? 5 : n <= 8 ? 4 : n <= 10 ? 3 : 2);

/** preview: 0 none, 1 valid ghost, 2 invalid ghost, 3 will clear */
const Cell = memo(function Cell({
  color,
  preview,
  previewColor,
  flashColor,
  flashKey,
  radius,
}: {
  color: number;
  preview: number;
  previewColor: number;
  flashColor: number;
  flashKey: number;
  radius: number;
}) {
  return (
    <div className="relative bg-cell" style={{ borderRadius: radius }}>
      {color > 0 && (
        <span
          className="tile anim-pop absolute inset-0"
          style={{
            borderRadius: radius,
            ["--c" as string]: `var(--block-${color})`,
            filter: preview === 3 ? "brightness(1.35) saturate(1.2)" : undefined,
          }}
        />
      )}
      {color === 0 && preview === 1 && (
        <span className="tile absolute inset-0 opacity-45" style={{ borderRadius: radius, ["--c" as string]: `var(--block-${previewColor})` }} />
      )}
      {color === 0 && preview === 3 && (
        <span className="tile absolute inset-0 opacity-80" style={{ borderRadius: radius, ["--c" as string]: `var(--block-${previewColor})` }} />
      )}
      {preview === 2 && color === 0 && (
        <span className="absolute inset-0 bg-destructive/35" style={{ borderRadius: radius }} />
      )}
      {flashColor > 0 && (
        <span
          key={flashKey}
          className="tile anim-clear absolute inset-0"
          style={{ borderRadius: radius, ["--c" as string]: `var(--block-${flashColor})` }}
        />
      )}
    </div>
  );
});

interface Props {
  n: number;
  board: Board;
  preview: Uint8Array | null;
  previewColor: number;
  flash: Map<number, number> | null;
  flashKey: number;
  width: string;
}

export const BoardView = memo(
  forwardRef<HTMLDivElement, Props>(function BoardView({ n, board, preview, previewColor, flash, flashKey, width }, gridRef) {
    const gap = gapFor(n);
    const radius = n >= 10 ? 4 : 7;
    const cells = [];
    for (let i = 0; i < n * n; i++)
      cells.push(
        <Cell
          key={i}
          color={board[i]!}
          preview={preview ? preview[i]! : 0}
          previewColor={previewColor}
          flashColor={flash?.get(i) ?? 0}
          flashKey={flashKey}
          radius={radius}
        />,
      );
    return (
      <div className="glass rounded-3xl bg-board p-2" style={{ width }}>
        <div
          ref={gridRef}
          className="grid aspect-square w-full"
          style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)`, gap }}
        >
          {cells}
        </div>
      </div>
    );
  }),
);
