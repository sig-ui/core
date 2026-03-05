// @ts-check

/**
 * SigUI core device module for classify.
 * @module
 */
/**
 * classifyDevice.
 * @param {ClassificationSignals} signals
 * @returns {DeviceClass}
 */
export function classifyDevice(signals) {
  const { screenWidth, pointerCoarse, pointerFine, maxTouchPoints, formFactor, mobile } = signals;
  if (formFactor) {
    const ff = formFactor.toLowerCase();
    if (ff === "watch")
      return "watch";
    if (ff === "automotive" || ff === "tv")
      return "tv";
    if (ff === "tablet")
      return "tablet";
    if (ff === "desktop")
      return "desktop";
  }
  if (screenWidth < 300)
    return "watch";
  if (pointerCoarse && !pointerFine) {
    if (screenWidth <= 430 || mobile === true)
      return "phone";
    if (screenWidth <= 1024)
      return "tablet";
    if (screenWidth >= 1920 && maxTouchPoints === 0)
      return "tv";
    return "tablet";
  }
  if (pointerFine && !pointerCoarse) {
    if (screenWidth >= 1440)
      return "desktop";
    return "laptop";
  }
  if (pointerFine && pointerCoarse) {
    if (screenWidth >= 1024)
      return "laptop";
    return "tablet";
  }
  if (maxTouchPoints > 0 && screenWidth < 768)
    return "phone";
  return "desktop";
}
