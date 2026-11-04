import { createFileRoute } from "@tanstack/react-router";
import { Crown, Gamepad2, History, Rows3, Sparkles } from "lucide-react";
import { Panel, Screen, ScreenHeader } from "@/components/lumine/ui";
import { BOARD_SIZES } from "@/game/engine";
import { useStats } from "@/lib/storage";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Estatísticas — LumineBlock" },
      { name: "description", content: "Recorde, partidas e histórico do LumineBlock." },
      { property: "og:title", content: "Estatísticas — LumineBlock" },
      { property: "og:description", content: "Acompanhe seu desempenho no LumineBlock." },
    ],
  }),
  component: StatsPage,
});

const fmt = (n: number) => n.toLocaleString("pt-BR");

function StatsPage() {
  const s = useStats();
  const recent = s.history.slice(0, 12).reverse();
  const max = Math.max(1, ...recent.map((h) => h.score));
  const avg = s.games ? Math.round(s.totalScore / s.games) : 0;
  const tiles = [
    { icon: <Gamepad2 className="size-4" />, label: "Partidas", value: fmt(s.games) },
    { icon: <Sparkles className="size-4" />, label: "Última", value: fmt(s.last) },
    { icon: <Rows3 className="size-4" />, label: "Mais linhas", value: fmt(s.bestLines) },
    { icon: <History className="size-4" />, label: "Média", value: fmt(avg) },
  ];
  return (
    <Screen>
      <ScreenHeader title="Estatísticas" />
      <div className="flex flex-col gap-3 px-4 pb-6">
        <Panel className="relative overflow-hidden text-center">
          <Crown className="mx-auto size-6 text-primary" />
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Recorde pessoal</p>
          <p className="mt-1 font-display text-5xl font-extrabold tabular-nums text-gradient">{fmt(s.best)}</p>
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((t, i) => (
            <Panel key={t.label} delay={60 + i * 40} className="!p-3.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <span className="text-primary">{t.icon}</span>
                {t.label}
              </p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums">{t.value}</p>
            </Panel>
          ))}
        </div>
        <Panel delay={220}>
          <p className="text-sm font-semibold">Histórico recente</p>
          {recent.length ? (
            <div className="mt-4 flex h-28 items-end gap-1.5">
              {recent.map((h) => (
                <div key={h.at} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-md bg-gradient-primary"
                    style={{ height: `${Math.max(6, (h.score / max) * 100)}%`, opacity: h.score === s.best ? 1 : 0.65 }}
                    title={`${h.score} · ${h.size}×${h.size}`}
                  />
                  <span className="text-[9px] text-muted-foreground">{h.size}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Jogue uma partida para ver seu histórico.</p>
          )}
        </Panel>
        <Panel delay={280}>
          <p className="text-sm font-semibold">Melhor desempenho por tabuleiro</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {BOARD_SIZES.map((b) => {
              const v = s.bestBySize[b.size] ?? 0;
              return (
                <li key={b.size} className="flex items-center gap-3 text-sm">
                  <span className="w-20 text-muted-foreground">{b.size}×{b.size} {b.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${s.best ? (v / s.best) * 100 : 0}%` }} />
                  </div>
                  <span className="w-14 text-right font-display font-semibold tabular-nums">{fmt(v)}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </Screen>
  );
}
