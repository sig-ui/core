// @ts-check

/**
 * SigUI core elevation module for surface.
 * @module
 */
const GLASS_PARAMS = {
  light: { opacity: 0.7, blur: 12 },
  dark: { opacity: 0.5, blur: 16 }
};
/**
 * getSurfaceMaterial.
 * @param {SurfaceMaterial} type
 * @param {SurfaceMaterialOptions} options
 * @returns {SurfaceStyle}
 */
export function getSurfaceMaterial(type, options = {}) {
  const { darkMode = false } = options;
  switch (type) {
    case "flat":
      return buildFlatMaterial();
    case "matte":
      return buildMatteMaterial();
    case "glass":
      return buildGlassMaterial(darkMode);
    case "elevated":
      return buildElevatedMaterial();
  }
}
function buildFlatMaterial() {
  return {
    background: "var(--surface)",
    border: "var(--border-width, 1px) solid var(--border)"
  };
}
function buildMatteMaterial() {
  return {
    background: "var(--surface)"
  };
}
function buildGlassMaterial(darkMode) {
  const { opacity, blur } = darkMode ? GLASS_PARAMS.dark : GLASS_PARAMS.light;
  return {
    background: `oklch(from var(--surface) l c h / ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    border: "1px solid oklch(from var(--border) l c h / 0.2)"
  };
}
function buildElevatedMaterial() {
  return {
    background: "var(--surface-alt, var(--surface))"
  };
}
/**
 * getEdgeHighlight.
 * @returns {string}
 */
export function getEdgeHighlight() {
  return "inset 0 1px 0 0 oklch(1 0 0 / 0.06)";
}
/**
 * getEdgeHighlightDeclaration.
 * @returns {string}
 */
export function getEdgeHighlightDeclaration() {
  return `--shadow-edge-highlight: ${getEdgeHighlight()};`;
}
