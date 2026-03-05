// @ts-check

/**
 * SigUI core accessibility module for focus management.
 * @module
 */
export const FOCUS_RESTORATION_TARGETS = {
  "button-opens-dialog": {
    triggerType: "button-opens-dialog",
    restoreTo: "trigger button",
    fallbackChain: ["nearest sibling", "parent container", "main"],
    notes: "Native <dialog> handles automatically"
  },
  "button-opens-menu": {
    triggerType: "button-opens-menu",
    restoreTo: "menu trigger",
    fallbackChain: ["nearest sibling", "parent container", "main"],
    notes: "After selection or Escape"
  },
  "button-opens-popover": {
    triggerType: "button-opens-popover",
    restoreTo: "popover trigger",
    fallbackChain: ["nearest sibling", "parent container", "main"],
    notes: "Native Popover API handles automatically"
  },
  "link-triggers-modal": {
    triggerType: "link-triggers-modal",
    restoreTo: "link element",
    fallbackChain: ["nearest sibling", "parent container", "main"],
    notes: "If removed, focus nearest sibling or <main>"
  }
};
/**
 * getDefaultSkipLinks.
 * @returns {readonly SkipLinkConfig[]}
 */
export function getDefaultSkipLinks() {
  return [{ label: "Skip to main content", target: "#main-content" }];
}
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
/**
 * getFocusableSelector.
 * @returns {string}
 */
export function getFocusableSelector() {
  return FOCUSABLE_SELECTOR;
}
/**
 * getRouteChangeFocusSelector.
 * @returns {string}
 */
export function getRouteChangeFocusSelector() {
  return "h1";
}
