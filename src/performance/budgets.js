// @ts-check

/**
 * SigUI core performance module for budgets.
 * @module
 */
export const DEFAULT_VITALS = {
  inp: 200,
  lcp: 2500,
  cls: 0.1
};
export const DEFAULT_ANIMATION_BUDGET = {
  maxConcurrentAnimations: 10,
  rafBudgetMs: 10,
  eventHandlerBudgetMs: 1,
  compositorOnlyAbove: 100
};
export const DEFAULT_DOM_BUDGET = {
  maxNestingDepth: 8,
  maxNodesInteractive: 1500,
  maxNodesContent: 3000,
  maxNodesPerComponent: 50,
  virtualScrollThreshold: 100
};
export const DEFAULT_IMAGE_BUDGET = {
  formats: ["avif", "webp", "jpeg"],
  defaultAspectRatio: "16/9",
  requireAvif: false,
  requireWebp: true,
  requireDimensions: true
};
export const DEFAULT_FONT_BUDGET = {
  bodyDisplay: "swap",
  headingDisplay: "optional",
  maxPreloadFonts: 2,
  maxLatinFontSize: 102400,
  maxCjkSubsetSize: 307200,
  maxInitialFontPayload: 204800
};
export const DEFAULT_CSS_BUDGET = {
  maxTotalGzipped: 51200,
  maxCriticalInlined: 42598,
  maxPerComponent: 3072,
  maxSelectorSpecificity: [0, 2, 0],
  forbidImport: true,
  requireContainment: true
};
export const DEFAULT_JS_BUDGET = {
  maxDomRuntimeGzipped: 24576,
  maxTokensGzipped: 2048,
  maxTotalInitialGzipped: 24576,
  themeInitBudgetMs: 50,
  eventHandlerBudgetMs: 1
};
export const DEFAULT_CI_BUDGET = {
  lighthouseEnabled: true,
  bundleSizeEnabled: true,
  cssLintEnabled: true,
  imageValidationEnabled: true,
  domDepthTestEnabled: true,
  blockOnFailure: true
};
export const DEFAULT_MONITORING_BUDGET = {
  rumEnabled: true,
  syntheticCadence: "daily",
  alertThresholds: {
    inp: 250,
    lcp: 3000,
    cls: 0.15
  }
};
export const DEFAULT_PERFORMANCE_BUDGETS = {
  vitals: DEFAULT_VITALS,
  animation: DEFAULT_ANIMATION_BUDGET,
  dom: DEFAULT_DOM_BUDGET,
  images: DEFAULT_IMAGE_BUDGET,
  fonts: DEFAULT_FONT_BUDGET,
  css: DEFAULT_CSS_BUDGET,
  javascript: DEFAULT_JS_BUDGET,
  ci: DEFAULT_CI_BUDGET,
  monitoring: DEFAULT_MONITORING_BUDGET
};
/**
 * getPerformanceBudgets.
 * @param {Partial<PerformanceBudgets>} overrides
 * @returns {PerformanceBudgets}
 */
export function getPerformanceBudgets(overrides) {
  if (!overrides)
    return DEFAULT_PERFORMANCE_BUDGETS;
  return {
    vitals: { ...DEFAULT_VITALS, ...overrides.vitals },
    animation: { ...DEFAULT_ANIMATION_BUDGET, ...overrides.animation },
    dom: { ...DEFAULT_DOM_BUDGET, ...overrides.dom },
    images: { ...DEFAULT_IMAGE_BUDGET, ...overrides.images },
    fonts: { ...DEFAULT_FONT_BUDGET, ...overrides.fonts },
    css: { ...DEFAULT_CSS_BUDGET, ...overrides.css },
    javascript: { ...DEFAULT_JS_BUDGET, ...overrides.javascript },
    ci: { ...DEFAULT_CI_BUDGET, ...overrides.ci },
    monitoring: { ...DEFAULT_MONITORING_BUDGET, ...overrides.monitoring }
  };
}
