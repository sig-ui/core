// @ts-check

/**
 * SigUI core spacing module for visual weight.
 * @module
 */
export const VISUAL_WEIGHTS = [
  "solid",
  "outlined",
  "text",
  "icon",
  "surface"
];
export const OPTICAL_ADJUSTMENT_MATRIX = {
  "solid:solid": -0.15,
  "solid:outlined": 0,
  "solid:text": 0.1,
  "solid:icon": 0.15,
  "solid:surface": -0.1,
  "outlined:solid": 0,
  "outlined:outlined": 0,
  "outlined:text": 0.1,
  "outlined:icon": 0.1,
  "outlined:surface": 0,
  "text:solid": 0.1,
  "text:outlined": 0.1,
  "text:text": -0.05,
  "text:icon": 0.1,
  "text:surface": 0.05,
  "icon:solid": 0.15,
  "icon:outlined": 0.1,
  "icon:text": 0.1,
  "icon:icon": -0.1,
  "icon:surface": 0.05,
  "surface:solid": -0.1,
  "surface:outlined": 0,
  "surface:text": 0.05,
  "surface:icon": 0.05,
  "surface:surface": -0.08
};
/**
 * getOpticalAdjustment.
 * @param {VisualWeight} a
 * @param {VisualWeight} b
 * @returns {number}
 */
export function getOpticalAdjustment(a, b) {
  return OPTICAL_ADJUSTMENT_MATRIX[`${a}:${b}`] ?? 0;
}
/**
 * generateOpticalCSS.
 * @returns {string}
 */
export function generateOpticalCSS() {
  const lines = [];
  for (const a of VISUAL_WEIGHTS) {
    for (const b of VISUAL_WEIGHTS) {
      const adj = getOpticalAdjustment(a, b);
      if (adj === 0)
        continue;
      lines.push(`[data-visual-weight="${a}"] + [data-visual-weight="${b}"] {`, `  --sg-optical-adjust: ${adj};`, `}`, "");
    }
  }
  return lines.join(`
`);
}
