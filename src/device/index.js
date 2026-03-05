// @ts-check

/**
 * SigUI core device module for index.
 * @module
 */
export { classifyDevice } from "./classify.js";
export { deriveCommittedInputMode } from "./input.js";
export {
  estimateViewingDistance,
  estimateScreenPpi,
  getDeviceParameters
} from "./distance.js";
export {
  classifyRefreshRate,
  getMinAnimationDuration,
  REFRESH_TIER_MIN_DURATION
} from "./refresh.js";
export {
  inferDisplayType,
  getDarkModeWeightOffset,
  resolveGamut
} from "./display.js";
export { DEFAULT_DEVICE_CONTEXT } from "./defaults.js";
