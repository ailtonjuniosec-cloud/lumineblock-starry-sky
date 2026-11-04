import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Panel, Screen, ScreenHeader } from "@/components/lumine/ui";
import { useI18n, type MsgKey } from "@/i18n";
import { LANGUAGES, type LocaleCode } from "@/i18n/languages";
import { playSfx } from "@/lib/audio";
import { haptic } from "@/lib/haptics";
import { settingsStore, useSettings, type Settings, type ThemeMode } from "@/lib/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — LumineBlock" },
      { name: "description", content: "Tema, áudio, idioma, animações e feedback tátil do LumineBlock." },
      { property: "og:title", content: "Configurações — LumineBlock" },
      { property: "og:description", content: "Personalize o LumineBlock." },
    ],
  }),
  component: SettingsPage,
});

const THEMES: { id: ThemeMode; label: MsgKey; icon: ReactNode }[] = [
  { id: "light", label: "light", icon: <Sun className="size-5" /> },
  { id: "dark", label: "dark", icon: <Moon className="size-5" /> },
  { id: "auto", label: "auto", icon: <Monitor className="size-5" /> },
];

const POPULAR = ["auto", "pt-BR", "en", "es", "fr", "zh-CN", "ar", "hi"] as const;

type BoolKey = "animations" | "effects" | "haptics" | "sfx" | "ambient";

function Toggle({ k, label, hint }: { k: BoolKey; label: string; hint: string }) {
  const on = useSettings()[k];
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => {
        settingsStore.set({ [k]: !on } as Partial<Settings>);
        haptic(10);
        if (k === "sfx" && !on) setTimeout(() => playSfx("select"), 30);
      }}
      className="flex w-full items-center gap-3 py-3 text-start"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <span dir="ltr" className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-gradient-primary" : "bg-muted"}`}>
        <span
          className="absolute top-1 size-5 rounded-full bg-card shadow transition-transform"
          style={{ transform: `translateX(${on ? 24 : 4}px)`, transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
        />
      </span>
    </button>
  );
}

function Volume({ k, label, disabled }: { k: "sfxVolume" | "ambientVolume"; label: string; disabled: boolean }) {
  const v = useSettings()[k];
  const { n } = useI18n();
  return (
    <label className={`block py-3 transition-opacity ${disabled ? "opacity-40" : ""}`}>
      <span className="flex items-center justify-between text-sm font-semibold">
        {label}
        <span className="font-display text-xs tabular-nums text-muted-foreground">{n(Math.round(v * 100))}%</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={Math.round(v * 100)}
        disabled={disabled}
        onChange={(e) => settingsStore.set({ [k]: Number(e.target.value) / 100 } as Partial<Settings>)}
        onPointerUp={() => k === "sfxVolume" && playSfx("select")}
        className="volume mt-2 w-full"
        aria-label={label}
      />
    </label>
  );
}

function SettingsPage() {
  const s = useSettings();
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const all = [{ code: "auto" as const, name: t("languageAuto") }, ...LANGUAGES];
  const top = all.filter((l) => (POPULAR as readonly string[]).includes(l.code));
  // Keep the chosen language visible even when collapsed
  if (!top.some((l) => l.code === s.language)) top.push(all.find((l) => l.code === s.language)!);
  const extra = all.filter((l) => !top.includes(l));
  const pickLang = (code: LocaleCode | "auto") => {
    haptic(8);
    settingsStore.set({ language: code });
  };
  return (
    <Screen>
      <ScreenHeader title={t("settings")} />
      <div className="flex flex-col gap-3 px-4 pb-6">
        <Panel>
          <p className="mb-3 text-sm font-semibold">{t("theme")}</p>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((th) => {
              const active = s.theme === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => (haptic(8), settingsStore.set({ theme: th.id }))}
                  aria-pressed={active}
                  className={`press flex flex-col items-center gap-1.5 rounded-2xl px-1 py-3 text-center text-xs font-semibold transition-colors ${
                    active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {th.icon}
                  {t(th.label)}
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel delay={60} className="!py-1">
          <p className="pt-3 text-sm font-semibold">{t("audio")}</p>
          <div className="divide-y divide-border">
            <Toggle k="sfx" label={t("sfx")} hint={t("sfxHint")} />
            <Volume k="sfxVolume" label={t("sfxVolume")} disabled={!s.sfx} />
            <Toggle k="ambient" label={t("ambient")} hint={t("ambientHint")} />
            <Volume k="ambientVolume" label={t("ambientVolume")} disabled={!s.ambient} />
          </div>
        </Panel>

        <Panel delay={120} className="divide-y divide-border !py-1">
          <Toggle k="animations" label={t("animations")} hint={t("animationsHint")} />
          <Toggle k="effects" label={t("effects")} hint={t("effectsHint")} />
          <Toggle k="haptics" label={t("haptics")} hint={t("hapticsHint")} />
        </Panel>

        <Panel delay={180} className="!px-2">
          <p className="mb-2 px-2 text-sm font-semibold">{t("language")}</p>
          <ul className="flex flex-col gap-0.5" role="radiogroup" aria-label={t("language")}>
            {[...top, ...(expanded ? extra : [])].map((l, idx) => {
              const active = s.language === l.code;
              return (
                <li key={l.code} className={idx >= top.length ? "anim-rise" : undefined} style={idx >= top.length ? { animationDelay: `${Math.min(idx - top.length, 12) * 20}ms` } : undefined}>
                  <button
                    role="radio"
                    aria-checked={active}
                    lang={l.code === "auto" ? undefined : l.code}
                    onClick={() => pickLang(l.code)}
                    className={`press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors ${
                      active ? "bg-gradient-primary font-semibold text-primary-foreground" : "hover:bg-secondary"
                    }`}
                  >
                    <span className="flex-1">{l.name}</span>
                    {active && <Check className="size-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => (haptic(8), setExpanded((v) => !v))}
            aria-expanded={expanded}
            className="press mx-auto mt-2 flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold text-primary"
          >
            {expanded ? t("showLess") : t("showMore")}
            <ChevronDown className={`size-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </Panel>
      </div>
    </Screen>
  );
}
