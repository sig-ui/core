// @ts-check

/**
 * SigUI core interactive module for haptic.
 * @module
 */
/**
 * getHapticMappings.
 * @returns {Record<HapticType, HapticMapping>}
 */
export function getHapticMappings() {
  return {
    press: { ios: "impact-light", android: "CONTEXT_CLICK", web: "noop" },
    success: { ios: "notification-success", android: "CONFIRM", web: "noop" },
    warning: { ios: "notification-warning", android: "REJECT", web: "noop" },
    error: { ios: "notification-error", android: "REJECT", web: "noop" },
    selection: { ios: "selection", android: "CLOCK_TICK", web: "noop" }
  };
}
/**
 * triggerHaptic.
 * @param {HapticType} type
 * @returns {boolean}
 */
export function triggerHaptic(type) {
  if (typeof navigator === "undefined" || !navigator.vibrate)
    return false;
  const patterns = {
    press: [10],
    success: [10, 50, 10],
    warning: [20, 40, 20],
    error: [30, 30, 30, 30, 30],
    selection: [5]
  };
  return navigator.vibrate(patterns[type]);
}
