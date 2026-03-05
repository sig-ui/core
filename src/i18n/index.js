// @ts-check

/**
 * SigUI core i18n module for index.
 * @module
 */
export {
  RTL_LOCALES,
  isRTLLocale,
  getLocaleDirection
} from "./direction.js";
export {
  SCRIPT_FONT_STACKS,
  SCRIPT_LINE_HEIGHTS,
  SCRIPT_DENSITY_CATEGORIES,
  APCA_SCRIPT_ADJUSTMENTS,
  getScriptForLocale,
  getScriptCategory,
  getLineHeightOffset,
  getAPCAOffset,
  getScriptFontStack
} from "./scripts.js";
export {
  LANGUAGE_EXPANSION_RATIOS,
  IBM_EXPANSION_GUIDELINES,
  estimateExpansion
} from "./expansion.js";
export { pseudoLocalize } from "./pseudo.js";
export {
  LOGICAL_PROPERTY_MAP,
  DIRECTIONAL_ICONS
} from "./logical-properties.js";
export { generateI18nCSS } from "./css.js";
