// @ts-check

/**
 * SigUI core interactive module for validation.
 * @module
 */
/**
 * getValidationVisual.
 * @param {ValidationState} state
 * @returns {ValidationVisual}
 */
export function getValidationVisual(state) {
  switch (state) {
    case "neutral":
      return {
        borderColor: "var(--border)",
        background: null,
        icon: null,
        textColor: null
      };
    case "valid":
      return {
        borderColor: "var(--success-500)",
        background: "var(--success-subtle)",
        icon: "checkmark",
        textColor: null
      };
    case "invalid":
      return {
        borderColor: "var(--danger-500)",
        background: "var(--danger-subtle)",
        icon: "exclamation",
        textColor: "var(--danger-600)"
      };
  }
}
/**
 * getValidationTokens.
 * @returns {{ validBorder: string, invalidBorder: string, validBg: string, invalidBg: string }}
 */
export function getValidationTokens() {
  return {
    validBorder: "var(--success-500)",
    invalidBorder: "var(--danger-500)",
    validBg: "var(--success-subtle)",
    invalidBg: "var(--danger-subtle)"
  };
}
/**
 * needsErrorSummary.
 * @param {number} errorCount
 * @returns {boolean}
 */
export function needsErrorSummary(errorCount) {
  return errorCount > 3;
}
