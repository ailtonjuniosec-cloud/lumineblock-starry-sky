import { createFileRoute } from "@tanstack/react-router";
import { Panel, LogoMark, Screen, ScreenHeader } from "@/components/lumine/ui";
import { useI18n, type MsgKey } from "@/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Sobre — LumineBlock" },
      { name: "description", content: "LumineBlock versão 1.0, codinome Starry Sky, por Ailton Junio." },
      { property: "og:title", content: "Sobre — LumineBlock" },
      { property: "og:description", content: "Informações do LumineBlock 1.0 Starry Sky." },
    ],
  }),
  component: AboutPage,
});

const INFO: [MsgKey, string | MsgKey][] = [
  ["version", "1.0"],
  ["developer", "Ailton Junio"],
  ["codename", "Starry Sky"],
  ["status", "stable"],
];

function AboutPage() {
  const { t } = useI18n();
  return (
    <Screen>
      <ScreenHeader title={t("about")} />
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <Panel className="flex flex-col items-center py-8 text-center">
          <div className="glass grid size-24 place-items-center rounded-[28px] shadow-glow">
            <LogoMark size={52} />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Lumine<span className="text-gradient">Block</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("version")} 1.0</p>
        </Panel>
        <Panel delay={80} className="!py-1">
          <dl className="divide-y divide-border">
            {INFO.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-3.5 text-sm">
                <dt className="text-muted-foreground">{t(k)}</dt>
                <dd className="font-semibold">
                  {k === "status" ? (
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground">{t(v as MsgKey)}</span>
                  ) : (
                    v
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>
        <footer className="mt-auto pt-6 text-center text-xs text-muted-foreground">
          {t("footer")}
        </footer>
      </div>
    </Screen>
  );
}
