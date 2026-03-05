// @ts-check

/**
 * SigUI core performance module for font loading.
 * @module
 */
import { DEFAULT_FONT_BUDGET } from "./budgets.js";
/**
 * getFontDisplay.
 * @param {FontRole} role
 * @returns {FontDisplayStrategy}
 */
export function getFontDisplay(role) {
  switch (role) {
    case "body":
      return "swap";
    case "heading":
      return "optional";
    case "monospace":
      return "swap";
    case "icon":
      return "block";
  }
}
/**
 * validateFontSize.
 * @param {number} sizeBytes
 * @param {"latin" | "cjk"} category
 * @param {Partial<FontBudget>} budget
 * @returns {boolean}
 */
export function validateFontSize(sizeBytes, category, budget) {
  const merged = { ...DEFAULT_FONT_BUDGET, ...budget };
  const max = category === "latin" ? merged.maxLatinFontSize : merged.maxCjkSubsetSize;
  return sizeBytes <= max;
}
/**
 * validateFontPayload.
 * @param {number} totalBytes
 * @param {Partial<FontBudget>} budget
 * @returns {boolean}
 */
export function validateFontPayload(totalBytes, budget) {
  const max = budget?.maxInitialFontPayload ?? DEFAULT_FONT_BUDGET.maxInitialFontPayload;
  return totalBytes <= max;
}
/**
 * validatePreloadCount.
 * @param {number} count
 * @param {Partial<FontBudget>} budget
 * @returns {boolean}
 */
export function validatePreloadCount(count, budget) {
  const max = budget?.maxPreloadFonts ?? DEFAULT_FONT_BUDGET.maxPreloadFonts;
  return count <= max;
}
/**
 * getFontPreloadRules.
 * @returns {readonly string[]}
 */
export function getFontPreloadRules() {
  return [
    "Preload at most 2 font files",
    "Always include crossorigin (even for same-origin fonts)",
    "Preload only WOFF2 format",
    "Preload only the variable font or the most-used weight"
  ];
}
