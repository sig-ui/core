// @ts-check

/**
 * SigUI core i18n module for css.
 * @module
 */
const DEFAULT_FONT_FAMILIES = {
  arabic: "'Noto Sans Arabic', 'Segoe UI', system-ui, sans-serif",
  japanese: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', system-ui, sans-serif",
  korean: "'Noto Sans KR', 'Malgun Gothic', system-ui, sans-serif",
  simplifiedChinese: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
  traditionalChinese: "'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif",
  devanagari: "'Noto Sans Devanagari', system-ui, sans-serif",
  thai: "'Noto Sans Thai', system-ui, sans-serif"
};
/**
 * generateI18nCSS.
 * @param {I18nCSSConfig} config
 * @returns {string}
 */
export function generateI18nCSS(config = {}) {
  const lines = [];
  const fonts = { ...DEFAULT_FONT_FAMILIES, ...config.fontFamilies };
  const scriptOverrides = config.scriptOverrides ?? {};
  const rtl = config.rtl ?? { mirrorIcons: true, mirrorMotion: true };
  const cjk = config.cjk ?? { punctuationTrim: true };
  const arabicOffset = scriptOverrides.arabic?.lineHeightOffset ?? 0.1;
  const cjkOffset = scriptOverrides.cjk?.lineHeightOffset ?? 0.2;
  const cjkMeasure = scriptOverrides.cjk?.measure ?? 45;
  const devanagariOffset = scriptOverrides.devanagari?.lineHeightOffset ?? 0.2;
  const thaiOffset = scriptOverrides.thai?.lineHeightOffset ?? 0.3;
  lines.push("/* i18n: Direction variable (Spec 08 §11.4) */");
  lines.push(":root {");
  lines.push("  --i18n-direction: 1;");
  lines.push("  --i18n-line-height-offset: 0;");
  lines.push("  --i18n-letter-spacing-override: inherit;");
  lines.push("  --i18n-measure: var(--sg-measure-base, 66ch);");
  lines.push("}");
  lines.push("");
  lines.push(":dir(rtl) {");
  lines.push("  --i18n-direction: -1;");
  lines.push("}");
  lines.push("");
  lines.push("/* i18n: Arabic script overrides */");
  lines.push(":lang(ar), :lang(fa), :lang(ur), :lang(he) {");
  lines.push(`  --i18n-line-height-offset: ${arabicOffset};`);
  lines.push(`  font-family: ${fonts.arabic};`);
  lines.push("}");
  lines.push("");
  lines.push("/* i18n: Japanese script overrides */");
  lines.push(":lang(ja) {");
  lines.push(`  --i18n-line-height-offset: ${cjkOffset};`);
  lines.push("  --i18n-letter-spacing-override: 0;");
  lines.push(`  --i18n-measure: ${cjkMeasure}ch;`);
  lines.push(`  font-family: ${fonts.japanese};`);
  lines.push("  line-break: strict;");
  lines.push("}");
  lines.push("");
  lines.push("/* i18n: Korean script overrides */");
  lines.push(":lang(ko) {");
  lines.push(`  --i18n-line-height-offset: ${cjkOffset};`);
  lines.push("  --i18n-letter-spacing-override: 0;");
  lines.push(`  --i18n-measure: ${cjkMeasure}ch;`);
  lines.push(`  font-family: ${fonts.korean};`);
  lines.push("  word-break: keep-all;");
  lines.push("  overflow-wrap: break-word;");
  lines.push("}");
  lines.push("");
  lines.push("/* i18n: Simplified Chinese script overrides */");
  lines.push(":lang(zh-Hans), :lang(zh-CN) {");
  lines.push(`  --i18n-line-height-offset: ${cjkOffset};`);
  lines.push("  --i18n-letter-spacing-override: 0;");
  lines.push(`  --i18n-measure: ${Math.min(cjkMeasure, 42)}ch;`);
  lines.push(`  font-family: ${fonts.simplifiedChinese};`);
  lines.push("}");
  lines.push("");
  lines.push("/* i18n: Traditional Chinese script overrides */");
  lines.push(":lang(zh-Hant), :lang(zh-TW), :lang(zh-HK) {");
  lines.push(`  --i18n-line-height-offset: ${cjkOffset};`);
  lines.push("  --i18n-letter-spacing-override: 0;");
  lines.push(`  --i18n-measure: ${Math.min(cjkMeasure, 42)}ch;`);
  lines.push(`  font-family: ${fonts.traditionalChinese};`);
  lines.push("}");
  lines.push("");
  lines.push("/* i18n: Devanagari script overrides */");
  lines.push(":lang(hi), :lang(mr), :lang(ne) {");
  lines.push(`  --i18n-line-height-offset: ${devanagariOffset};`);
  lines.push(`  font-family: ${fonts.devanagari};`);
  lines.push("}");
  lines.push("");
  lines.push("/* i18n: Thai script overrides */");
  lines.push(":lang(th) {");
  lines.push(`  --i18n-line-height-offset: ${thaiOffset};`);
  lines.push(`  font-family: ${fonts.thai};`);
  lines.push("}");
  lines.push("");
  lines.push("/* i18n: CJK zero letter-spacing */");
  lines.push(":where(:lang(ja), :lang(ko), :lang(zh)) {");
  lines.push("  letter-spacing: var(--i18n-letter-spacing-override, inherit) !important;");
  lines.push("}");
  lines.push("");
  if (rtl.mirrorIcons !== false) {
    lines.push("/* i18n: Directional icon mirroring (Spec 08 §8.2) */");
    lines.push(":dir(rtl) .icon-directional {");
    lines.push("  transform: scaleX(-1);");
    lines.push("}");
    lines.push("");
  }
  if (cjk.punctuationTrim !== false) {
    lines.push("/* i18n: CJK punctuation trim (progressive enhancement) */");
    lines.push("@supports (text-spacing-trim: space-all) {");
    lines.push("  :where(:lang(ja), :lang(ko), :lang(zh)) {");
    lines.push("    text-spacing-trim: space-all;");
    lines.push("  }");
    lines.push("}");
    lines.push("");
  }
  return lines.join(`
`);
}
