// @ts-check

/**
 * SigUI core device module for display.
 * @module
 */
/**
 * inferDisplayType.
 * @param {DisplaySignals} signals
 * @returns {DisplayType}
 */
export function inferDisplayType(signals) {
  if (signals.dynamicRangeHigh) {
    return signals.gamutP3 ? "oled" : "hdr-lcd";
  }
  return "lcd";
}
/**
 * getDarkModeWeightOffset.
 * @param {DisplayType} displayType
 * @returns {number}
 */
export function getDarkModeWeightOffset(displayType) {
  switch (displayType) {
    case "oled":
      return -50;
    case "hdr-lcd":
    case "lcd":
      return -100;
    default:
      return -100;
  }
}
/**
 * resolveGamut.
 * @param {DisplaySignals} signals
 * @returns {DisplayGamut}
 */
export function resolveGamut(signals) {
  if (signals.gamutRec2020)
    return "rec2020";
  if (signals.gamutP3)
    return "p3";
  return "srgb";
}
