// @ts-check

/**
 * SigUI core machines module for tooltip.
 * @module
 */
export const tooltipMachine = {
  id: "tooltip",
  initial: "idle",
  context: { delayMs: 700 },
  states: {
    idle: {
      on: {
        POINTER_ENTER: "waiting",
        FOCUS: "waiting"
      }
    },
    waiting: {
      on: {
        POINTER_LEAVE: "idle",
        BLUR: "idle",
        DELAY_END: "visible"
      }
    },
    visible: {
      on: {
        POINTER_LEAVE: "hiding",
        BLUR: "hiding"
      }
    },
    hiding: {
      on: {
        POINTER_ENTER: "visible",
        FOCUS: "visible",
        ANIMATION_END: "idle"
      }
    }
  }
};
