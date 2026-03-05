// @ts-check

/**
 * SigUI core interactive module for index.
 * @module
 */
export {
  getFocusRingConfig,
  getFocusRingCSS,
  getForcedColorsFocusCSS,
  getScrollPaddingConfig,
  computeScrollPadding
} from "./focus.js";
export {
  getStateLayerConfig,
  getStateLayerOpacity,
  getStateLayerColor,
  getStatePriority,
  getStatePriorityRank,
  resolveDominantState
} from "./state-layer.js";
export {
  getCursorTokens,
  getCursorValue,
  resolveStateCursor
} from "./cursor.js";
export {
  getValidationVisual,
  getValidationTokens,
  needsErrorSummary
} from "./validation.js";
export {
  getLoadingThresholds,
  selectLoadingStrategy,
  getSkeletonConfig,
  getButtonSpinnerConfig
} from "./loading.js";
export {
  getPopoverTransitionConfig,
  getPopoverMode
} from "./popover.js";
export {
  getAIConfig,
  getAIPromptInputConfig,
  getMessageVisual,
  getAIInputState,
  getConfidenceLevel,
  getConfidenceColor
} from "./ai.js";
export { getHapticMappings, triggerHaptic } from "./haptic.js";
