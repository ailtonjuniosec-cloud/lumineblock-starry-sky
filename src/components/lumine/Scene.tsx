import { memo } from "react";

// Deterministic star field (no layout work at runtime, no filters animated).
const STARS = Array.from({ length: 34 }, (_, i) => {
  const a = (i * 9301 + 49297) % 233280;
  const b = (i * 4271 + 1733) % 9973;
  return {
    left: `${(a / 233280) * 100}%`,
    top: `${(b / 9973) * 100}%`,
    delay: `${(i % 7) * 0.6}s`,
    size: i % 5 === 0 ? 3 : 2,
  };
});

/** Ambient background: gradient + soft orbs (radial gradients, no blur filter) + stars. */
export const Scene = memo(function Scene() {
  return (
    <div className="scene" aria-hidden>
      <div
        className="orb anim-drift fx"
        style={{ width: "70vmax", height: "70vmax", left: "-30vmax", top: "-25vmax", background: "radial-gradient(circle, var(--orb-1), transparent 65%)" }}
      />
      <div
        className="orb anim-drift fx"
        style={{ width: "60vmax", height: "60vmax", right: "-28vmax", top: "30vh", animationDelay: "-6s", background: "radial-gradient(circle, var(--orb-2), transparent 65%)" }}
      />
      <div
        className="orb fx"
        style={{ width: "50vmax", height: "50vmax", left: "-10vmax", bottom: "-30vmax", background: "radial-gradient(circle, var(--orb-3), transparent 65%)" }}
      />
      {STARS.map((s, i) => (
        <span
          key={i}
          className="star fx"
          style={{ left: s.left, top: s.top, animationDelay: s.delay, width: s.size, height: s.size }}
        />
      ))}
    </div>
  );
});
