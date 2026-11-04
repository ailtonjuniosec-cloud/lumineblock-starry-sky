import { useMemo, useSyncExternalStore } from "react";
import ptBR from "./locales/pt-BR.json";
import { DEFAULT_LOCALE, isRtl, type LocaleCode } from "./languages";

export type Messages = typeof ptBR;
export type MsgKey = keyof Messages;

// Only the active locale is fetched; pt-BR is bundled as the fallback.
const loaders = import.meta.glob<{ default: Messages }>(["./locales/*.json", "!./locales/pt-BR.json"]);

interface Current {
  code: LocaleCode;
  dict: Messages;
}
const initial: Current = { code: DEFAULT_LOCALE, dict: ptBR };
let current = initial;
let pending: string | null = null;
const listeners = new Set<() => void>();

export async function loadMessages(code: LocaleCode): Promise<Messages> {
  if (code === DEFAULT_LOCALE) return ptBR;
  const loader = loaders[`./locales/${code}.json`];
  return loader ? (await loader()).default : ptBR;
}

export async function setLocale(code: LocaleCode) {
  if (code === current.code && !pending) return applyDocument(code);
  pending = code;
  const dict = await loadMessages(code);
  if (pending !== code) return; // a newer request won
  pending = null;
  current = { code, dict };
  applyDocument(code);
  listeners.forEach((l) => l());
}

function applyDocument(code: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.lang = code;
  root.dir = isRtl(code) ? "rtl" : "ltr";
}

export function format(msg: string, vars?: Record<string, string | number>) {
  return vars ? msg.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : msg;
}

const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l));

export function useI18n() {
  const c = useSyncExternalStore(subscribe, () => current, () => initial);
  return useMemo(() => {
    const nfmt = new Intl.NumberFormat(c.code);
    return {
      locale: c.code,
      t: (k: MsgKey, vars?: Record<string, string | number>) => format(c.dict[k] ?? ptBR[k], vars),
      n: (v: number) => nfmt.format(v),
    };
  }, [c]);
}
