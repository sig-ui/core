// @ts-check

/**
 * SigUI core i18n module for expansion.
 * @module
 */
export const LANGUAGE_EXPANSION_RATIOS = [
  { language: "German", code: "de", short: 1.5, medium: 0.8, long: 0.35, overall: 0.35 },
  { language: "Finnish", code: "fi", short: 1.5, medium: 0.8, long: 0.4, overall: 0.4 },
  { language: "Greek", code: "el", short: 1.3, medium: 0.7, long: 0.3, overall: 0.3 },
  { language: "Russian", code: "ru", short: 1.3, medium: 0.6, long: 0.3, overall: 0.3 },
  { language: "French", code: "fr", short: 1.2, medium: 0.5, long: 0.2, overall: 0.2 },
  { language: "Spanish", code: "es", short: 1.2, medium: 0.5, long: 0.2, overall: 0.2 },
  { language: "Portuguese", code: "pt", short: 1.2, medium: 0.5, long: 0.2, overall: 0.2 },
  { language: "Italian", code: "it", short: 1.1, medium: 0.4, long: 0.15, overall: 0.15 },
  { language: "Dutch", code: "nl", short: 1, medium: 0.4, long: 0.15, overall: 0.15 },
  { language: "Swedish", code: "sv", short: 0.8, medium: 0.3, long: 0.1, overall: 0.1 },
  { language: "Norwegian", code: "no", short: 0.8, medium: 0.3, long: 0.1, overall: 0.1 },
  { language: "Polish", code: "pl", short: 1.2, medium: 0.6, long: 0.25, overall: 0.25 },
  { language: "Arabic", code: "ar", short: 0.5, medium: 0.25, long: 0, overall: 0.05 },
  { language: "Hebrew", code: "he", short: 0.5, medium: 0.2, long: -0.05, overall: 0 },
  { language: "Japanese", code: "ja", short: -0.5, medium: -0.4, long: -0.3, overall: -0.4 },
  { language: "Chinese (Simplified)", code: "zh-Hans", short: -0.6, medium: -0.5, long: -0.4, overall: -0.5 },
  { language: "Chinese (Traditional)", code: "zh-Hant", short: -0.5, medium: -0.4, long: -0.3, overall: -0.4 },
  { language: "Korean", code: "ko", short: -0.3, medium: -0.2, long: -0.1, overall: -0.2 },
  { language: "Thai", code: "th", short: -0.2, medium: -0.1, long: 0, overall: -0.05 },
  { language: "Hindi", code: "hi", short: 0.2, medium: 0.1, long: 0.05, overall: 0.1 }
];
export const IBM_EXPANSION_GUIDELINES = [
  [10, 3],
  [20, 2],
  [30, 1.8],
  [50, 1.4],
  [70, 1.3],
  [1 / 0, 1.2]
];
/**
 * estimateExpansion.
 * @param {number} charCount
 * @param {string} locale
 * @returns {number}
 */
export function estimateExpansion(charCount, locale) {
  const lower = locale.toLowerCase();
  const ratio = LANGUAGE_EXPANSION_RATIOS.find((r) => {
    const code = r.code.toLowerCase();
    return lower === code || lower.startsWith(code + "-") || lower.startsWith(code.split("-")[0] + "-") && code.split("-")[0] === lower.split("-")[0];
  }) ?? LANGUAGE_EXPANSION_RATIOS.find((r) => {
    const primary = r.code.toLowerCase().split("-")[0];
    return lower.split("-")[0] === primary;
  });
  if (!ratio) {
    for (const [max, mult] of IBM_EXPANSION_GUIDELINES) {
      if (charCount <= max)
        return mult;
    }
    return 1.2;
  }
  let expansionPct;
  if (charCount < 10) {
    expansionPct = ratio.short;
  } else if (charCount <= 30) {
    expansionPct = ratio.medium;
  } else {
    expansionPct = ratio.long;
  }
  return 1 + expansionPct;
}
