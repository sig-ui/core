// @ts-check

/**
 * SigUI core accessibility module for announcements.
 * @module
 */
export const ANNOUNCEMENT_PATTERNS = {
  "toast-success": {
    scenario: "toast-success",
    priority: "polite",
    contentTemplate: "{message}",
    timing: "On action completion"
  },
  "toast-info": {
    scenario: "toast-info",
    priority: "polite",
    contentTemplate: "{message}",
    timing: "On action completion"
  },
  "form-error-summary": {
    scenario: "form-error-summary",
    priority: "assertive",
    contentTemplate: "{count} errors found. {firstError}",
    timing: "On submission attempt"
  },
  "form-error-field": {
    scenario: "form-error-field",
    priority: "assertive",
    contentTemplate: "{message}",
    timing: "On blur"
  },
  "session-expiry": {
    scenario: "session-expiry",
    priority: "assertive",
    contentTemplate: "Session expires in {minutes} min. Press Extend.",
    timing: "120s before expiry"
  },
  "loading-started": {
    scenario: "loading-started",
    priority: "polite",
    contentTemplate: "Loading...",
    timing: "On load start"
  },
  "loading-complete": {
    scenario: "loading-complete",
    priority: "polite",
    contentTemplate: "{count} results loaded.",
    timing: "On completion",
    throttleMs: 0
  },
  "progress-update": {
    scenario: "progress-update",
    priority: "polite",
    contentTemplate: "{percentage}% - {detail}",
    timing: "Every 5s minimum",
    throttleMs: 5000
  },
  "sort-filter-change": {
    scenario: "sort-filter-change",
    priority: "polite",
    contentTemplate: "Sorted by {field}, {direction}.",
    timing: "After update"
  },
  "route-change": {
    scenario: "route-change",
    priority: "polite",
    contentTemplate: "{pageTitle}",
    timing: "After DOM update"
  },
  "autocomplete-results": {
    scenario: "autocomplete-results",
    priority: "polite",
    contentTemplate: "{count} suggestions. Use arrows.",
    timing: "After populate",
    throttleMs: 500
  }
};
/**
 * getAnnouncementPattern.
 * @param {AnnouncementScenario} scenario
 * @returns {AnnouncementPattern}
 */
export function getAnnouncementPattern(scenario) {
  return ANNOUNCEMENT_PATTERNS[scenario];
}
/**
 * getThrottleConfig.
 * @returns {ThrottleConfig}
 */
export function getThrottleConfig() {
  return {
    progressUpdateMs: 5000,
    searchDebounceMs: 500,
    realTimeIntervalMs: 1e4,
    chatBatchMs: 1000
  };
}
