/** Supported languages, shown with their native names. Add a locale JSON + an entry here. */
export const LANGUAGES = [
  { code: "pt-BR", name: "Português (Brasil)" },
  { code: "pt-PT", name: "Português (Portugal)" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "nl", name: "Nederlands" },
  { code: "ca", name: "Català" },
  { code: "ru", name: "Русский" },
  { code: "uk", name: "Українська" },
  { code: "pl", name: "Polski" },
  { code: "cs", name: "Čeština" },
  { code: "sk", name: "Slovenčina" },
  { code: "ro", name: "Română" },
  { code: "hu", name: "Magyar" },
  { code: "bg", name: "Български" },
  { code: "hr", name: "Hrvatski" },
  { code: "sr", name: "Српски" },
  { code: "el", name: "Ελληνικά" },
  { code: "tr", name: "Türkçe" },
  { code: "sv", name: "Svenska" },
  { code: "nb", name: "Norsk bokmål" },
  { code: "da", name: "Dansk" },
  { code: "fi", name: "Suomi" },
  { code: "ar", name: "العربية", rtl: true },
  { code: "he", name: "עברית", rtl: true },
  { code: "fa", name: "فارسی", rtl: true },
  { code: "ur", name: "اردو", rtl: true },
  { code: "hi", name: "हिन्दी" },
  { code: "bn", name: "বাংলা" },
  { code: "ta", name: "தமிழ்" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh-CN", name: "简体中文" },
  { code: "zh-TW", name: "繁體中文" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "ms", name: "Bahasa Melayu" },
  { code: "fil", name: "Filipino" },
  { code: "th", name: "ไทย" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "sw", name: "Kiswahili" },
] as const satisfies readonly { code: string; name: string; rtl?: boolean }[];

export type LocaleCode = (typeof LANGUAGES)[number]["code"];
export const DEFAULT_LOCALE: LocaleCode = "pt-BR";
export const isLocale = (c: unknown): c is LocaleCode => LANGUAGES.some((l) => l.code === c);
export const isRtl = (c: string) => LANGUAGES.some((l) => l.code === c && "rtl" in l && l.rtl);

/** Map device language tags (e.g. "pt", "zh-Hant-HK", "no") to a supported locale. */
export function matchLocale(tags: readonly string[]): LocaleCode {
  for (const raw of tags) {
    const tag = raw.replace("_", "-");
    const lower = tag.toLowerCase();
    const exact = LANGUAGES.find((l) => l.code.toLowerCase() === lower);
    if (exact) return exact.code;
    const [base, ...rest] = lower.split("-");
    if (base === "pt") return rest.includes("br") || rest.length === 0 ? "pt-BR" : "pt-PT";
    if (base === "zh") return rest.some((r) => ["hant", "tw", "hk", "mo"].includes(r)) ? "zh-TW" : "zh-CN";
    if (base === "no" || base === "nn") return "nb";
    if (base === "iw") return "he";
    if (base === "tl") return "fil";
    if (base === "in") return "id";
    const b = LANGUAGES.find((l) => l.code === base);
    if (b) return b.code;
  }
  return "en";
}
