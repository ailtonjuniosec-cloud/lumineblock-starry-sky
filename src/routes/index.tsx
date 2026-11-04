import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Info, Play, Settings2, Trophy } from "lucide-react";
import { HeroBlocks } from "@/components/lumine/HeroBlocks";
import { LogoMark, NavTile, Screen } from "@/components/lumine/ui";
import { BOARD_SIZES } from "@/game/engine";
import { haptic } from "@/lib/haptics";
import { settingsStore, useSettings, useStats } from "@/lib/storage";
import { useI18n } from "@/i18n";
import { playSfx } from "@/lib/audio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LumineBlock — Starry Sky" },
      { name: "description", content: "LumineBlock: jogo de encaixe de blocos premium com identidade Purple Flower." },
      { property: "og:title", content: "LumineBlock — Starry Sky" },
      { property: "og:description", content: "Encaixe blocos, limpe linhas e colunas, bata seu recorde." },
    ],
  }),
  component: Home,
});

function Home() {
  const { boardSize } = useSettings();
  const { best } = useStats();
  const { t, n } = useI18n();
  return (
    <Screen>
      <div className="flex flex-1 flex-col px-5">
        <div className="anim-rise flex items-center justify-center gap-3 pt-6">
          <LogoMark size={38} />
          <div>
            <h1 className="text-3xl font-extrabold leading-none tracking-tight">
              Lumine<span className="text-gradient">Block</span>
            </h1>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Starry Sky</p>
          </div>
        </div>

        <div className="flex flex-1 items-center py-4">
          <HeroBlocks />
        </div>

        <div className="anim-rise mb-4 flex items-center justify-center gap-2 text-sm" style={{ animationDelay: "120ms" }}>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5">
            <Trophy className="size-4 text-primary" />
            <span className="text-muted-foreground">{t("record")}</span>
            <strong className="font-display tabular-nums">{n(best)}</strong>
          </span>
        </div>

        <Link
          to="/play"
          search={{ size: boardSize }}
          onClick={() => haptic(18)}
          className="anim-rise anim-pulse press relative flex h-16 items-center justify-center gap-3 overflow-hidden rounded-[28px] bg-gradient-primary text-lg font-bold text-primary-foreground"
          style={{ animationDelay: "180ms" }}
        >
          <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-primary-foreground/25 to-transparent" />
          <Play className="size-6 fill-current" />
          {t("play")}
        </Link>

        <div className="anim-rise mt-4" style={{ animationDelay: "240ms" }}>
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("board")}</p>
          <div className="glass flex gap-1 rounded-2xl p-1" role="radiogroup" aria-label={t("boardSize")} dir="ltr">
            {BOARD_SIZES.map((b) => {
              const active = b.size === boardSize;
              return (
                <button
                  key={b.size}
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    haptic(8);
                    playSfx("select");
                    settingsStore.set({ boardSize: b.size });
                  }}
                  className={`press flex flex-1 flex-col items-center rounded-xl py-2 transition-colors ${
                    active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
                  }`}
                >
                  <span className="font-display text-sm font-bold">{b.size}×{b.size}</span>
                  <span className="text-[10px] font-medium opacity-80">{t(`size${b.size}`)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <nav className="anim-rise mt-4 mb-2 flex gap-3" style={{ animationDelay: "300ms" }}>
          <NavTile to="/stats" icon={<BarChart3 className="size-5" />} label={t("stats")} />
          <NavTile to="/settings" icon={<Settings2 className="size-5" />} label={t("settings")} />
          <NavTile to="/about" icon={<Info className="size-5" />} label={t("about")} />
        </nav>
      </div>
    </Screen>
  );
}
