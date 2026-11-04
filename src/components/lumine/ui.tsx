import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { haptic } from "@/lib/haptics";

export function LogoMark({ size = 40 }: { size?: number }) {
  const cells = [1, 1, 0, 1, 1, 1, 0, 1, 1];
  const colors = ["--block-2", "--block-1", "", "--block-6", "--block-1", "--block-3", "", "--block-5", "--block-1"];
  return (
    <div className="grid grid-cols-3" style={{ width: size, height: size, gap: size / 14 }} aria-hidden>
      {cells.map((on, i) =>
        on ? (
          <span key={i} className="tile" style={{ ["--c" as string]: `var(${colors[i]})`, borderRadius: size / 10 }} />
        ) : (
          <span key={i} />
        ),
      )}
    </div>
  );
}

export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="flex items-center gap-3 px-4 pb-4 anim-rise">
      <button
        aria-label="Voltar"
        onClick={() => {
          haptic(8);
          if (window.history.length > 1) router.history.back();
          else router.navigate({ to: "/" });
        }}
        className="glass press grid size-11 place-items-center rounded-2xl"
      >
        <ChevronLeft className="size-5" />
      </button>
      <h1 className="flex-1 text-xl font-semibold tracking-tight">{title}</h1>
      {right}
    </header>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <main className="safe-pad relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col">{children}</main>;
}

export function Panel({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <section className={`glass anim-rise rounded-3xl p-4 ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </section>
  );
}

export function NavTile({ to, icon, label }: { to: "/stats" | "/settings" | "/about"; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      onClick={() => haptic(8)}
      className="glass press flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-semibold text-muted-foreground"
    >
      <span className="text-primary">{icon}</span>
      {label}
    </Link>
  );
}
