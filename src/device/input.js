// @ts-check

/**
 * SigUI core device module for input.
 * @module
 */
/**
 * deriveCommittedInputMode.
 * @param {boolean} pointerFine
 * @param {boolean} pointerCoarse
 * @returns {CommittedInputMode}
 */
export function deriveCommittedInputMode(pointerFine, pointerCoarse) {
  if (pointerFine && !pointerCoarse)
    return "pointer";
  if (pointerCoarse && !pointerFine)
    return "touch";
  if (pointerFine && pointerCoarse)
    return "hybrid";
  return "touch";
}
