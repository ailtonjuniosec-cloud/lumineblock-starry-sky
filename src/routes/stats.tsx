import { createFileRoute } from "@tanstack/react-router";
import { Crown, Gamepad2, Rows3, Sigma, Sparkles } from "lucide-react";
import { Panel, Screen, ScreenHeader } from "@/components/lumine/ui";
import { BOARD_SIZES } from "@/game/engine";
import { useI18n } from "@/i18n";
import { useStats } from "@/lib/storage";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Estatísticas — LumineBlock" },
      { name: "description", content: "Recorde, partidas e desempenho por tabuleiro no LumineBlock." },
      { property: "og:title", content: "Estatísticas — LumineBlock" },
      { property: "og:description", content: "Acompanhe seu desempenho no LumineBlock." },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const s = useStats();
  const { t, n } = useI18n();
  const avg = s.games ? Math.round(s.totalScore / s.games) : 0;
  const tiles = [
    { icon: <Gamepad2 className="size-4" />, label: t("games"), value: n(s.games) },
    { icon: <Sparkles className="size-4" />, label: t("lastScore"), value: n(s.last) },
    { icon: <Sigma className="size-4" />, label: t("average"), value: n(avg) },
    { icon: <Rows3 className="size-4" />, label: t("mostLines"), value: n(s.bestLines) },
  ];
  return (
    <Screen>
      <ScreenHeader title={t("stats")} />
      <div className="flex flex-col gap-3 px-4 pb-6">
        <Panel className="relative overflow-hidden text-center">
          <Crown className="mx-auto size-6 text-primary" />
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("personalBest")}</p>
          <p className="mt-1 font-display text-5xl font-extrabold tabular-nums text-gradient">{n(s.best)}</p>
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((tile, i) => (
            <Panel key={i} delay={60 + i * 40} className="!p-3.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <span className="text-primary">{tile.icon}</span>
                <span className="truncate">{tile.label}</span>
              </p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums">{tile.value}</p>
            </Panel>
          ))}
        </div>
        <Panel delay={240}>
          <p className="text-sm font-semibold">{t("bestByBoard")}</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {BOARD_SIZES.map((b) => {
              const v = s.bestBySize[b.size] ?? 0;
              return (
                <li key={b.size} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 truncate text-muted-foreground">
                    <bdi>{b.size}×{b.size}</bdi> {t(`size${b.size}`)}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${s.best ? (v / s.best) * 100 : 0}%` }} />
                  </div>
                  <span className="w-14 text-end font-display font-semibold tabular-nums">{n(v)}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </Screen>
  );
}
