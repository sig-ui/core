// @ts-check

/**
 * SigUI core accessibility module for keyboard maps.
 * @module
 */
export const KEYBOARD_MAPS = {
  button: {
    bindings: [
      { key: "Enter", action: "activate", preventDefault: true },
      { key: " ", action: "activate", preventDefault: true }
    ],
    focusStrategy: "manual",
    loop: false,
    typeahead: false
  },
  radioGroup: {
    bindings: [
      { key: "ArrowDown", action: "next", preventDefault: true },
      { key: "ArrowRight", action: "next", preventDefault: true },
      { key: "ArrowUp", action: "prev", preventDefault: true },
      { key: "ArrowLeft", action: "prev", preventDefault: true }
    ],
    focusStrategy: "roving-tabindex",
    loop: true,
    typeahead: false
  },
  listbox: {
    bindings: [
      { key: "ArrowDown", action: "next", preventDefault: true },
      { key: "ArrowUp", action: "prev", preventDefault: true },
      { key: "Home", action: "first", preventDefault: true },
      { key: "End", action: "last", preventDefault: true },
      { key: "Enter", action: "select", preventDefault: true },
      { key: " ", action: "select", preventDefault: true }
    ],
    focusStrategy: "aria-activedescendant",
    loop: false,
    typeahead: true
  },
  combobox: {
    bindings: [
      { key: "ArrowDown", action: "open-or-next", preventDefault: true },
      { key: "ArrowUp", action: "prev-or-close", preventDefault: true },
      { key: "Enter", action: "accept", preventDefault: true },
      { key: "Escape", action: "close-or-clear", preventDefault: true },
      { key: "Alt+ArrowDown", action: "open", preventDefault: true }
    ],
    focusStrategy: "aria-activedescendant",
    loop: false,
    typeahead: false
  },
  dialog: {
    bindings: [
      { key: "Escape", action: "close", preventDefault: true },
      { key: "Tab", action: "focus-next", preventDefault: false },
      { key: "Shift+Tab", action: "focus-prev", preventDefault: false }
    ],
    focusStrategy: "manual",
    loop: true,
    typeahead: false
  },
  tabs: {
    bindings: [
      { key: "ArrowLeft", action: "prev", preventDefault: true },
      { key: "ArrowRight", action: "next", preventDefault: true },
      { key: "ArrowUp", action: "prev", preventDefault: true },
      { key: "ArrowDown", action: "next", preventDefault: true },
      { key: "Home", action: "first", preventDefault: true },
      { key: "End", action: "last", preventDefault: true }
    ],
    focusStrategy: "roving-tabindex",
    loop: true,
    typeahead: false
  },
  menu: {
    bindings: [
      { key: "ArrowDown", action: "next", preventDefault: true },
      { key: "ArrowUp", action: "prev", preventDefault: true },
      { key: "ArrowRight", action: "open-submenu", preventDefault: true },
      { key: "ArrowLeft", action: "close-submenu", preventDefault: true },
      { key: "Home", action: "first", preventDefault: true },
      { key: "End", action: "last", preventDefault: true },
      { key: "Enter", action: "activate", preventDefault: true },
      { key: " ", action: "activate", preventDefault: true },
      { key: "Escape", action: "close", preventDefault: true }
    ],
    focusStrategy: "roving-tabindex",
    loop: true,
    typeahead: true
  },
  accordion: {
    bindings: [
      { key: "Enter", action: "toggle", preventDefault: true },
      { key: " ", action: "toggle", preventDefault: true },
      { key: "ArrowDown", action: "next", preventDefault: true },
      { key: "ArrowUp", action: "prev", preventDefault: true },
      { key: "Home", action: "first", preventDefault: true },
      { key: "End", action: "last", preventDefault: true }
    ],
    focusStrategy: "roving-tabindex",
    loop: true,
    typeahead: false
  },
  dataGrid: {
    bindings: [
      { key: "ArrowRight", action: "next-cell", preventDefault: true },
      { key: "ArrowLeft", action: "prev-cell", preventDefault: true },
      { key: "ArrowDown", action: "next-row", preventDefault: true },
      { key: "ArrowUp", action: "prev-row", preventDefault: true },
      { key: "Enter", action: "edit-or-sort", preventDefault: true },
      { key: "Escape", action: "exit-edit", preventDefault: true },
      { key: "Ctrl+Home", action: "first-cell", preventDefault: true },
      { key: "Ctrl+End", action: "last-cell", preventDefault: true }
    ],
    focusStrategy: "roving-tabindex",
    loop: false,
    typeahead: false
  }
};
/**
 * getKeyboardMap.
 * @param {KeyboardMapName} name
 * @returns {KeyboardMap}
 */
export function getKeyboardMap(name) {
  return KEYBOARD_MAPS[name];
}
const MODIFIER_KEYS = new Set(["Ctrl", "Alt", "Shift", "Meta"]);
/**
 * createShortcutRegistry.
 * @returns {ShortcutRegistry}
 */
export function createShortcutRegistry() {
  return { shortcuts: new Map };
}
/**
 * registerShortcut.
 * @param {ShortcutRegistry} registry
 * @param {Shortcut} shortcut
 * @returns {ShortcutRegistry}
 */
export function registerShortcut(registry, shortcut) {
  const next = new Map(registry.shortcuts);
  next.set(shortcut.id, shortcut);
  return { shortcuts: next };
}
/**
 * lookupShortcut.
 * @param {ShortcutRegistry} registry
 * @param {string} id
 * @returns {Shortcut | undefined}
 */
export function lookupShortcut(registry, id) {
  return registry.shortcuts.get(id);
}
/**
 * validateShortcutModifier.
 * @param {string} keys
 * @returns {boolean}
 */
export function validateShortcutModifier(keys) {
  const parts = keys.split("+").map((s) => s.trim());
  if (parts.length === 1) {
    return MODIFIER_KEYS.has(parts[0]);
  }
  return parts.some((p) => MODIFIER_KEYS.has(p));
}
