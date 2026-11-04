import { memo } from "react";

// Artistic floating block composition for the home screen.
const CLUSTER: { x: number; y: number; c: number; d: number }[] = [
  { x: 1, y: 0, c: 2, d: 0 },
  { x: 2, y: 0, c: 1, d: 0.2 },
  { x: 0, y: 1, c: 6, d: 0.4 },
  { x: 1, y: 1, c: 1, d: 0.6 },
  { x: 2, y: 1, c: 3, d: 0.8 },
  { x: 3, y: 1, c: 4, d: 1 },
  { x: 1, y: 2, c: 5, d: 1.2 },
  { x: 2, y: 2, c: 1, d: 1.4 },
  { x: 2, y: 3, c: 2, d: 1.6 },
];

const FLOATERS = [
  { left: "4%", top: "8%", s: 30, c: 4, r: -14, d: 0, blur: true },
  { left: "84%", top: "4%", s: 22, c: 6, r: 18, d: 1.2, blur: false },
  { left: "88%", top: "62%", s: 34, c: 2, r: 10, d: 2.1, blur: true },
  { left: "2%", top: "70%", s: 20, c: 3, r: 24, d: 0.7, blur: false },
  { left: "70%", top: "88%", s: 16, c: 1, r: -8, d: 1.7, blur: false },
];

export const HeroBlocks = memo(function HeroBlocks() {
  const u = 46;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px]" aria-hidden>
      {/* halo */}
      <div
        className="fx absolute inset-[-6%] rounded-full"
        style={{ background: "radial-gradient(circle, var(--orb-1), transparent 68%)" }}
      />
      {/* glass plate behind */}
      <div
        className="glass absolute left-1/2 top-1/2 rounded-[28px]"
        style={{ width: u * 4.6, height: u * 4.6, transform: "translate(-50%,-50%) rotate(-8deg)" }}
      />
      {FLOATERS.map((f, i) => (
        <span
          key={i}
          className="tile anim-float fx absolute"
          style={{
            left: f.left,
            top: f.top,
            width: f.s,
            height: f.s,
            borderRadius: f.s / 4,
            opacity: f.blur ? 0.55 : 0.85,
            filter: f.blur ? "blur(2px)" : undefined,
            animationDelay: `${f.d}s`,
            ["--c" as string]: `var(--block-${f.c})`,
            ["--r" as string]: `${f.r}deg`,
          }}
        />
      ))}
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: u * 4, height: u * 4, transform: "translate(-50%,-50%) rotate(12deg)" }}
      >
        {CLUSTER.map((b, i) => (
          <span
            key={i}
            className="tile anim-pop absolute"
            style={{
              left: b.x * u + 2,
              top: b.y * u + 2,
              width: u - 4,
              height: u - 4,
              borderRadius: 12,
              animationDelay: `${120 + i * 60}ms`,
              ["--c" as string]: `var(--block-${b.c})`,
            }}
          />
        ))}
        <span
          className="fx star absolute"
          style={{ left: u * 3.4, top: u * 0.2, width: 6, height: 6, animationDuration: "2.6s" }}
        />
      </div>
    </div>
  );
});
