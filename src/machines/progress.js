// @ts-check

/**
 * SigUI core machines module for progress.
 * @module
 */
export const progressMachine = {
  id: "progress",
  initial: "idle",
  context: { value: 0, max: 100 },
  states: {
    idle: {
      on: {
        START: "running"
      }
    },
    running: {
      on: {
        UPDATE: "running",
        COMPLETE: "complete"
      },
      entry: ["updateValue"]
    },
    complete: {
      on: {
        RESET: "idle"
      },
      entry: ["setComplete"]
    }
  },
  actions: {
    updateValue: (_ctx, event) => {
      const payload = event;
      return payload?.value != null ? { value: payload.value } : {};
    },
    setComplete: (ctx) => ({ value: ctx.max })
  }
};
