// @ts-check

/**
 * SigUI core performance module for image loading.
 * @module
 */
/**
 * getImageLoadingConfig.
 * @param {ImageLoadingStrategy} strategy
 * @returns {ImageLoadingConfig}
 */
export function getImageLoadingConfig(strategy) {
  switch (strategy) {
    case "lcp":
      return { loading: "eager", fetchpriority: "high", decoding: "auto" };
    case "lazy":
      return { loading: "lazy", fetchpriority: "auto", decoding: "async" };
    case "eager":
      return { loading: "eager", fetchpriority: "auto", decoding: "auto" };
  }
}
/**
 * validateLCPImage.
 * @param {boolean} isLcp
 * @param {string} loading
 * @returns {boolean}
 */
export function validateLCPImage(isLcp, loading) {
  if (isLcp && loading === "lazy")
    return false;
  return true;
}
/**
 * getFormatCascade.
 * @returns {readonly string[]}
 */
export function getFormatCascade() {
  return ["avif", "webp", "jpeg"];
}
/**
 * getMandatoryImageAttributes.
 * @returns {readonly string[]}
 */
export function getMandatoryImageAttributes() {
  return ["alt", "width", "height", "loading", "decoding"];
}
