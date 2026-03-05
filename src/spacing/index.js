// @ts-check

/**
 * SigUI core spacing module for index.
 * @module
 */
export {
  generateSpacingScale,
  getSpacingValue,
  SEMANTIC_SPACING_TOKENS
} from "./scale.js";
export {
  getMinTouchTarget,
  getTouchTargetSpec,
  computeFittsTime,
  fittsIndexOfDifficulty,
  meetsWCAGTouchTarget,
  computeHitAreaExpansion,
  TOUCH_TARGET_SIZES
} from "./touch-targets.js";
export {
  getDensityMultiplier,
  applyDensity,
  applyDensityClamped,
  composeSpacingScales,
  getContextScaleFactor,
  DENSITY_MULTIPLIERS,
  DENSITY_CSS_VALUES,
  DENSITY_EXEMPT_COMPONENTS,
  CONTEXT_SCALE_FACTORS
} from "./density.js";
export {
  getBreakpoints,
  getBreakpoint,
  getBreakpointQuery,
  getBreakpointRangeQuery,
  resolveBreakpoint,
  BREAKPOINT_VALUES,
  BREAKPOINT_ORDER
} from "./breakpoints.js";
export {
  getGridConfig,
  getAllGridConfigs,
  computeColumnWidth,
  computeSpanWidth,
  validateGridConfig
} from "./grid.js";
export {
  getRelationshipSpacing,
  getAllRelationshipSpacings,
  getDefaultSpacing,
  validateProximityHierarchy,
  spacingRelationship,
  relationshipForDepth,
  isInRelationshipRange
} from "./relationship.js";
export {
  distributeSpacing,
  constraintsFromRelationships,
  distributeRelationshipSpacing,
  computeDistributionEnergy
} from "./balanced-distribution.js";
export {
  fluidSpacing,
  fluidSpacingScale
} from "./fluid.js";
export { computeContentSpacing } from "./content-spacing.js";
export { computeComponentHeight, VERTICAL_PADDING_PRESETS } from "./component-height.js";
export { opticalSpacingMultiplier, opticalSpacingFluid } from "./optical-spacing.js";
export { deriveFontSpacingSubset, generateFontSpacingSubsets } from "./font-spacing.js";
export {
  VISUAL_WEIGHTS,
  OPTICAL_ADJUSTMENT_MATRIX,
  getOpticalAdjustment,
  generateOpticalCSS
} from "./visual-weight.js";
export {
  CONTAINER_BREAKPOINT_VALUES,
  CONTAINER_BREAKPOINT_ORDER,
  getContainerBreakpointQuery,
  getContainerBreakpointRangeQuery
} from "./container-breakpoints.js";
export {
  buildTokenMap,
  parseCSSBlocks,
  resolveValueToPx,
  auditProximityHierarchy,
  auditRhythmRegularity,
  auditLineMeasure,
  auditTouchTargets,
  auditAlignmentConsistency,
  auditSpacingClutter,
  auditLayout,
  computeLayoutBalance
} from "./layout-audit.js";
