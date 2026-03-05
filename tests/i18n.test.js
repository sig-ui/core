// @ts-check

/**
 * Repository module for i18n.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  RTL_LOCALES,
  isRTLLocale,
  getLocaleDirection,
  SCRIPT_FONT_STACKS,
  SCRIPT_LINE_HEIGHTS,
  SCRIPT_DENSITY_CATEGORIES,
  APCA_SCRIPT_ADJUSTMENTS,
  getScriptForLocale,
  getScriptCategory,
  getLineHeightOffset,
  getAPCAOffset,
  getScriptFontStack,
  LANGUAGE_EXPANSION_RATIOS,
  IBM_EXPANSION_GUIDELINES,
  estimateExpansion,
  pseudoLocalize,
  LOGICAL_PROPERTY_MAP,
  DIRECTIONAL_ICONS,
  generateI18nCSS,
  i18nToDTCG
} from "../src/index.js";
describe("direction", () => {
  test("RTL_LOCALES contains expected locales", () => {
    expect(RTL_LOCALES).toContain("ar");
    expect(RTL_LOCALES).toContain("he");
    expect(RTL_LOCALES).toContain("fa");
    expect(RTL_LOCALES).toContain("ur");
    expect(RTL_LOCALES).toContain("yi");
    expect(RTL_LOCALES).toContain("ps");
    expect(RTL_LOCALES).toContain("sd");
    expect(RTL_LOCALES.length).toBe(7);
  });
  test("isRTLLocale returns true for RTL locales", () => {
    expect(isRTLLocale("ar")).toBe(true);
    expect(isRTLLocale("he")).toBe(true);
    expect(isRTLLocale("fa")).toBe(true);
    expect(isRTLLocale("ur")).toBe(true);
  });
  test("isRTLLocale returns false for LTR locales", () => {
    expect(isRTLLocale("en")).toBe(false);
    expect(isRTLLocale("fr")).toBe(false);
    expect(isRTLLocale("ja")).toBe(false);
    expect(isRTLLocale("zh")).toBe(false);
  });
  test("isRTLLocale handles locale subtags", () => {
    expect(isRTLLocale("ar-EG")).toBe(true);
    expect(isRTLLocale("en-US")).toBe(false);
    expect(isRTLLocale("fa-IR")).toBe(true);
  });
  test("getLocaleDirection returns correct direction", () => {
    expect(getLocaleDirection("ar")).toBe("rtl");
    expect(getLocaleDirection("en")).toBe("ltr");
    expect(getLocaleDirection("he")).toBe("rtl");
    expect(getLocaleDirection("ja")).toBe("ltr");
    expect(getLocaleDirection("ar-SA")).toBe("rtl");
    expect(getLocaleDirection("en-GB")).toBe("ltr");
  });
});
describe("scripts", () => {
  test("SCRIPT_FONT_STACKS has all 8 scripts", () => {
    const scripts = Object.keys(SCRIPT_FONT_STACKS);
    expect(scripts.length).toBe(8);
    expect(scripts).toContain("latin");
    expect(scripts).toContain("arabic");
    expect(scripts).toContain("japanese");
    expect(scripts).toContain("korean");
    expect(scripts).toContain("simplifiedChinese");
    expect(scripts).toContain("traditionalChinese");
    expect(scripts).toContain("devanagari");
    expect(scripts).toContain("thai");
  });
  test("SCRIPT_FONT_STACKS entries have required fields", () => {
    for (const [name, stack] of Object.entries(SCRIPT_FONT_STACKS)) {
      expect(stack.script).toBe(name);
      expect(stack.recommended).toBeTruthy();
      expect(stack.fallback).toBeTruthy();
    }
  });
  test("SCRIPT_LINE_HEIGHTS has all 8 scripts", () => {
    expect(Object.keys(SCRIPT_LINE_HEIGHTS).length).toBe(8);
  });
  test("latin has zero line height offset", () => {
    expect(SCRIPT_LINE_HEIGHTS.latin.offset).toBe(0);
  });
  test("thai has highest line height offset", () => {
    const offsets = Object.values(SCRIPT_LINE_HEIGHTS).map((s) => s.offset);
    expect(SCRIPT_LINE_HEIGHTS.thai.offset).toBe(Math.max(...offsets));
  });
  test("SCRIPT_DENSITY_CATEGORIES has 3 categories", () => {
    expect(SCRIPT_DENSITY_CATEGORIES.length).toBe(3);
    const names = SCRIPT_DENSITY_CATEGORIES.map((c) => c.name);
    expect(names).toContain("english-like");
    expect(names).toContain("tall");
    expect(names).toContain("dense");
  });
  test("APCA_SCRIPT_ADJUSTMENTS has all 8 scripts", () => {
    expect(APCA_SCRIPT_ADJUSTMENTS.length).toBe(8);
  });
  test("latin has zero APCA offset", () => {
    const latin = APCA_SCRIPT_ADJUSTMENTS.find((a) => a.script === "latin");
    expect(latin?.contrastOffset).toBe(0);
  });
  test("thai has highest APCA offset", () => {
    const thai = APCA_SCRIPT_ADJUSTMENTS.find((a) => a.script === "thai");
    expect(thai?.contrastOffset).toBe(10);
  });
  test("getScriptForLocale resolves correctly", () => {
    expect(getScriptForLocale("en")).toBe("latin");
    expect(getScriptForLocale("ar")).toBe("arabic");
    expect(getScriptForLocale("ar-EG")).toBe("arabic");
    expect(getScriptForLocale("ja")).toBe("japanese");
    expect(getScriptForLocale("ko")).toBe("korean");
    expect(getScriptForLocale("zh-Hans")).toBe("simplifiedChinese");
    expect(getScriptForLocale("zh-CN")).toBe("simplifiedChinese");
    expect(getScriptForLocale("zh-Hant")).toBe("traditionalChinese");
    expect(getScriptForLocale("zh-TW")).toBe("traditionalChinese");
    expect(getScriptForLocale("zh")).toBe("simplifiedChinese");
    expect(getScriptForLocale("hi")).toBe("devanagari");
    expect(getScriptForLocale("th")).toBe("thai");
    expect(getScriptForLocale("fr")).toBe("latin");
    expect(getScriptForLocale("de")).toBe("latin");
  });
  test("getScriptCategory returns correct category", () => {
    expect(getScriptCategory("en")).toBe("english-like");
    expect(getScriptCategory("ar")).toBe("tall");
    expect(getScriptCategory("hi")).toBe("tall");
    expect(getScriptCategory("th")).toBe("tall");
    expect(getScriptCategory("ja")).toBe("dense");
    expect(getScriptCategory("ko")).toBe("dense");
    expect(getScriptCategory("zh")).toBe("dense");
  });
  test("getLineHeightOffset returns correct offsets", () => {
    expect(getLineHeightOffset("en")).toBe(0);
    expect(getLineHeightOffset("ar")).toBe(0.1);
    expect(getLineHeightOffset("ja")).toBe(0.2);
    expect(getLineHeightOffset("ko")).toBe(0.2);
    expect(getLineHeightOffset("hi")).toBe(0.2);
    expect(getLineHeightOffset("th")).toBe(0.3);
  });
  test("getAPCAOffset returns correct offsets", () => {
    expect(getAPCAOffset("en")).toBe(0);
    expect(getAPCAOffset("ar")).toBe(5);
    expect(getAPCAOffset("ja")).toBe(5);
    expect(getAPCAOffset("th")).toBe(10);
    expect(getAPCAOffset("hi")).toBe(5);
  });
  test("getScriptFontStack returns correct font stack", () => {
    const latin = getScriptFontStack("latin");
    expect(latin.recommended).toContain("Inter");
    expect(latin.fallback).toBe("system-ui");
    const arabic = getScriptFontStack("arabic");
    expect(arabic.recommended).toContain("Noto Sans Arabic");
    const jp = getScriptFontStack("japanese");
    expect(jp.recommended).toContain("Noto Sans JP");
  });
});
describe("expansion", () => {
  test("LANGUAGE_EXPANSION_RATIOS has 20 languages", () => {
    expect(LANGUAGE_EXPANSION_RATIOS.length).toBe(20);
  });
  test("all expansion ratios have required fields", () => {
    for (const ratio of LANGUAGE_EXPANSION_RATIOS) {
      expect(ratio.language).toBeTruthy();
      expect(ratio.code).toBeTruthy();
      expect(typeof ratio.short).toBe("number");
      expect(typeof ratio.medium).toBe("number");
      expect(typeof ratio.long).toBe("number");
      expect(typeof ratio.overall).toBe("number");
    }
  });
  test("German has highest overall expansion", () => {
    const de = LANGUAGE_EXPANSION_RATIOS.find((r) => r.code === "de");
    expect(de?.overall).toBe(0.35);
  });
  test("Chinese (Simplified) has strongest contraction", () => {
    const zh = LANGUAGE_EXPANSION_RATIOS.find((r) => r.code === "zh-Hans");
    expect(zh?.overall).toBe(-0.5);
  });
  test("IBM_EXPANSION_GUIDELINES has 6 entries", () => {
    expect(IBM_EXPANSION_GUIDELINES.length).toBe(6);
  });
  test("estimateExpansion for German short strings is high", () => {
    const mult = estimateExpansion(5, "de");
    expect(mult).toBe(2.5);
  });
  test("estimateExpansion for German long strings is lower", () => {
    const mult = estimateExpansion(50, "de");
    expect(mult).toBe(1.35);
  });
  test("estimateExpansion for Japanese contracts", () => {
    const mult = estimateExpansion(20, "ja");
    expect(mult).toBe(0.6);
  });
  test("estimateExpansion for Chinese short contracts strongly", () => {
    const mult = estimateExpansion(5, "zh-Hans");
    expect(mult).toBe(0.4);
  });
  test("estimateExpansion for English-like uses baseline", () => {
    const mult = estimateExpansion(15, "en");
    expect(mult).toBe(2);
  });
  test("estimateExpansion handles locale subtags", () => {
    const mult = estimateExpansion(5, "de-DE");
    expect(mult).toBe(2.5);
  });
});
describe("pseudoLocalize", () => {
  test("accented mode replaces Latin chars", () => {
    const result = pseudoLocalize("Settings", "accented");
    expect(result).not.toBe("Settings");
    expect(result.length).toBe(8);
    expect(result).not.toMatch(/[a-zA-Z]/);
  });
  test("expanded mode triples vowels and adds padding", () => {
    const result = pseudoLocalize("Save", "expanded");
    expect(result.startsWith("[")).toBe(true);
    expect(result.endsWith("]")).toBe(true);
    expect(result.length).toBeGreaterThan(6);
  });
  test("mirrored mode transforms characters", () => {
    const result = pseudoLocalize("Hello", "mirrored");
    expect(result).not.toBe("Hello");
    expect(result.length).toBe(5);
  });
  test("bracketed mode wraps in brackets", () => {
    const result = pseudoLocalize("Settings", "bracketed");
    expect(result).toBe("[Settings]");
  });
  test("expanded mode respects custom expansion ratio", () => {
    const small = pseudoLocalize("Test", "expanded", { expansionRatio: 0.1 });
    const large = pseudoLocalize("Test", "expanded", { expansionRatio: 0.8 });
    expect(large.length).toBeGreaterThan(small.length);
  });
});
describe("logical properties", () => {
  test("LOGICAL_PROPERTY_MAP has entries", () => {
    expect(LOGICAL_PROPERTY_MAP.length).toBeGreaterThan(20);
  });
  test("all mappings have required fields", () => {
    for (const mapping of LOGICAL_PROPERTY_MAP) {
      expect(mapping.physical).toBeTruthy();
      expect(mapping.logical).toBeTruthy();
      expect(["block", "inline"]).toContain(mapping.axis);
    }
  });
  test("margin-left maps to margin-inline-start", () => {
    const found = LOGICAL_PROPERTY_MAP.find((m) => m.physical === "margin-left");
    expect(found?.logical).toBe("margin-inline-start");
    expect(found?.axis).toBe("inline");
  });
  test("top maps to inset-block-start", () => {
    const found = LOGICAL_PROPERTY_MAP.find((m) => m.physical === "top");
    expect(found?.logical).toBe("inset-block-start");
    expect(found?.axis).toBe("block");
  });
  test("width maps to inline-size", () => {
    const found = LOGICAL_PROPERTY_MAP.find((m) => m.physical === "width");
    expect(found?.logical).toBe("inline-size");
  });
});
describe("directional icons", () => {
  test("DIRECTIONAL_ICONS has entries", () => {
    expect(DIRECTIONAL_ICONS.length).toBeGreaterThan(10);
  });
  test("arrows must mirror", () => {
    const arrowFwd = DIRECTIONAL_ICONS.find((i) => i.icon === "arrow-forward");
    expect(arrowFwd?.mustMirror).toBe(true);
  });
  test("play must not mirror", () => {
    const play = DIRECTIONAL_ICONS.find((i) => i.icon === "play");
    expect(play?.mustMirror).toBe(false);
  });
  test("checkmark must not mirror", () => {
    const check = DIRECTIONAL_ICONS.find((i) => i.icon === "checkmark");
    expect(check?.mustMirror).toBe(false);
  });
});
describe("generateI18nCSS", () => {
  test("generates direction variable", () => {
    const css = generateI18nCSS();
    expect(css).toContain("--i18n-direction: 1;");
  });
  test("generates RTL override", () => {
    const css = generateI18nCSS();
    expect(css).toContain(":dir(rtl)");
    expect(css).toContain("--i18n-direction: -1;");
  });
  test("generates Arabic overrides", () => {
    const css = generateI18nCSS();
    expect(css).toContain(":lang(ar)");
    expect(css).toContain("--i18n-line-height-offset: 0.1;");
    expect(css).toContain("Noto Sans Arabic");
  });
  test("generates Japanese overrides", () => {
    const css = generateI18nCSS();
    expect(css).toContain(":lang(ja)");
    expect(css).toContain("line-break: strict;");
    expect(css).toContain("Noto Sans JP");
  });
  test("generates Korean overrides", () => {
    const css = generateI18nCSS();
    expect(css).toContain(":lang(ko)");
    expect(css).toContain("word-break: keep-all;");
  });
  test("generates CJK letter spacing override", () => {
    const css = generateI18nCSS();
    expect(css).toContain("letter-spacing: var(--i18n-letter-spacing-override, inherit) !important;");
  });
  test("generates icon mirroring", () => {
    const css = generateI18nCSS();
    expect(css).toContain(".icon-directional");
    expect(css).toContain("scaleX(-1)");
  });
  test("generates CJK punctuation trim", () => {
    const css = generateI18nCSS();
    expect(css).toContain("text-spacing-trim");
  });
  test("icon mirroring can be disabled", () => {
    const css = generateI18nCSS({ rtl: { mirrorIcons: false } });
    expect(css).not.toContain(".icon-directional");
  });
  test("punctuation trim can be disabled", () => {
    const css = generateI18nCSS({ cjk: { punctuationTrim: false } });
    expect(css).not.toContain("text-spacing-trim");
  });
  test("custom font families are used", () => {
    const css = generateI18nCSS({
      fontFamilies: { arabic: "'Custom Arabic Font', sans-serif" }
    });
    expect(css).toContain("Custom Arabic Font");
  });
  test("custom script overrides are applied", () => {
    const css = generateI18nCSS({
      scriptOverrides: { arabic: { lineHeightOffset: 0.15 } }
    });
    expect(css).toContain("--i18n-line-height-offset: 0.15;");
  });
});
describe("i18nToDTCG", () => {
  test("generates font family tokens with i18n extensions", () => {
    const result = i18nToDTCG({
      fontFamilies: {
        ar: "'Noto Sans Arabic', system-ui",
        ja: "'Noto Sans JP', system-ui"
      }
    });
    const font = result.fontFamily?.sans;
    expect(font.$type).toBe("fontFamily");
    expect(font.$extensions["sigui.i18n"].ar).toContain("Noto Sans Arabic");
    expect(font.$extensions["sigui.i18n"].ja).toContain("Noto Sans JP");
  });
  test("generates line height tokens with i18n extensions", () => {
    const result = i18nToDTCG({
      lineHeights: { ar: 1.65, ja: 1.75 }
    });
    const lh = result.lineHeight?.body;
    expect(lh.$value).toBe(1.55);
    expect(lh.$extensions["sigui.i18n"].ar).toBe(1.65);
    expect(lh.$extensions["sigui.i18n"].ja).toBe(1.75);
  });
  test("generates APCA offset tokens with i18n extensions", () => {
    const result = i18nToDTCG({
      apcaOffsets: { ar: 5, th: 10 }
    });
    const apca = result.accessibility?.apcaOffset;
    expect(apca.$value).toBe(0);
    expect(apca.$extensions["sigui.i18n"].ar).toBe(5);
    expect(apca.$extensions["sigui.i18n"].th).toBe(10);
  });
  test("generates font weight tokens with i18n extensions", () => {
    const result = i18nToDTCG({
      fontWeights: { ja: 300, ko: 300 }
    });
    const fw = result.fontWeight?.body;
    expect(fw.$value).toBe(400);
    expect(fw.$extensions["sigui.i18n"].ja).toBe(300);
  });
  test("returns empty group when no config provided", () => {
    const result = i18nToDTCG({});
    expect(Object.keys(result).length).toBe(0);
  });
});
