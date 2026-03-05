// @ts-check

/**
 * SigUI core i18n module for scripts.
 * @module
 */
export const SCRIPT_FONT_STACKS = {
  latin: {
    script: "latin",
    recommended: "Inter, system-ui, sans-serif",
    fallback: "system-ui"
  },
  arabic: {
    script: "arabic",
    recommended: "'Noto Sans Arabic', 'Segoe UI', system-ui, sans-serif",
    fallback: "system-ui"
  },
  japanese: {
    script: "japanese",
    recommended: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', system-ui, sans-serif",
    fallback: "system-ui"
  },
  korean: {
    script: "korean",
    recommended: "'Noto Sans KR', 'Malgun Gothic', system-ui, sans-serif",
    fallback: "system-ui"
  },
  simplifiedChinese: {
    script: "simplifiedChinese",
    recommended: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
    fallback: "system-ui"
  },
  traditionalChinese: {
    script: "traditionalChinese",
    recommended: "'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif",
    fallback: "system-ui"
  },
  devanagari: {
    script: "devanagari",
    recommended: "'Noto Sans Devanagari', system-ui, sans-serif",
    fallback: "system-ui"
  },
  thai: {
    script: "thai",
    recommended: "'Noto Sans Thai', system-ui, sans-serif",
    fallback: "system-ui"
  }
};
export const SCRIPT_LINE_HEIGHTS = {
  latin: {
    script: "latin",
    bodyLineHeight: 1.55,
    headingLineHeight: 1.3,
    offset: 0
  },
  arabic: {
    script: "arabic",
    bodyLineHeight: 1.65,
    headingLineHeight: 1.35,
    offset: 0.1
  },
  japanese: {
    script: "japanese",
    bodyLineHeight: 1.75,
    headingLineHeight: 1.4,
    offset: 0.2
  },
  korean: {
    script: "korean",
    bodyLineHeight: 1.75,
    headingLineHeight: 1.4,
    offset: 0.2
  },
  simplifiedChinese: {
    script: "simplifiedChinese",
    bodyLineHeight: 1.75,
    headingLineHeight: 1.4,
    offset: 0.2
  },
  traditionalChinese: {
    script: "traditionalChinese",
    bodyLineHeight: 1.75,
    headingLineHeight: 1.4,
    offset: 0.2
  },
  devanagari: {
    script: "devanagari",
    bodyLineHeight: 1.75,
    headingLineHeight: 1.4,
    offset: 0.2
  },
  thai: {
    script: "thai",
    bodyLineHeight: 1.9,
    headingLineHeight: 1.5,
    offset: 0.3
  }
};
export const SCRIPT_DENSITY_CATEGORIES = [
  {
    name: "english-like",
    scripts: ["latin"],
    lineHeightOffset: 0,
    apcaOffset: 0
  },
  {
    name: "tall",
    scripts: ["arabic", "devanagari", "thai"],
    lineHeightOffset: 0.1,
    apcaOffset: 5
  },
  {
    name: "dense",
    scripts: ["japanese", "korean", "simplifiedChinese", "traditionalChinese"],
    lineHeightOffset: 0.2,
    apcaOffset: 5
  }
];
export const APCA_SCRIPT_ADJUSTMENTS = [
  { script: "latin", contrastOffset: 0 },
  { script: "arabic", contrastOffset: 5 },
  { script: "japanese", contrastOffset: 5 },
  { script: "korean", contrastOffset: 5 },
  { script: "simplifiedChinese", contrastOffset: 5 },
  { script: "traditionalChinese", contrastOffset: 5 },
  { script: "devanagari", contrastOffset: 5 },
  { script: "thai", contrastOffset: 10 }
];
const LOCALE_SCRIPT_MAP = {
  ar: "arabic",
  fa: "arabic",
  ur: "arabic",
  he: "arabic",
  ps: "arabic",
  sd: "arabic",
  ja: "japanese",
  ko: "korean",
  "zh-hans": "simplifiedChinese",
  "zh-cn": "simplifiedChinese",
  "zh-hant": "traditionalChinese",
  "zh-tw": "traditionalChinese",
  "zh-hk": "traditionalChinese",
  zh: "simplifiedChinese",
  hi: "devanagari",
  mr: "devanagari",
  ne: "devanagari",
  th: "thai"
};
/**
 * getScriptForLocale.
 * @param {string} locale
 * @returns {ScriptName}
 */
export function getScriptForLocale(locale) {
  const lower = locale.toLowerCase();
  if (LOCALE_SCRIPT_MAP[lower])
    return LOCALE_SCRIPT_MAP[lower];
  const primary = lower.split("-")[0];
  if (LOCALE_SCRIPT_MAP[primary])
    return LOCALE_SCRIPT_MAP[primary];
  return "latin";
}
/**
 * getScriptCategory.
 * @param {string} locale
 * @returns {ScriptCategory}
 */
export function getScriptCategory(locale) {
  const script = getScriptForLocale(locale);
  for (const profile of SCRIPT_DENSITY_CATEGORIES) {
    if (profile.scripts.includes(script)) {
      return profile.name;
    }
  }
  return "english-like";
}
/**
 * getLineHeightOffset.
 * @param {string} locale
 * @returns {number}
 */
export function getLineHeightOffset(locale) {
  const script = getScriptForLocale(locale);
  return SCRIPT_LINE_HEIGHTS[script].offset;
}
/**
 * getAPCAOffset.
 * @param {string} locale
 * @returns {number}
 */
export function getAPCAOffset(locale) {
  const script = getScriptForLocale(locale);
  const adj = APCA_SCRIPT_ADJUSTMENTS.find((a) => a.script === script);
  return adj?.contrastOffset ?? 0;
}
/**
 * getScriptFontStack.
 * @param {ScriptName} script
 * @returns {ScriptFontStack}
 */
export function getScriptFontStack(script) {
  return SCRIPT_FONT_STACKS[script];
}
