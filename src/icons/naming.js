// @ts-check

/**
 * SigUI core icons module for naming.
 * @module
 */
export const ICON_CATEGORIES = [
  "navigation",
  "action",
  "status",
  "media",
  "editor",
  "communication",
  "file",
  "device",
  "social",
  "commerce"
];
export const ICON_ALIASES = {
  trash: "action-delete",
  pencil: "action-edit",
  plus: "action-add",
  copy: "action-copy",
  save: "action-save",
  download: "action-download",
  upload: "action-upload",
  share: "action-share",
  filter: "action-filter",
  search: "action-search",
  settings: "action-settings",
  refresh: "action-refresh",
  home: "nav-home",
  menu: "nav-menu",
  back: "nav-arrow-left",
  forward: "nav-arrow-right",
  close: "nav-close",
  check: "status-success",
  error: "status-error",
  warning: "status-warning",
  info: "status-info"
};
export const CORE_ICON_MANIFEST = [
  { name: "nav-home", category: "navigation", aliases: ["home"], directional: false, description: "Home / landing page" },
  { name: "nav-menu", category: "navigation", aliases: ["menu", "hamburger"], directional: false, description: "Menu / hamburger" },
  { name: "nav-close", category: "navigation", aliases: ["close", "x"], directional: false, description: "Close / dismiss" },
  { name: "nav-arrow-left", category: "navigation", aliases: ["back", "arrow-left"], directional: true, description: "Navigate back / left arrow" },
  { name: "nav-arrow-right", category: "navigation", aliases: ["forward", "arrow-right"], directional: true, description: "Navigate forward / right arrow" },
  { name: "nav-arrow-up", category: "navigation", aliases: ["arrow-up"], directional: false, description: "Navigate up" },
  { name: "nav-arrow-down", category: "navigation", aliases: ["arrow-down"], directional: false, description: "Navigate down" },
  { name: "nav-chevron-left", category: "navigation", aliases: ["chevron-left"], directional: true, description: "Expand / collapse left" },
  { name: "nav-chevron-right", category: "navigation", aliases: ["chevron-right"], directional: true, description: "Expand / collapse right" },
  { name: "nav-chevron-up", category: "navigation", aliases: ["chevron-up"], directional: false, description: "Expand / collapse up" },
  { name: "nav-chevron-down", category: "navigation", aliases: ["chevron-down"], directional: false, description: "Expand / collapse down" },
  { name: "nav-more-horizontal", category: "navigation", aliases: ["dots-horizontal", "ellipsis"], directional: false, description: "More actions (horizontal)" },
  { name: "nav-more-vertical", category: "navigation", aliases: ["dots-vertical"], directional: false, description: "More actions (vertical)" },
  { name: "nav-external-link", category: "navigation", aliases: ["external-link"], directional: true, description: "Open in new window" },
  { name: "action-add", category: "action", aliases: ["plus", "create"], directional: false, description: "Add / create" },
  { name: "action-delete", category: "action", aliases: ["trash", "remove"], directional: false, description: "Delete / remove" },
  { name: "action-edit", category: "action", aliases: ["pencil", "modify"], directional: false, description: "Edit / modify" },
  { name: "action-copy", category: "action", aliases: ["copy", "duplicate"], directional: false, description: "Copy / duplicate" },
  { name: "action-save", category: "action", aliases: ["save"], directional: false, description: "Save" },
  { name: "action-download", category: "action", aliases: ["download"], directional: false, description: "Download" },
  { name: "action-upload", category: "action", aliases: ["upload"], directional: false, description: "Upload" },
  { name: "action-share", category: "action", aliases: ["share"], directional: false, description: "Share" },
  { name: "action-undo", category: "action", aliases: ["undo"], directional: true, description: "Undo last action" },
  { name: "action-redo", category: "action", aliases: ["redo"], directional: true, description: "Redo last action" },
  { name: "action-search", category: "action", aliases: ["search", "find"], directional: false, description: "Search / find" },
  { name: "action-filter", category: "action", aliases: ["filter"], directional: false, description: "Filter" },
  { name: "action-sort", category: "action", aliases: ["sort"], directional: false, description: "Sort" },
  { name: "action-settings", category: "action", aliases: ["settings", "gear", "cog"], directional: false, description: "Settings / preferences" },
  { name: "action-refresh", category: "action", aliases: ["refresh", "reload"], directional: false, description: "Refresh / reload" },
  { name: "status-success", category: "status", aliases: ["check", "checkmark"], directional: false, description: "Success / confirmed" },
  { name: "status-error", category: "status", aliases: ["error", "x-circle"], directional: false, description: "Error / failure" },
  { name: "status-warning", category: "status", aliases: ["warning", "alert-triangle"], directional: false, description: "Warning / caution" },
  { name: "status-info", category: "status", aliases: ["info", "info-circle"], directional: false, description: "Information" },
  { name: "status-loading", category: "status", aliases: ["spinner", "loading"], directional: false, description: "Loading / in-progress" },
  { name: "media-play", category: "media", aliases: ["play"], directional: false, description: "Play media" },
  { name: "media-pause", category: "media", aliases: ["pause"], directional: false, description: "Pause media" },
  { name: "media-stop", category: "media", aliases: ["stop"], directional: false, description: "Stop media" },
  { name: "media-skip-forward", category: "media", aliases: ["skip-forward", "next"], directional: true, description: "Skip forward / next" },
  { name: "media-skip-back", category: "media", aliases: ["skip-back", "previous"], directional: true, description: "Skip back / previous" },
  { name: "media-volume", category: "media", aliases: ["volume", "speaker"], directional: false, description: "Volume / speaker" },
  { name: "media-mute", category: "media", aliases: ["mute", "volume-off"], directional: false, description: "Mute / silence" },
  { name: "media-image", category: "media", aliases: ["image", "photo"], directional: false, description: "Image / photo" },
  { name: "editor-bold", category: "editor", aliases: ["bold"], directional: false, description: "Bold text" },
  { name: "editor-italic", category: "editor", aliases: ["italic"], directional: false, description: "Italic text" },
  { name: "editor-underline", category: "editor", aliases: ["underline"], directional: false, description: "Underline text" },
  { name: "editor-align-left", category: "editor", aliases: ["align-left"], directional: true, description: "Align text left" },
  { name: "editor-align-center", category: "editor", aliases: ["align-center"], directional: false, description: "Align text center" },
  { name: "editor-align-right", category: "editor", aliases: ["align-right"], directional: true, description: "Align text right" },
  { name: "editor-list", category: "editor", aliases: ["list", "list-unordered"], directional: true, description: "Unordered list" },
  { name: "editor-list-ordered", category: "editor", aliases: ["list-ordered", "numbered-list"], directional: true, description: "Ordered list" },
  { name: "comm-mail", category: "communication", aliases: ["mail", "email", "envelope"], directional: false, description: "Email / message" },
  { name: "comm-chat", category: "communication", aliases: ["chat", "message", "bubble"], directional: false, description: "Chat / conversation" },
  { name: "comm-notification", category: "communication", aliases: ["notification", "bell"], directional: false, description: "Notification / alert" },
  { name: "file-document", category: "file", aliases: ["document", "file"], directional: false, description: "Document / file" },
  { name: "file-folder", category: "file", aliases: ["folder"], directional: false, description: "Folder / directory" }
];
/**
 * resolveIconName.
 * @param {string} name
 * @param {Record<string, string>} customAliases
 * @returns {string | undefined}
 */
export function resolveIconName(name, customAliases) {
  if (customAliases?.[name]) {
    return customAliases[name];
  }
  if (ICON_ALIASES[name]) {
    return ICON_ALIASES[name];
  }
  if (CORE_ICON_MANIFEST.some((entry) => entry.name === name)) {
    return name;
  }
  return;
}
/**
 * validateIconName.
 * @param {string} name
 * @returns {boolean}
 */
export function validateIconName(name) {
  return resolveIconName(name) !== undefined;
}
/**
 * getIconCategory.
 * @param {string} name
 * @returns {IconCategory | undefined}
 */
export function getIconCategory(name) {
  const resolved = resolveIconName(name);
  if (!resolved)
    return;
  const entry = CORE_ICON_MANIFEST.find((e) => e.name === resolved);
  return entry?.category;
}
