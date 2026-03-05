// @ts-check

/**
 * SigUI core interactive module for state layer.
 * @module
 */
/**
 * getStateLayerConfig.
 * @returns {StateLayerConfig}
 */
export function getStateLayerConfig() {
  return {
    hover: 0.08,
    focus: 0.12,
    active: 0.12,
    dragged: 0.16,
    disabledContent: 0.38,
    disabledContainer: 0.12
  };
}
/**
 * getStateLayerOpacity.
 * @param {InteractionState | "dragged"} state
 * @returns {number}
 */
export function getStateLayerOpacity(state) {
  const config = getStateLayerConfig();
  switch (state) {
    case "rest":
      return 0;
    case "hover":
      return config.hover;
    case "focus":
      return config.focus;
    case "active":
      return config.active;
    case "dragged":
      return config.dragged;
  }
}
/**
 * getStateLayerColor.
 * @param {InteractionState | "dragged"} state
 * @param {"light" | "dark"} mode
 * @returns {string}
 */
export function getStateLayerColor(state, mode) {
  const opacity = getStateLayerOpacity(state);
  if (opacity === 0)
    return "transparent";
  const l = mode === "dark" ? 1 : 0;
  return `oklch(${l} 0 0 / ${opacity})`;
}
/**
 * getStatePriority.
 * @returns {readonly InteractiveState[]}
 */
export function getStatePriority() {
  return [
    "disabled",
    "loading",
    "invalid",
    "focus",
    "active",
    "selected",
    "hover"
  ];
}
/**
 * getStatePriorityRank.
 * @param {InteractiveState} state
 * @returns {number}
 */
export function getStatePriorityRank(state) {
  return getStatePriority().indexOf(state);
}
/**
 * resolveDominantState.
 * @param {readonly InteractiveState[]} states
 * @returns {InteractiveState | null}
 */
export function resolveDominantState(states) {
  const priority = getStatePriority();
  for (const state of priority) {
    if (states.includes(state))
      return state;
  }
  return null;
}
