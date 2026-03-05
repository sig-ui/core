// @ts-check

/**
 * SigUI core machines module for slider.
 * @module
 */
export const sliderMachine = {
  id: "slider",
  initial: "idle",
  context: { value: 0, min: 0, max: 100, step: 1 },
  states: {
    idle: {
      on: {
        DRAG_START: "dragging",
        FOCUS: "focused"
      }
    },
    dragging: {
      on: {
        DRAG_END: "idle"
      }
    },
    focused: {
      on: {
        BLUR: "idle",
        DRAG_START: "dragging",
        INCREMENT: "focused",
        DECREMENT: "focused"
      }
    }
  },
  actions: {
    increment: (ctx) => ({
      value: Math.min(ctx.max, ctx.value + ctx.step)
    }),
    decrement: (ctx) => ({
      value: Math.max(ctx.min, ctx.value - ctx.step)
    })
  }
};
