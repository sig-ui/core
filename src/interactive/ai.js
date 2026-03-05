// @ts-check

/**
 * SigUI core interactive module for ai.
 * @module
 */
/**
 * getAIConfig.
 * @returns {AIInterfaceConfig}
 */
export function getAIConfig() {
  return {
    streamingCursorBlink: 500,
    autoRetryDelay: 2000,
    submittedShimmerDelay: 300,
    streamingThrottleMs: 50,
    toolApprovalRequired: true,
    reasoningDefaultState: "collapsed",
    messageBranching: true,
    confidenceIndicators: false,
    modelSelector: true,
    promptInput: getAIPromptInputConfig()
  };
}
/**
 * getAIPromptInputConfig.
 * @returns {AIPromptInputConfig}
 */
export function getAIPromptInputConfig() {
  return {
    autoResize: true,
    maxHeight: "12em",
    submitOnEnter: true,
    showTokenCount: false,
    attachments: true
  };
}
/**
 * getMessageVisual.
 * @param {AIMessageRole} role
 * @returns {AIMessageVisual}
 */
export function getMessageVisual(role) {
  switch (role) {
    case "user":
      return {
        background: "var(--primary-subtle)",
        fullWidth: false,
        collapsible: false
      };
    case "assistant":
      return {
        background: null,
        fullWidth: true,
        collapsible: false
      };
    case "system":
      return {
        background: null,
        fullWidth: true,
        collapsible: true
      };
    case "tool":
      return {
        background: null,
        fullWidth: false,
        collapsible: true
      };
  }
}
/**
 * getAIInputState.
 * @param {AIState} state
 * @returns {AIInputStateConfig}
 */
export function getAIInputState(state) {
  switch (state) {
    case "ready":
      return {
        inputEnabled: true,
        submitVisible: true,
        stopVisible: false,
        toolApprovalVisible: false,
        submitLabel: null
      };
    case "submitted":
    case "streaming":
      return {
        inputEnabled: false,
        submitVisible: false,
        stopVisible: true,
        toolApprovalVisible: false,
        submitLabel: null
      };
    case "tool-calling":
      return {
        inputEnabled: false,
        submitVisible: false,
        stopVisible: true,
        toolApprovalVisible: true,
        submitLabel: null
      };
    case "error":
      return {
        inputEnabled: true,
        submitVisible: true,
        stopVisible: false,
        toolApprovalVisible: false,
        submitLabel: "Retry"
      };
    case "cancelled":
      return {
        inputEnabled: true,
        submitVisible: true,
        stopVisible: false,
        toolApprovalVisible: false,
        submitLabel: null
      };
  }
}
/**
 * getConfidenceLevel.
 * @param {number} score
 * @returns {ConfidenceLevel}
 */
export function getConfidenceLevel(score) {
  if (score >= 0.8)
    return "high";
  if (score >= 0.5)
    return "medium";
  return "low";
}
/**
 * getConfidenceColor.
 * @param {ConfidenceLevel} level
 * @returns {string}
 */
export function getConfidenceColor(level) {
  switch (level) {
    case "high":
      return "var(--success-500)";
    case "medium":
      return "var(--warning-500)";
    case "low":
      return "var(--danger-500)";
  }
}
