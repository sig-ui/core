// @ts-check

/**
 * SigUI core motion module for index.
 * @module
 */
export {
  getDurationScale,
  getScaledDurationScale,
  computeDuration
} from "./duration.js";
export {
  getEasingCurves,
  cubicBezier,
  easingToCss,
  cubicBezierToTuple,
  tupleToCubicBezier
} from "./easing.js";
export {
  getSpringPresets,
  computeSpringDuration,
  springToLinear,
  sampleLinearEasing
} from "./spring.js";
export {
  getReducedMotionAlternative,
  isReducedMotion,
  getAllReducedMotionAlternatives,
  isValidReducedMotionStrategy
} from "./reduced-motion.js";
export {
  getTransitionPreset,
  getAllTransitionPresets,
  computeStaggerDelay,
  computeEasedStaggerDelay
} from "./transition.js";
export {
  computeFlipInversion,
  FLIP_THRESHOLD_PX
} from "./flip.js";
export {
  computeVelocity,
  detectSwipe,
  applyDragConstraint,
  elasticDisplacement
} from "./gesture.js";
export {
  normalizePath,
  interpolatePath,
  approximatePathLength
} from "./svg.js";
