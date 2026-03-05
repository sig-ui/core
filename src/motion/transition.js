// @ts-check

/**
 * SigUI core motion module for transition.
 * @module
 */
import { getEasingCurves, tupleToCubicBezier, cubicBezier } from "./easing.js";
import { getDurationScale } from "./duration.js";
function formatEasing(curve) {
  return `cubic-bezier(${curve.x1}, ${curve.y1}, ${curve.x2}, ${curve.y2})`;
}
function buildCss(property, duration, easing, delay) {
  const parts = [property, `${duration}ms`, formatEasing(easing)];
  if (delay !== undefined && delay > 0) {
    parts.push(`${delay}ms`);
  }
  return parts.join(" ");
}
/**
 * getTransitionPreset.
 * @param {TransitionPreset} name
 * @returns {TransitionConfig}
 */
export function getTransitionPreset(name) {
  const curves = getEasingCurves();
  const durations = getDurationScale();
  const defaultEasing = tupleToCubicBezier(curves.default);
  const inEasing = tupleToCubicBezier(curves.in);
  const inOutEasing = tupleToCubicBezier(curves["in-out"]);
  switch (name) {
    case "fade": {
      const duration = durations.normal;
      return {
        property: "opacity",
        duration,
        easing: defaultEasing,
        css: buildCss("opacity", duration, defaultEasing)
      };
    }
    case "slide-up": {
      const duration = durations.moderate;
      return {
        property: "transform, opacity",
        duration,
        easing: defaultEasing,
        css: buildCss("transform, opacity", duration, defaultEasing)
      };
    }
    case "slide-down": {
      const duration = durations.fast;
      return {
        property: "transform, opacity",
        duration,
        easing: inEasing,
        css: buildCss("transform, opacity", duration, inEasing)
      };
    }
    case "scale": {
      const duration = durations.moderate;
      return {
        property: "transform, opacity",
        duration,
        easing: defaultEasing,
        css: buildCss("transform, opacity", duration, defaultEasing)
      };
    }
    case "expand": {
      const duration = durations.moderate;
      return {
        property: "height, opacity",
        duration,
        easing: inOutEasing,
        css: buildCss("height, opacity", duration, inOutEasing)
      };
    }
    case "collapse": {
      const duration = durations.fast;
      return {
        property: "height, opacity",
        duration,
        easing: inEasing,
        css: buildCss("height, opacity", duration, inEasing)
      };
    }
  }
}
/**
 * getAllTransitionPresets.
 * @returns {Record<
  TransitionPreset,
  TransitionConfig
>}
 */
export function getAllTransitionPresets() {
  const names = [
    "fade",
    "slide-up",
    "slide-down",
    "scale",
    "expand",
    "collapse"
  ];
  return Object.fromEntries(names.map((n) => [n, getTransitionPreset(n)]));
}
/**
 * computeStaggerDelay.
 * @param {number} index
 * @param {number} perItemMs
 * @param {number} maxItems
 * @returns {number}
 */
export function computeStaggerDelay(index, perItemMs = 50, maxItems = 10) {
  return Math.min(index, maxItems) * perItemMs;
}
const STAGGER_EASINGS = {
  out: [0, 0, 0.2, 1],
  in: [0.4, 0, 1, 0.6],
  "in-out": [0.4, 0, 0.2, 1]
};
/**
 * computeEasedStaggerDelay.
 * @param {number} index
 * @param {number} total
 * @param {number} totalDurationMs
 * @param {StaggerEasing} easing
 * @returns {number}
 */
export function computeEasedStaggerDelay(index, total, totalDurationMs, easing = "out") {
  if (total <= 1)
    return 0;
  if (index <= 0)
    return 0;
  if (index >= total - 1)
    return totalDurationMs;
  const t = index / (total - 1);
  const [x1, y1, x2, y2] = STAGGER_EASINGS[easing];
  const easedT = cubicBezier(x1, y1, x2, y2, t);
  return Math.round(easedT * totalDurationMs);
}
