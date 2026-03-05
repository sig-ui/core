// @ts-check

/**
 * SigUI core device module for distance.
 * @module
 */
const VIEWING_DISTANCES = {
  watch: 25,
  phone: 37,
  tablet: 40,
  laptop: 55,
  desktop: 71,
  tv: 250,
  kiosk: 70
};
const SCREEN_PPI = {
  watch: 326,
  phone: 160,
  tablet: 132,
  laptop: 110,
  desktop: 96,
  tv: 40,
  kiosk: 96
};
const DEVICE_PARAMS = {
  watch: { baseFontSize: 14, spacingBaseUnit: 4, minInteractiveTarget: 38, maxLineLength: 25, defaultDensity: "compact", durationScalarBase: 0.8 },
  phone: { baseFontSize: 17, spacingBaseUnit: 8, minInteractiveTarget: 44, maxLineLength: 45, defaultDensity: "comfortable", durationScalarBase: 1 },
  tablet: { baseFontSize: 18, spacingBaseUnit: 8, minInteractiveTarget: 44, maxLineLength: 65, defaultDensity: "comfortable", durationScalarBase: 1 },
  laptop: { baseFontSize: 19, spacingBaseUnit: 8, minInteractiveTarget: 32, maxLineLength: 70, defaultDensity: "comfortable", durationScalarBase: 1 },
  desktop: { baseFontSize: 20, spacingBaseUnit: 8, minInteractiveTarget: 24, maxLineLength: 75, defaultDensity: "comfortable", durationScalarBase: 1 },
  tv: { baseFontSize: 48, spacingBaseUnit: 24, minInteractiveTarget: 48, maxLineLength: 35, defaultDensity: "spacious", durationScalarBase: 1.2 },
  kiosk: { baseFontSize: 20, spacingBaseUnit: 8, minInteractiveTarget: 44, maxLineLength: 60, defaultDensity: "comfortable", durationScalarBase: 1 }
};
/**
 * estimateViewingDistance.
 * @param {DeviceClass} deviceClass
 * @returns {number}
 */
export function estimateViewingDistance(deviceClass) {
  return VIEWING_DISTANCES[deviceClass];
}
/**
 * estimateScreenPpi.
 * @param {DeviceClass} deviceClass
 * @returns {number}
 */
export function estimateScreenPpi(deviceClass) {
  return SCREEN_PPI[deviceClass];
}
/**
 * getDeviceParameters.
 * @param {DeviceClass} deviceClass
 * @returns {DeviceParameters}
 */
export function getDeviceParameters(deviceClass) {
  return DEVICE_PARAMS[deviceClass];
}
