// @ts-check

/**
 * SigUI core typography module for visual angle.
 * @module
 */
import { generateTypeScale } from "./scale.js";
export const VIEWING_ANGLE_K = 0.005;
export const DEVICE_PRESETS = {
  watch: { viewingDistanceCm: 25, screenPpi: 326 },
  phone: { viewingDistanceCm: 37, screenPpi: 160 },
  tablet: { viewingDistanceCm: 40, screenPpi: 132 },
  desktop: { viewingDistanceCm: 60, screenPpi: 96 },
  tv: { viewingDistanceCm: 300, screenPpi: 40 }
};
const STEP_ORDER = [
  "2xs",
  "xs",
  "sm",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "6xl",
  "7xl",
  "8xl",
  "9xl"
];
/**
 * computeBodyFromViewingAngle.
 * @param {ViewingConditions} conditions
 * @returns {VisualAngleResult}
 */
export function computeBodyFromViewingAngle(conditions) {
  const { viewingDistanceCm, screenPpi } = conditions;
  const bodySizePx = viewingDistanceCm * VIEWING_ANGLE_K * screenPpi / 2.54;
  const bodySizeRem = bodySizePx / 16;
  const scale = generateTypeScale({ unit: "rem" });
  const nearestScaleStep = findNearestStep(scale, bodySizeRem);
  return {
    bodySizePx: Math.round(bodySizePx * 100) / 100,
    bodySizeRem: Math.round(bodySizeRem * 1e4) / 1e4,
    nearestScaleStep
  };
}
function findNearestStep(scale, targetRem) {
  let best = "base";
  let bestDist = 1 / 0;
  for (const step of STEP_ORDER) {
    const dist = Math.abs(scale[step] - targetRem);
    if (dist < bestDist) {
      bestDist = dist;
      best = step;
    }
  }
  return best;
}
