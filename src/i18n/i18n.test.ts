import { describe, expect, it } from "vitest";
import ptBR from "./locales/pt-BR.json";
import { format } from "./index";
import { isRtl, LANGUAGES, matchLocale } from "./languages";

const files = import.meta.glob<{ default: Record<string, string> }>("./locales/*.json", { eager: true });

describe("translations", () => {
  it("every listed language has a complete file", () => {
    const keys = Object.keys(ptBR).sort();
    for (const l of LANGUAGES) {
      const dict = files[`./locales/${l.code}.json`]?.default;
      expect(dict, l.code).toBeDefined();
      expect(Object.keys(dict!).sort(), l.code).toEqual(keys);
      for (const k of keys) expect(dict![k]!.trim().length, `${l.code}.${k}`).toBeGreaterThan(0);
    }
  });
  it("keeps placeholders in every language", () => {
    for (const l of LANGUAGES) {
      const d = files[`./locales/${l.code}.json`]!.default;
      expect(d.combo).toContain("{n}");
      expect(d.summary).toContain("{lines}");
      expect(d.summary).toContain("{moves}");
    }
  });
  it("formats variables", () => {
    expect(format("{lines} linhas · {moves} jogadas", { lines: 3, moves: 9 })).toBe("3 linhas · 9 jogadas");
  });
});

describe("languages", () => {
  it("marks Arabic and Hebrew as right-to-left", () => {
    expect(isRtl("ar")).toBe(true);
    expect(isRtl("he")).toBe(true);
    expect(isRtl("pt-BR")).toBe(false);
  });
  it("follows the device language", () => {
    expect(matchLocale(["pt-BR"])).toBe("pt-BR");
    expect(matchLocale(["pt-PT"])).toBe("pt-PT");
    expect(matchLocale(["zh-Hant-HK"])).toBe("zh-TW");
    expect(matchLocale(["zh"])).toBe("zh-CN");
    expect(matchLocale(["no"])).toBe("nb");
    expect(matchLocale(["de-AT"])).toBe("de");
    expect(matchLocale(["xx"])).toBe("en");
  });
});
