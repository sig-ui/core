// @ts-check

/**
 * SigUI core accessibility module for index.
 * @module
 */
export {
  getDefaultAccessibilityConfig,
  getComplianceLevel,
  meetsComplianceLevel
} from "./config.js";
export {
  ARIA_PATTERNS,
  getAriaPattern,
  getAriaPatternNames
} from "./aria-patterns.js";
export {
  KEYBOARD_MAPS,
  getKeyboardMap,
  createShortcutRegistry,
  registerShortcut,
  lookupShortcut,
  validateShortcutModifier
} from "./keyboard-maps.js";
export {
  ANNOUNCEMENT_PATTERNS,
  getAnnouncementPattern,
  getThrottleConfig
} from "./announcements.js";
export {
  FOCUS_RESTORATION_TARGETS,
  getDefaultSkipLinks,
  getFocusableSelector,
  getRouteChangeFocusSelector
} from "./focus-management.js";
