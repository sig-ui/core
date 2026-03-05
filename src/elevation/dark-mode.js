// @ts-check

/**
 * SigUI core elevation module for dark mode.
 * @module
 */
import { generateShadow } from "./shadow.js";
function extractOpacity(color) {
  const match = /\/\s*([\d.]+)\s*\)/.exec(color);
  if (match === null || match[1] === undefined)
    return 0;
  return parseFloat(match[1]);
}
function rebuildColor(opacity) {
  return `oklch(0 0 0 / ${parseFloat(opacity.toFixed(4))})`;
}
function layerToCss(layer) {
  return `${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.spread}px ${layer.color}`;
}
/**
 * adaptShadowForDarkMode.
 * @param {ElevationShadow} shadow
 * @param {DarkModeAdaptOptions} options
 * @returns {ElevationShadow}
 */
export function adaptShadowForDarkMode(shadow, options = {}) {
  if (shadow.level === 0)
    return shadow;
  const {
    keyOpacityMultiplier = 3.75,
    ambientOpacityMultiplier = 3.33,
    blurReductionFactor = 0.1,
    maxOpacity = 1
  } = options;
  const adaptedLayers = shadow.layers.map((layer, index) => {
    const multiplier = index === 0 ? keyOpacityMultiplier : ambientOpacityMultiplier;
    const baseOpacity = extractOpacity(layer.color);
    const newOpacity = Math.min(maxOpacity, baseOpacity * multiplier);
    const newBlur = layer.blur * (1 - blurReductionFactor);
    return {
      offsetX: layer.offsetX,
      offsetY: layer.offsetY,
      blur: newBlur,
      spread: layer.spread,
      color: rebuildColor(newOpacity)
    };
  });
  const css = adaptedLayers.map(layerToCss).join(", ");
  return {
    level: shadow.level,
    name: shadow.name,
    layers: adaptedLayers,
    css
  };
}
/**
 * generateDarkModeShadow.
 * @param {ElevationLevel} level
 * @param {ShadowOptions} shadowOptions
 * @param {DarkModeAdaptOptions} darkOptions
 * @returns {ElevationShadow}
 */
export function generateDarkModeShadow(level, shadowOptions = {}, darkOptions = {}) {
  const base = generateShadow(level, shadowOptions);
  return adaptShadowForDarkMode(base, darkOptions);
}
