// @ts-check

/**
 * SigUI core machines module for menu.
 * @module
 */
export const menuMachine = {
  id: "menu",
  initial: "closed",
  context: { focusedIndex: -1, itemCount: 0 },
  states: {
    closed: {
      on: {
        OPEN: "open",
        TOGGLE: "open"
      }
    },
    open: {
      on: {
        CLOSE: "closed",
        TOGGLE: "closed",
        SELECT: "closed",
        FOCUS_NEXT: "open",
        FOCUS_PREV: "open"
      },
      entry: ["initFocus"],
      exit: ["resetFocus"]
    }
  },
  actions: {
    initFocus: () => ({ focusedIndex: 0 }),
    resetFocus: () => ({ focusedIndex: -1 })
  }
};
