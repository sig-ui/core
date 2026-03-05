// @ts-check

/**
 * SigUI core elevation module for z index.
 * @module
 */
const Z_INDEX_SCALE = Object.freeze({
  base: 0,
  raised: 1,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
  max: 70
});
/**
 * getZIndexScale.
 * @returns {ZIndexScale}
 */
export function getZIndexScale() {
  return { ...Z_INDEX_SCALE };
}
/**
 * getZIndex.
 * @param {ZIndexLayer} layer
 * @returns {number}
 */
export function getZIndex(layer) {
  return Z_INDEX_SCALE[layer];
}
