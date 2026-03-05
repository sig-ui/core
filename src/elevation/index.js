// @ts-check

/**
 * SigUI core elevation module for index.
 * @module
 */
export {
  generateShadow,
  generateShadowScale
} from "./shadow.js";
export {
  adaptShadowForDarkMode,
  generateDarkModeShadow
} from "./dark-mode.js";
export {
  getZIndexScale,
  getZIndex
} from "./z-index.js";
export {
  getBorderScale,
  getBorderRadiusScale,
  nestedRadius
} from "./border.js";
export {
  getSurfaceMaterial,
  getEdgeHighlight,
  getEdgeHighlightDeclaration
} from "./surface.js";
