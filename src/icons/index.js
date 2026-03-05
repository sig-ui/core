// @ts-check

/**
 * SigUI core icons module for index.
 * @module
 */
export {
  ICON_SIZES,
  ICON_STROKES,
  STROKE_PROFILES,
  DEFAULT_DARK_MODE_COMPENSATION,
  getIconSize,
  getIconStroke,
  getStrokeProfile,
  getStrokeForSize,
  computeCornerRadius
} from "./scale.js";
export {
  ICON_CATEGORIES,
  ICON_ALIASES,
  CORE_ICON_MANIFEST,
  resolveIconName,
  validateIconName,
  getIconCategory
} from "./naming.js";
export {
  ICONS_THAT_MIRROR,
  ICONS_THAT_DO_NOT_MIRROR,
  shouldMirrorInRTL,
  isFixedDirection
} from "./directional.js";
export {
  DEFAULT_ICON_CONFIG,
  resolveIconConfig,
  validateIconConfig
} from "./config.js";
