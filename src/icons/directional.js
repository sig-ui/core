// @ts-check

/**
 * SigUI core icons module for directional.
 * @module
 */
export const ICONS_THAT_MIRROR = [
  { icon: "nav-arrow-left", mirror: true },
  { icon: "nav-arrow-right", mirror: true },
  { icon: "nav-chevron-left", mirror: true },
  { icon: "nav-chevron-right", mirror: true },
  { icon: "nav-external-link", mirror: true },
  { icon: "action-undo", mirror: true },
  { icon: "action-redo", mirror: true },
  { icon: "editor-align-left", mirror: true },
  { icon: "editor-align-right", mirror: true },
  { icon: "editor-list", mirror: true },
  { icon: "editor-list-ordered", mirror: true },
  { icon: "media-skip-forward", mirror: true },
  { icon: "media-skip-back", mirror: true },
  { icon: "editor-indent", mirror: true },
  { icon: "editor-outdent", mirror: true },
  { icon: "nav-breadcrumb-separator", mirror: true },
  { icon: "nav-sidebar-left", mirror: true },
  { icon: "nav-sidebar-right", mirror: true }
];
export const ICONS_THAT_DO_NOT_MIRROR = [
  { icon: "status-success", mirror: false },
  { icon: "status-error", mirror: false },
  { icon: "status-warning", mirror: false },
  { icon: "status-info", mirror: false },
  { icon: "media-play", mirror: false },
  { icon: "media-pause", mirror: false },
  { icon: "media-stop", mirror: false },
  { icon: "media-volume", mirror: false },
  { icon: "media-mute", mirror: false },
  { icon: "nav-close", mirror: false },
  { icon: "action-add", mirror: false },
  { icon: "action-delete", mirror: false },
  { icon: "action-search", mirror: false },
  { icon: "action-settings", mirror: false },
  { icon: "action-refresh", mirror: false },
  { icon: "nav-arrow-up", mirror: false },
  { icon: "nav-arrow-down", mirror: false }
];
const mirrorSet = new Set(ICONS_THAT_MIRROR.map((r) => r.icon));
const fixedSet = new Set(ICONS_THAT_DO_NOT_MIRROR.map((r) => r.icon));
/**
 * shouldMirrorInRTL.
 * @param {string} name
 * @returns {boolean}
 */
export function shouldMirrorInRTL(name) {
  return mirrorSet.has(name);
}
/**
 * isFixedDirection.
 * @param {string} name
 * @returns {boolean}
 */
export function isFixedDirection(name) {
  return fixedSet.has(name);
}
