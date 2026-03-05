// @ts-check

/**
 * SigUI core performance module for properties.
 * @module
 */
const COMPOSITOR_PROPERTIES = new Map([
  ["transform", { cost: "~0.5ms/frame" }],
  ["opacity", { cost: "~0.3ms/frame" }],
  ["filter", { cost: "~0.5–2ms/frame" }],
  ["clip-path", { cost: "~0.5–1ms/frame" }],
  ["backdrop-filter", { cost: "~1–3ms/frame" }]
]);
const PAINT_PROPERTIES = new Map([
  ["background-color", { cost: "~2–4ms/frame" }],
  ["background", { cost: "~2–4ms/frame" }],
  ["border-color", { cost: "~2–3ms/frame" }],
  ["color", { cost: "~2–3ms/frame" }],
  ["outline-color", { cost: "~1–2ms/frame" }],
  ["box-shadow", { cost: "~3–8ms/frame" }],
  ["text-shadow", { cost: "~2–5ms/frame" }]
]);
const LAYOUT_PROPERTIES = new Map([
  ["width", { cost: "~4–16ms+", alternative: "transform: scaleX()" }],
  ["height", { cost: "~4–16ms+", alternative: "transform: scaleY()" }],
  ["min-width", { cost: "~4–16ms+", alternative: "transform: scaleX()" }],
  ["min-height", { cost: "~4–16ms+", alternative: "transform: scaleY()" }],
  ["max-width", { cost: "~4–16ms+", alternative: "transform: scaleX()" }],
  ["max-height", { cost: "~4–16ms+", alternative: "transform: scaleY()" }],
  ["top", { cost: "~4–16ms+", alternative: "transform: translateY()" }],
  ["left", { cost: "~4–16ms+", alternative: "transform: translateX()" }],
  ["right", { cost: "~4–16ms+", alternative: "transform: translateX()" }],
  ["bottom", { cost: "~4–16ms+", alternative: "transform: translateY()" }],
  ["margin", { cost: "~4–16ms+", alternative: "transform: translate()" }],
  ["margin-top", { cost: "~4–16ms+", alternative: "transform: translateY()" }],
  ["margin-right", { cost: "~4–16ms+", alternative: "transform: translateX()" }],
  ["margin-bottom", { cost: "~4–16ms+", alternative: "transform: translateY()" }],
  ["margin-left", { cost: "~4–16ms+", alternative: "transform: translateX()" }],
  ["margin-block", { cost: "~4–16ms+", alternative: "transform: translateY()" }],
  ["margin-inline", { cost: "~4–16ms+", alternative: "transform: translateX()" }],
  ["padding", { cost: "~4–16ms+", alternative: "Do not animate; change on state toggle" }],
  ["padding-top", { cost: "~4–16ms+", alternative: "Do not animate" }],
  ["padding-right", { cost: "~4–16ms+", alternative: "Do not animate" }],
  ["padding-bottom", { cost: "~4–16ms+", alternative: "Do not animate" }],
  ["padding-left", { cost: "~4–16ms+", alternative: "Do not animate" }],
  ["padding-block", { cost: "~4–16ms+", alternative: "Do not animate" }],
  ["padding-inline", { cost: "~4–16ms+", alternative: "Do not animate" }],
  ["border-width", { cost: "~3–8ms", alternative: "Use outline or box-shadow" }],
  ["font-size", { cost: "~4–16ms+", alternative: "Never animate; step-change only" }],
  ["line-height", { cost: "~4–16ms+", alternative: "Never animate" }],
  ["display", { cost: "Varies", alternative: "opacity: 0 + pointer-events: none" }],
  ["position", { cost: "Layout rebuild", alternative: "Never animate" }],
  ["flex-basis", { cost: "~4–12ms", alternative: "transform: scale()" }],
  ["flex-grow", { cost: "~4–12ms", alternative: "transform: scale()" }],
  ["gap", { cost: "~4–16ms+", alternative: "Do not animate" }]
]);
/**
 * classifyProperty.
 * @param {string} property
 * @returns {CSSPropertyThread}
 */
export function classifyProperty(property) {
  const normalized = property.toLowerCase().trim();
  if (COMPOSITOR_PROPERTIES.has(normalized))
    return "compositor";
  if (LAYOUT_PROPERTIES.has(normalized))
    return "layout";
  if (PAINT_PROPERTIES.has(normalized))
    return "paint";
  return "paint";
}
/**
 * getPropertyClassification.
 * @param {string} property
 * @returns {PropertyClassification}
 */
export function getPropertyClassification(property) {
  const normalized = property.toLowerCase().trim();
  if (COMPOSITOR_PROPERTIES.has(normalized)) {
    const data = COMPOSITOR_PROPERTIES.get(normalized);
    return {
      property: normalized,
      thread: "compositor",
      typicalCostMs: data.cost,
      allowed: true
    };
  }
  if (LAYOUT_PROPERTIES.has(normalized)) {
    const data = LAYOUT_PROPERTIES.get(normalized);
    return {
      property: normalized,
      thread: "layout",
      typicalCostMs: data.cost,
      allowed: false,
      alternative: data.alternative
    };
  }
  if (PAINT_PROPERTIES.has(normalized)) {
    const data = PAINT_PROPERTIES.get(normalized);
    return {
      property: normalized,
      thread: "paint",
      typicalCostMs: data.cost,
      allowed: true
    };
  }
  return {
    property: normalized,
    thread: "paint",
    typicalCostMs: "unknown",
    allowed: true
  };
}
/**
 * isAnimationSafe.
 * @param {string} property
 * @param {number} durationMs
 * @returns {boolean}
 */
export function isAnimationSafe(property, durationMs) {
  const thread = classifyProperty(property);
  if (thread === "compositor")
    return true;
  if (thread === "layout")
    return false;
  return durationMs <= 100;
}
/**
 * getCompositorProperties.
 * @returns {readonly string[]}
 */
export function getCompositorProperties() {
  return [...COMPOSITOR_PROPERTIES.keys()];
}
/**
 * getLayoutTriggeringProperties.
 * @returns {readonly string[]}
 */
export function getLayoutTriggeringProperties() {
  return [...LAYOUT_PROPERTIES.keys()];
}
/**
 * getPaintTriggeringProperties.
 * @returns {readonly string[]}
 */
export function getPaintTriggeringProperties() {
  return [...PAINT_PROPERTIES.keys()];
}
