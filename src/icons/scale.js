// @ts-check

/**
 * SigUI core icons module for scale.
 * @module
 */
export const ICON_SIZES = {
  xs: { px: 12, rem: 0.75, strokeWidth: 1 },
  sm: { px: 16, rem: 1, strokeWidth: 1.25 },
  md: { px: 20, rem: 1.25, strokeWidth: 1.5 },
  default: { px: 24, rem: 1.5, strokeWidth: 1.5 },
  lg: { px: 32, rem: 2, strokeWidth: 2 },
  xl: { px: 48, rem: 3, strokeWidth: 2.5 }
};
export const ICON_STROKES = {
  thin: { width: 1, cornerRadius: 0.5 },
  default: { width: 1.5, cornerRadius: 0.75 },
  medium: { width: 2, cornerRadius: 1 },
  bold: { width: 2.5, cornerRadius: 1.25 }
};
export const STROKE_PROFILES = {
  rounded: {
    linecap: "round",
    linejoin: "round"
  },
  geometric: {
    linecap: "square",
    linejoin: "miter"
  }
};
export const DEFAULT_DARK_MODE_COMPENSATION = {
  outlinedOpacity: 0.88,
  outlinedOpacityHiDPI: 0.93,
  filledLightnessOffset: -0.03,
  filledLightnessOffsetHiDPI: -0.01
};
/**
 * getIconSize.
 * @param {IconSizeToken} token
 * @returns {IconSizeDefinition}
 */
export function getIconSize(token) {
  return ICON_SIZES[token];
}
/**
 * getIconStroke.
 * @param {IconStrokeToken} token
 * @returns {IconStrokeDefinition}
 */
export function getIconStroke(token) {
  return ICON_STROKES[token];
}
/**
 * getStrokeProfile.
 * @param {IconStrokeProfile} profile
 * @returns {StrokeProfileConfig}
 */
export function getStrokeProfile(profile) {
  return STROKE_PROFILES[profile];
}
/**
 * getStrokeForSize.
 * @param {IconSizeToken} size
 * @returns {number}
 */
export function getStrokeForSize(size) {
  return ICON_SIZES[size].strokeWidth;
}
/**
 * computeCornerRadius.
 * @param {number} strokeWidth
 * @returns {number}
 */
export function computeCornerRadius(strokeWidth) {
  return strokeWidth * 0.5;
}
