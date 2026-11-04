import { createFileRoute } from "@tanstack/react-router";
import { Monitor, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { Panel, Screen, ScreenHeader } from "@/components/lumine/ui";
import { BOARD_SIZES } from "@/game/engine";
import { haptic } from "@/lib/haptics";
import { settingsStore, useSettings, type Settings, type ThemeMode } from "@/lib/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — LumineBlock" },
      { name: "description", content: "Tema, tabuleiro, animações e feedback tátil do LumineBlock." },
      { property: "og:title", content: "Configurações — LumineBlock" },
      { property: "og:description", content: "Personalize o LumineBlock." },
    ],
  }),
  component: SettingsPage,
});

const THEMES: { id: ThemeMode; label: string; icon: ReactNode }[] = [
  { id: "light", label: "Claro", icon: <Sun className="size-5" /> },
  { id: "dark", label: "Escuro", icon: <Moon className="size-5" /> },
  { id: "auto", label: "Automático", icon: <Monitor className="size-5" /> },
];

function Toggle({ k, label, hint }: { k: "animations" | "effects" | "haptics"; label: string; hint: string }) {
  const s = useSettings();
  const on = s[k];
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => {
        settingsStore.set({ [k]: !on } as Partial<Settings>);
        haptic(10);
      }}
      className="flex w-full items-center gap-3 py-3 text-left"
    >
      <span className="flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <span className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-gradient-primary" : "bg-muted"}`}>
        <span
          className="absolute top-1 size-5 rounded-full bg-card shadow transition-transform"
          style={{ transform: `translateX(${on ? 24 : 4}px)`, transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
        />
      </span>
    </button>
  );
}

function SettingsPage() {
  const s = useSettings();
  return (
    <Screen>
      <ScreenHeader title="Configurações" />
      <div className="flex flex-col gap-3 px-4 pb-6">
        <Panel>
          <p className="mb-3 text-sm font-semibold">Tema</p>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => {
              const active = s.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => (haptic(8), settingsStore.set({ theme: t.id }))}
                  aria-pressed={active}
                  className={`press flex flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-semibold transition-colors ${
                    active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              );
            })}
          </div>
        </Panel>
        <Panel delay={60}>
          <p className="mb-3 text-sm font-semibold">Tabuleiro padrão</p>
          <div className="grid grid-cols-5 gap-1.5">
            {BOARD_SIZES.map((b) => {
              const active = s.boardSize === b.size;
              return (
                <button
                  key={b.size}
                  onClick={() => (haptic(8), settingsStore.set({ boardSize: b.size }))}
                  aria-pressed={active}
                  className={`press flex flex-col items-center rounded-xl py-2 transition-colors ${
                    active ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <span className="font-display text-sm font-bold">{b.size}</span>
                  <span className="text-[9px] opacity-80">{b.name}</span>
                </button>
              );
            })}
          </div>
        </Panel>
        <Panel delay={120} className="divide-y divide-border !py-1">
          <Toggle k="animations" label="Animações" hint="Transições e efeitos de encaixe" />
          <Toggle k="effects" label="Efeitos visuais" hint="Estrelas, brilhos e desfoque" />
          <Toggle k="haptics" label="Feedback tátil" hint="Vibração ao tocar e encaixar" />
        </Panel>
      </div>
    </Screen>
  );
}
