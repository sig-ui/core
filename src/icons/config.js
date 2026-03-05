// @ts-check

/**
 * SigUI core icons module for config.
 * @module
 */
import { ICON_SIZES } from "./scale.js";
import { ICON_STROKES } from "./scale.js";
import { DEFAULT_DARK_MODE_COMPENSATION } from "./scale.js";
export const DEFAULT_ICON_CONFIG = {
  sizes: { ...ICON_SIZES },
  strokes: { ...ICON_STROKES },
  strokeProfile: "rounded",
  cornerRadiusRatio: 0.5,
  darkMode: { ...DEFAULT_DARK_MODE_COMPENSATION },
  delivery: "inline-svg",
  aliases: {},
  verticalAlign: -0.125
};
/**
 * resolveIconConfig.
 * @param {Partial<IconConfig>} config
 * @returns {IconConfig}
 */
export function resolveIconConfig(config) {
  if (!config)
    return { ...DEFAULT_ICON_CONFIG };
  return {
    sizes: config.sizes ? { ...DEFAULT_ICON_CONFIG.sizes, ...config.sizes } : { ...DEFAULT_ICON_CONFIG.sizes },
    strokes: config.strokes ? { ...DEFAULT_ICON_CONFIG.strokes, ...config.strokes } : { ...DEFAULT_ICON_CONFIG.strokes },
    strokeProfile: config.strokeProfile ?? DEFAULT_ICON_CONFIG.strokeProfile,
    cornerRadiusRatio: config.cornerRadiusRatio ?? DEFAULT_ICON_CONFIG.cornerRadiusRatio,
    darkMode: config.darkMode ? { ...DEFAULT_ICON_CONFIG.darkMode, ...config.darkMode } : { ...DEFAULT_ICON_CONFIG.darkMode },
    delivery: config.delivery ?? DEFAULT_ICON_CONFIG.delivery,
    aliases: config.aliases ? { ...DEFAULT_ICON_CONFIG.aliases, ...config.aliases } : { ...DEFAULT_ICON_CONFIG.aliases },
    verticalAlign: config.verticalAlign ?? DEFAULT_ICON_CONFIG.verticalAlign
  };
}
/**
 * validateIconConfig.
 * @param {IconConfig} config
 * @returns {IconConfigError[]}
 */
export function validateIconConfig(config) {
  const errors = [];
  for (const [token, def] of Object.entries(config.sizes)) {
    if (def.px <= 0) {
      errors.push({ field: `sizes.${token}.px`, message: `Size px must be positive, got ${def.px}` });
    }
    if (def.rem <= 0) {
      errors.push({ field: `sizes.${token}.rem`, message: `Size rem must be positive, got ${def.rem}` });
    }
    if (def.strokeWidth <= 0) {
      errors.push({ field: `sizes.${token}.strokeWidth`, message: `Stroke width must be positive, got ${def.strokeWidth}` });
    }
  }
  for (const [token, def] of Object.entries(config.strokes)) {
    if (def.width <= 0) {
      errors.push({ field: `strokes.${token}.width`, message: `Stroke width must be positive, got ${def.width}` });
    }
    if (def.cornerRadius < 0) {
      errors.push({ field: `strokes.${token}.cornerRadius`, message: `Corner radius must be non-negative, got ${def.cornerRadius}` });
    }
  }
  const dm = config.darkMode;
  if (dm.outlinedOpacity < 0 || dm.outlinedOpacity > 1) {
    errors.push({ field: "darkMode.outlinedOpacity", message: `Opacity must be in [0, 1], got ${dm.outlinedOpacity}` });
  }
  if (dm.outlinedOpacityHiDPI < 0 || dm.outlinedOpacityHiDPI > 1) {
    errors.push({ field: "darkMode.outlinedOpacityHiDPI", message: `Opacity must be in [0, 1], got ${dm.outlinedOpacityHiDPI}` });
  }
  if (config.cornerRadiusRatio < 0) {
    errors.push({ field: "cornerRadiusRatio", message: `Corner radius ratio must be non-negative, got ${config.cornerRadiusRatio}` });
  }
  return errors;
}
