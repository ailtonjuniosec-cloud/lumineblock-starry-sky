import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Check, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Panel, Screen, ScreenHeader } from "@/components/lumine/ui";
import { useI18n, type MsgKey } from "@/i18n";
import { haptic } from "@/lib/haptics";
import { playSfx } from "@/lib/audio";

export const Route = createFileRoute("/how-to-play")({
  head: () => ({
    meta: [
      { title: "Como jogar — LumineBlock" },
      { name: "description", content: "Tutorial completo do LumineBlock: tabuleiro, peças, linhas, pontuação e dicas." },
      { property: "og:title", content: "Como jogar — LumineBlock" },
      { property: "og:description", content: "Aprenda a jogar LumineBlock passo a passo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HowToPlay,
});

/** Tiny illustrative board. rows: "." empty, digit = block color, "g" ghost ok, "x" ghost invalid, "*" clearing. */
function Mini({ rows, size = 18 }: { rows: string[]; size?: number }) {
  const n = rows[0]!.length;
  return (
    <div dir="ltr" className="glass-flat inline-grid rounded-xl p-1.5" style={{ gridTemplateColumns: `repeat(${n}, ${size}px)`, gap: 2 }}>
      {rows.join("").split("").map((ch, i) => {
        if (ch === ".") return <span key={i} className="rounded-[4px] bg-muted/60" style={{ width: size, height: size }} />;
        if (ch === "g") return <span key={i} className="rounded-[4px] bg-primary/40 ring-1 ring-primary" style={{ width: size, height: size }} />;
        if (ch === "x") return <span key={i} className="rounded-[4px] bg-destructive/50 ring-1 ring-destructive" style={{ width: size, height: size }} />;
        if (ch === "*") return <span key={i} className="tile anim-pulse rounded-[4px]" style={{ width: size, height: size, ["--c" as string]: "var(--block-1)" }} />;
        return <span key={i} className="tile rounded-[4px]" style={{ width: size, height: size, ["--c" as string]: `var(--block-${ch})` }} />;
      })}
    </div>
  );
}

function Pair({ a, b, la, lb, vertical }: { a: ReactNode; b: ReactNode; la: string; lb: string; vertical?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <figure className="flex flex-col items-center gap-1">{a}<figcaption className="text-[11px] font-semibold text-muted-foreground">{la}</figcaption></figure>
      {vertical ? <ArrowDown className="size-4 text-primary" /> : <ArrowRight className="size-4 text-primary rtl:rotate-180" />}
      <figure className="flex flex-col items-center gap-1">{b}<figcaption className="text-[11px] font-semibold text-muted-foreground">{lb}</figcaption></figure>
    </div>
  );
}

function P({ k }: { k: MsgKey }) {
  const { t } = useI18n();
  return <p className="text-sm leading-relaxed text-foreground/90">{t(k)}</p>;
}

function List({ keys, ordered }: { keys: MsgKey[]; ordered?: boolean }) {
  const { t, n } = useI18n();
  return (
    <ol className="flex flex-col gap-2">
      {keys.map((k, i) => (
        <li key={k} className="flex gap-3 text-sm leading-relaxed">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gradient-primary text-[11px] font-bold text-primary-foreground">
            {ordered ? n(i + 1) : <Lightbulb className="size-3.5" />}
          </span>
          <span className="pt-0.5">{t(k)}</span>
        </li>
      ))}
    </ol>
  );
}

function useSteps() {
  const { t } = useI18n();
  return [
    {
      title: "tut1Title" as MsgKey,
      body: (
        <>
          <div className="flex justify-center py-2"><Mini rows={["1..3.", ".....", "22...", "....6", ".55.."]} /></div>
          <P k="tut1a" /><P k="tut1b" /><P k="tut1c" /><P k="tut1d" /><P k="tut1e" />
        </>
      ),
    },
    {
      title: "tut2Title" as MsgKey,
      body: (
        <>
          <List ordered keys={["tut2a", "tut2b", "tut2c", "tut2d", "tut2e", "tut2f"]} />
          <Pair la={t("tutValid")} lb={t("tutInvalid")} a={<Mini rows={["3....", ".gg..", ".gg..", "....."]} />} b={<Mini rows={["3....", "...44", "...4x", "....x"]} />} />
          <P k="tut2Rule" />
        </>
      ),
    },
    {
      title: "tut3Title" as MsgKey,
      body: (
        <>
          <P k="tut3a" /><P k="tut3b" />
          <Pair la={t("tutBefore")} lb={t("tutAfter")} a={<Mini rows={["..*..", "..*..", "*****", "..*..", "..*.."]} />} b={<Mini rows={[".....", ".....", ".....", ".....", "....."]} />} />
          <P k="tut3c" /><P k="tut3d" /><P k="tut3e" />
        </>
      ),
    },
    {
      title: "tut4Title" as MsgKey,
      body: (
        <>
          <P k="tut4a" /><P k="tut4b" />
          <div className="grid grid-cols-3 gap-2 py-1 text-center">
            {[["1", "+10"], ["2", "+40"], ["3", "+90"]].map(([l, p]) => (
              <div key={l} className="glass-flat rounded-2xl py-2">
                <p className="font-display text-lg font-extrabold text-gradient">{p}</p>
                <p className="text-[11px] text-muted-foreground"><bdi>{l}×</bdi></p>
              </div>
            ))}
          </div>
          <P k="tut4c" /><P k="tut4d" /><P k="tut4e" />
        </>
      ),
    },
    {
      title: "tut5Title" as MsgKey,
      body: (
        <>
          <Pair
            la={t("tutAvailable")}
            lb={t("unavailable")}
            a={<Mini rows={["22", "22"]} size={22} />}
            b={<div style={{ opacity: 0.35, filter: "grayscale(0.85)" }}><Mini rows={["555", "555", "555"]} size={14} /></div>}
          />
          <P k="tut5a" /><P k="tut5b" /><P k="tut5c" />
        </>
      ),
    },
    {
      title: "tut6Title" as MsgKey,
      body: (
        <>
          <div className="glass-flat mx-auto w-full max-w-[220px] rounded-2xl p-3 text-center">
            <p className="font-bold">{t("gameOverTitle")}</p>
            <p className="text-[11px] text-muted-foreground">{t("noMoves")}</p>
            <div className="mt-2 rounded-xl bg-gradient-primary py-1.5 text-xs font-semibold text-primary-foreground">{t("restart")}</div>
            <div className="mt-1 rounded-xl bg-secondary py-1.5 text-xs font-semibold text-secondary-foreground">{t("backHome")}</div>
          </div>
          <P k="tut6a" /><P k="tut6b" />
          <List keys={["tut6c", "tut6d"]} ordered />
          <P k="tut6e" />
        </>
      ),
    },
    {
      title: "tut7Title" as MsgKey,
      body: <List keys={["tip1", "tip2", "tip3", "tip4", "tip5", "tip6", "tip7"]} />,
    },
  ];
}

function HowToPlay() {
  const { t, n } = useI18n();
  const steps = useSteps();
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const go = (d: number) => {
    haptic(8);
    playSfx("select");
    setI((v) => Math.max(0, Math.min(steps.length - 1, v + d)));
  };
  const last = i === steps.length - 1;
  return (
    <Screen>
      <ScreenHeader title={t("howToPlay")} />
      <div className="flex flex-1 flex-col gap-3 px-4 pb-6">
        <div className="flex items-center gap-1.5" role="tablist" aria-label={t("howToPlay")}>
          {steps.map((s, k) => (
            <button
              key={k}
              role="tab"
              aria-selected={k === i}
              aria-label={t(s.title)}
              onClick={() => (haptic(6), setI(k))}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${k <= i ? "bg-gradient-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("tutStep", { n: n(i + 1), total: n(steps.length) })}</p>
        <Panel key={i} className="flex flex-col gap-3">
          <h2 className="text-lg font-bold tracking-tight text-gradient">{t(steps[i]!.title)}</h2>
          {steps[i]!.body}
        </Panel>
        <div className="mt-auto flex gap-2 pt-2">
          <button
            onClick={() => go(-1)}
            disabled={i === 0}
            className="glass press flex h-12 flex-1 items-center justify-center gap-1 rounded-2xl font-semibold disabled:opacity-40"
          >
            <ChevronLeft className="size-5 rtl:rotate-180" /> {t("tutPrev")}
          </button>
          {last ? (
            <button
              onClick={() => (haptic(14), playSfx("place"), navigate({ to: "/" }))}
              className="press flex h-12 flex-1 items-center justify-center gap-1 rounded-2xl bg-gradient-primary font-semibold text-primary-foreground shadow-glow"
            >
              <Check className="size-5" /> {t("tutDone")}
            </button>
          ) : (
            <button
              onClick={() => go(1)}
              className="press flex h-12 flex-1 items-center justify-center gap-1 rounded-2xl bg-gradient-primary font-semibold text-primary-foreground shadow-glow"
            >
              {t("tutNext")} <ChevronRight className="size-5 rtl:rotate-180" />
            </button>
          )}
        </div>
      </div>
    </Screen>
  );
}
