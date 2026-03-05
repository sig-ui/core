// @ts-check

/**
 * SigUI core interactive module for popover.
 * @module
 */
/**
 * getPopoverTransitionConfig.
 * @returns {PopoverTransitionConfig}
 */
export function getPopoverTransitionConfig() {
  return {
    duration: 200,
    easing: "ease-default",
    translateY: "var(--space-1)"
  };
}
/**
 * getPopoverMode.
 * @param {"menu" | "dropdown" | "action-sheet" | "tooltip" | "hover-card" | "toast" | "notification"} pattern
 * @returns {PopoverMode}
 */
export function getPopoverMode(pattern) {
  switch (pattern) {
    case "menu":
    case "dropdown":
    case "action-sheet":
      return "auto";
    case "tooltip":
    case "hover-card":
      return "hint";
    case "toast":
    case "notification":
      return "manual";
  }
}
