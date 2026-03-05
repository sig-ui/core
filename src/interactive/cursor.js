// @ts-check

/**
 * SigUI core interactive module for cursor.
 * @module
 */
/**
 * getCursorTokens.
 * @returns {CursorMap}
 */
export function getCursorTokens() {
  return {
    "cursor-default": "default",
    "cursor-pointer": "pointer",
    "cursor-text": "text",
    "cursor-move": "grab",
    "cursor-resize-col": "col-resize",
    "cursor-resize-row": "row-resize",
    "cursor-not-allowed": "not-allowed",
    "cursor-wait": "wait",
    "cursor-progress": "progress"
  };
}
/**
 * getCursorValue.
 * @param {CursorToken} token
 * @returns {string}
 */
export function getCursorValue(token) {
  return getCursorTokens()[token];
}
/**
 * resolveStateCursor.
 * @param {CursorToken} baseCursor
 * @param {{ readonly disabled?: boolean; readonly loading?: boolean }} options
 * @returns {CursorToken}
 */
export function resolveStateCursor(baseCursor, options) {
  if (options.disabled)
    return "cursor-not-allowed";
  if (options.loading)
    return "cursor-progress";
  return baseCursor;
}
