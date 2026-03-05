// @ts-check

/**
 * SigUI core machines module for alertdialog.
 * @module
 */
export const alertDialogMachine = {
  id: "alertDialog",
  initial: "closed",
  context: { returnFocusTo: null, requiresAction: true },
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
        CLOSE: { target: "closing", guard: "canDismiss" }
      }
    },
    closing: {
      on: {
        ANIMATION_END: "closed"
      },
      entry: ["restoreFocus"]
    }
  },
  guards: {
    canDismiss: (ctx) => !ctx.requiresAction
  },
  actions: {
    saveFocusTarget: () => ({ returnFocusTo: "trigger" }),
    restoreFocus: () => ({ returnFocusTo: null })
  }
};
