// @ts-check

/**
 * SigUI core performance module for index.
 * @module
 */
export {
  DEFAULT_VITALS,
  DEFAULT_ANIMATION_BUDGET,
  DEFAULT_DOM_BUDGET,
  DEFAULT_IMAGE_BUDGET,
  DEFAULT_FONT_BUDGET,
  DEFAULT_CSS_BUDGET,
  DEFAULT_JS_BUDGET,
  DEFAULT_CI_BUDGET,
  DEFAULT_MONITORING_BUDGET,
  DEFAULT_PERFORMANCE_BUDGETS,
  getPerformanceBudgets
} from "./budgets.js";
export {
  classifyProperty,
  getPropertyClassification,
  isAnimationSafe,
  getCompositorProperties,
  getLayoutTriggeringProperties,
  getPaintTriggeringProperties
} from "./properties.js";
export {
  getAspectRatios,
  getAspectRatio,
  getAspectRatioNames,
  getAspectRatioCSS
} from "./aspect-ratios.js";
export {
  validateDOMDepth,
  validateComponentNodeCount,
  validatePageNodeCount,
  getListRenderingStrategy,
  estimateRecalcCost
} from "./dom-budget.js";
export {
  getContainmentCSS,
  getDefaultContainment,
  getOverflowContainment,
  getContainmentLevels,
  getContentVisibilityCSS
} from "./containment.js";
export {
  getImageLoadingConfig,
  validateLCPImage,
  getFormatCascade,
  getMandatoryImageAttributes
} from "./image-loading.js";
export {
  getFontDisplay,
  validateFontSize,
  validateFontPayload,
  validatePreloadCount,
  getFontPreloadRules
} from "./font-loading.js";
export {
  lintLayoutAnimations,
  lintNoImport,
  lintNoUniversalAnimation,
  lintSelectorSpecificity,
  estimateSpecificity,
  lintCSS
} from "./css-lint.js";
