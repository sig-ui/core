// @ts-check

/**
 * SigUI core machines module for button.
 * @module
 */
export const buttonMachine = {
  id: "button",
  initial: "idle",
  context: { pressCount: 0 },
  states: {
    idle: {
      on: {
        PRESS: "pressed",
        LOAD_START: "loading"
      }
    },
    pressed: {
      on: {
        RELEASE: { target: "idle", guard: "notLoading" }
      },
      entry: ["incrementPress"]
    },
    loading: {
      on: {
        LOAD_END: "idle"
      }
    }
  },
  guards: {
    notLoading: () => true
  },
  actions: {
    incrementPress: (ctx) => ({ pressCount: ctx.pressCount + 1 })
  }
};
