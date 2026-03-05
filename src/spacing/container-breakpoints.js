// @ts-check

/**
 * SigUI core spacing module for container breakpoints.
 * @module
 */
export const CONTAINER_BREAKPOINT_VALUES = {
  "container-xs": 200,
  "container-sm": 300,
  "container-md": 450,
  "container-lg": 600,
  "container-xl": 800
};
export const CONTAINER_BREAKPOINT_ORDER = [
  "container-xs",
  "container-sm",
  "container-md",
  "container-lg",
  "container-xl"
];
/**
 * getContainerBreakpointQuery.
 * @param {ContainerBreakpointName} name
 * @param {ContainerBreakpointQueryType} type
 * @returns {string}
 */
export function getContainerBreakpointQuery(name, type = "min") {
  const value = CONTAINER_BREAKPOINT_VALUES[name];
  if (type === "min") {
    return `@container (min-width: ${value}px)`;
  }
  return `@container (max-width: ${value - 0.02}px)`;
}
/**
 * getContainerBreakpointRangeQuery.
 * @param {ContainerBreakpointName} lower
 * @param {ContainerBreakpointName} upper
 * @returns {string}
 */
export function getContainerBreakpointRangeQuery(lower, upper) {
  const minValue = CONTAINER_BREAKPOINT_VALUES[lower];
  const maxValue = CONTAINER_BREAKPOINT_VALUES[upper];
  return `@container (min-width: ${minValue}px) and (max-width: ${maxValue - 0.02}px)`;
}
