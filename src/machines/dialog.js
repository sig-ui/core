// @ts-check

/**
 * SigUI core machines module for dialog.
 * @module
 */
export const dialogMachine = {
  id: "dialog",
  initial: "closed",
  context: { returnFocusTo: null },
  states: {
    closed: {
      on: {
        OPEN: "opening"
      }
    },
    opening: {
      on: {
        ANIMATION_END: "open"
      },
      entry: ["saveFocusTarget"]
    },
    open: {
      on: {
        CLOSE: "closing"
      }
    },
    closing: {
      on: {
        ANIMATION_END: "closed"
      },
      entry: ["restoreFocus"]
    }
  },
  actions: {
    saveFocusTarget: () => ({ returnFocusTo: "trigger" }),
    restoreFocus: () => ({ returnFocusTo: null })
  }
};
