// @ts-check

/**
 * SigUI core performance module for aspect ratios.
 * @module
 */
const ASPECT_RATIOS = [
  { name: "video", ratio: "16/9", cssValue: "16 / 9", useCase: "Video thumbnails, hero images, media cards" },
  { name: "photo", ratio: "4/3", cssValue: "4 / 3", useCase: "Photo galleries, product images" },
  { name: "square", ratio: "1/1", cssValue: "1 / 1", useCase: "Avatars, icons, album art, social media thumbnails" },
  { name: "portrait", ratio: "3/4", cssValue: "3 / 4", useCase: "Profile photos, card images, book covers" },
  { name: "wide", ratio: "21/9", cssValue: "21 / 9", useCase: "Panoramic images, cinematic banners" },
  { name: "golden", ratio: "1.618/1", cssValue: "1.618 / 1", useCase: "Editorial layouts, feature images" }
];
/**
 * getAspectRatios.
 * @returns {readonly AspectRatioValue[]}
 */
export function getAspectRatios() {
  return ASPECT_RATIOS;
}
/**
 * getAspectRatio.
 * @param {AspectRatioToken} name
 * @returns {AspectRatioValue}
 */
export function getAspectRatio(name) {
  const found = ASPECT_RATIOS.find((r) => r.name === name);
  if (!found)
    throw new Error(`Unknown aspect ratio token: ${name}`);
  return found;
}
/**
 * getAspectRatioNames.
 * @returns {readonly AspectRatioToken[]}
 */
export function getAspectRatioNames() {
  return ASPECT_RATIOS.map((r) => r.name);
}
/**
 * getAspectRatioCSS.
 * @returns {Record<string, string>}
 */
export function getAspectRatioCSS() {
  /** @type {Record<string, string>} */
  const result = {};
  for (const ratio of ASPECT_RATIOS) {
    result[`--aspect-${ratio.name}`] = ratio.cssValue;
  }
  return result;
}
