// @ts-check

/**
 * SigUI core machines module for popover.
 * @module
 */
export const popoverMachine = {
  id: "popover",
  initial: "closed",
  context: { triggerRect: null },
  states: {
    closed: {
      on: {
        OPEN: "opening",
        TOGGLE: "opening"
      }
    },
    opening: {
      on: {
        ANIMATION_END: "open"
      }
    },
    open: {
      on: {
        CLOSE: "closing",
        TOGGLE: "closing"
      }
    },
    closing: {
      on: {
        ANIMATION_END: "closed",
        OPEN: "opening"
      }
    }
  }
};
