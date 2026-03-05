// @ts-check

/**
 * SigUI core machines module for collapsible.
 * @module
 */
export const collapsibleMachine = {
  id: "collapsible",
  initial: "closed",
  context: {},
  states: {
    closed: {
      on: {
        TOGGLE: "opening",
        OPEN: "opening"
      }
    },
    opening: {
      on: {
        ANIMATION_END: "open"
      }
    },
    open: {
      on: {
        TOGGLE: "closing",
        CLOSE: "closing"
      }
    },
    closing: {
      on: {
        ANIMATION_END: "closed"
      }
    }
  }
};
