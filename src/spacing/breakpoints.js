// @ts-check

/**
 * SigUI core spacing module for breakpoints.
 * @module
 */
export const BREAKPOINT_VALUES = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
};
export const BREAKPOINT_ORDER = [
  "sm",
  "md",
  "lg",
  "xl",
  "2xl"
];
/**
 * getBreakpoints.
 * @returns {ReadonlyArray<Breakpoint>}
 */
export function getBreakpoints() {
  return BREAKPOINT_ORDER.map((name) => ({
    name,
    minWidth: BREAKPOINT_VALUES[name]
  }));
}
/**
 * getBreakpoint.
 * @param {BreakpointName} name
 * @returns {Breakpoint}
 */
export function getBreakpoint(name) {
  return { name, minWidth: BREAKPOINT_VALUES[name] };
}
/**
 * getBreakpointQuery.
 * @param {BreakpointName} name
 * @param {BreakpointQueryType} type
 * @returns {string}
 */
export function getBreakpointQuery(name, type = "min") {
  const value = BREAKPOINT_VALUES[name];
  if (type === "min") {
    return `@media (min-width: ${value}px)`;
  }
  return `@media (max-width: ${value - 0.02}px)`;
}
/**
 * getBreakpointRangeQuery.
 * @param {BreakpointName} lower
 * @param {BreakpointName} upper
 * @returns {string}
 */
export function getBreakpointRangeQuery(lower, upper) {
  const minValue = BREAKPOINT_VALUES[lower];
  const maxValue = BREAKPOINT_VALUES[upper];
  return `@media (min-width: ${minValue}px) and (max-width: ${maxValue - 0.02}px)`;
}
/**
 * resolveBreakpoint.
 * @param {number} viewportWidth
 * @returns {BreakpointName | null}
 */
export function resolveBreakpoint(viewportWidth) {
  let resolved = null;
  for (const name of BREAKPOINT_ORDER) {
    if (viewportWidth >= BREAKPOINT_VALUES[name]) {
      resolved = name;
    } else {
      break;
    }
  }
  return resolved;
}
