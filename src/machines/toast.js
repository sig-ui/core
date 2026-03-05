// @ts-check

/**
 * SigUI core machines module for toast.
 * @module
 */
export const toastMachine = {
  id: "toast",
  initial: "idle",
  context: { durationMs: 5000, message: "" },
  states: {
    idle: {
      on: {
        SHOW: "entering"
      }
    },
    entering: {
      on: {
        ANIMATION_END: "visible"
      }
    },
    visible: {
      on: {
        DISMISS: "exiting",
        TIMEOUT: "exiting"
      }
    },
    exiting: {
      on: {
        ANIMATION_END: "done"
      }
    },
    done: {}
  }
};
