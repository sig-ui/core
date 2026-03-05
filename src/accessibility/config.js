// @ts-nocheck

/**
 * SigUI core accessibility module for config.
 * @module
 */
/**
 * getDefaultAccessibilityConfig.
 * @returns {AccessibilityConfig}
 */
export function getDefaultAccessibilityConfig() {
  return {
    complianceLevel: "AA",
    aria: {
      tabActivation: "automatic",
      comboboxAutocomplete: "list",
      typeAheadTimeout: 500,
      focusTrapStrategy: "native",
      announcerDebounce: 300
    },
    focus: {
      indicatorWidth: 2,
      indicatorOffset: 2,
      highContrastWidthIncrease: 1,
      restoreFocusOnClose: true,
      focusMainHeadingOnRouteChange: true,
      skipLinks: [
        { label: "Skip to main content", target: "#main-content" }
      ]
    },
    announcements: {
      routeChangeEnabled: true,
      toastLiveRegion: "polite",
      alertLiveRegion: "assertive",
      loadingCompleteAnnounce: true,
      progressAnnounceInterval: 5000,
      searchResultDebounce: 500,
      realTimeUpdateInterval: 1e4
    },
    touch: {
      minimumTargetSize: 44,
      comfortableTargetSize: 48,
      pointerMinimumTarget: 24,
      targetSpacing: 8,
      dragAlternative: "toolbar"
    },
    testing: {
      axeCoreSeverityThreshold: "minor",
      lighthouseMinScore: 95,
      screenReaderMatrix: [
        "nvda-firefox",
        "voiceover-safari",
        "jaws-chrome",
        "talkback-chrome"
      ]
    },
    css: {
      includeSrOnlyUtility: true,
      includeSkipLinks: true,
      includeForcedColorsOverrides: true,
      includePrintAccessibility: true,
      includeReducedMotionOverrides: true
    }
  };
}
const COMPLIANCE_RANK = {
  A: 1,
  AA: 2,
  AAA: 3
};
/**
 * getComplianceLevel.
 * @param {ComplianceLevel} level
 * @returns {number}
 */
export function getComplianceLevel(level) {
  return COMPLIANCE_RANK[level];
}
/**
 * meetsComplianceLevel.
 * @param {ComplianceLevel} actual
 * @param {ComplianceLevel} required
 * @returns {boolean}
 */
export function meetsComplianceLevel(actual, required) {
  return COMPLIANCE_RANK[actual] >= COMPLIANCE_RANK[required];
}
