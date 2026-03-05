// @ts-check

/**
 * SigUI core performance module for containment.
 * @module
 */
const CONTAINMENT_CSS = {
  layout: "layout",
  style: "style",
  paint: "paint",
  size: "size",
  strict: "strict",
  content: "content"
};
const DEFAULT_COMPONENT_CONTAINMENT = [
  "layout",
  "style"
];
const OVERFLOW_COMPONENT_CONTAINMENT = [
  "layout",
  "style",
  "paint"
];
/**
 * getContainmentCSS.
 * @param {readonly ContainmentLevel[]} levels
 * @returns {string}
 */
export function getContainmentCSS(levels) {
  if (levels.length === 0)
    return "none";
  if (levels.length === 1)
    return CONTAINMENT_CSS[levels[0]];
  return levels.map((l) => CONTAINMENT_CSS[l]).join(" ");
}
/**
 * getDefaultContainment.
 * @returns {string}
 */
export function getDefaultContainment() {
  return getContainmentCSS(DEFAULT_COMPONENT_CONTAINMENT);
}
/**
 * getOverflowContainment.
 * @returns {string}
 */
export function getOverflowContainment() {
  return getContainmentCSS(OVERFLOW_COMPONENT_CONTAINMENT);
}
/**
 * getContainmentLevels.
 * @returns {Record<ContainmentLevel, string>}
 */
export function getContainmentLevels() {
  return { ...CONTAINMENT_CSS };
}
/**
 * getContentVisibilityCSS.
 * @param {number} estimatedHeight
 * @returns {{ contentVisibility: "auto", containIntrinsicSize: string }}
 */
export function getContentVisibilityCSS(estimatedHeight = 500) {
  return {
    contentVisibility: "auto",
    containIntrinsicSize: `auto ${estimatedHeight}px`
  };
}
