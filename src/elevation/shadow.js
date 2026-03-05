// @ts-check

/**
 * SigUI core elevation module for shadow.
 * @module
 */
const SHADOW_SCALE = {
  0: {
    name: "none",
    keyOffsetY: 0,
    keyBlur: 0,
    keySpread: 0,
    ambientBlur: 0,
    keyOpacity: 0,
    ambientOpacity: 0
  },
  1: {
    name: "xs",
    keyOffsetY: 0.5,
    keyBlur: 1,
    keySpread: -0.25,
    ambientBlur: 2,
    keyOpacity: 0.08,
    ambientOpacity: 0.06
  },
  2: {
    name: "sm",
    keyOffsetY: 1,
    keyBlur: 2,
    keySpread: -0.5,
    ambientBlur: 4,
    keyOpacity: 0.08,
    ambientOpacity: 0.06
  },
  3: {
    name: "md",
    keyOffsetY: 1.5,
    keyBlur: 3,
    keySpread: -0.75,
    ambientBlur: 6,
    keyOpacity: 0.08,
    ambientOpacity: 0.06
  },
  4: {
    name: "lg",
    keyOffsetY: 2,
    keyBlur: 4,
    keySpread: -1,
    ambientBlur: 8,
    keyOpacity: 0.08,
    ambientOpacity: 0.06
  },
  5: {
    name: "xl",
    keyOffsetY: 2.5,
    keyBlur: 5,
    keySpread: -1.25,
    ambientBlur: 10,
    keyOpacity: 0.08,
    ambientOpacity: 0.06
  }
};
function formatOpacity(opacity) {
  return parseFloat(opacity.toFixed(4)).toString();
}
function shadowColor(opacity, format = "oklch") {
  const o = formatOpacity(opacity);
  return format === "rgba" ? `rgba(0, 0, 0, ${o})` : `oklch(0 0 0 / ${o})`;
}
function px(value) {
  return `${value}px`;
}
function layerToCss(layer) {
  const x = px(layer.offsetX);
  const y = px(layer.offsetY);
  const blur = px(layer.blur);
  const spread = px(layer.spread);
  return `${x} ${y} ${blur} ${spread} ${layer.color}`;
}
/**
 * generateShadow.
 * @param {ElevationLevel} level
 * @param {ShadowOptions} options
 * @returns {ElevationShadow}
 */
export function generateShadow(level, options = {}) {
  const entry = SHADOW_SCALE[level];
  if (level === 0) {
    return {
      level: 0,
      name: "none",
      layers: [],
      css: "none"
    };
  }
  const keyOpacity = options.keyOpacity ?? entry.keyOpacity;
  const ambientOpacity = options.ambientOpacity ?? entry.ambientOpacity;
  const fmt = options.colorFormat ?? "oklch";
  const keyLayer = {
    offsetX: 0,
    offsetY: entry.keyOffsetY,
    blur: entry.keyBlur,
    spread: entry.keySpread,
    color: shadowColor(keyOpacity, fmt)
  };
  const ambientLayer = {
    offsetX: 0,
    offsetY: 0,
    blur: entry.ambientBlur,
    spread: 0,
    color: shadowColor(ambientOpacity, fmt)
  };
  const layers = [keyLayer, ambientLayer];
  const css = layers.map(layerToCss).join(", ");
  return {
    level,
    name: entry.name,
    layers,
    css
  };
}
/**
 * generateShadowScale.
 * @param {ShadowOptions} options
 * @returns {readonly ElevationShadow[]}
 */
export function generateShadowScale(options = {}) {
  const levels = [0, 1, 2, 3, 4, 5];
  return levels.map((level) => generateShadow(level, options));
}
