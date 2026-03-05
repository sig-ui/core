// @ts-check

/**
 * SigUI core machines module for select.
 * @module
 */
export const selectMachine = {
  id: "select",
  initial: "closed",
  context: { selectedValue: null, focusedIndex: -1, itemCount: 0 },
  states: {
    closed: {
      on: {
        TOGGLE: "open",
        OPEN: "open"
      }
    },
    open: {
      on: {
        TOGGLE: "closed",
        CLOSE: "closed",
        SELECT: { target: "closed", guard: "hasSelection" },
        FOCUS_NEXT: "open",
        FOCUS_PREV: "open"
      },
      entry: ["initFocus"],
      exit: ["commitSelection"]
    }
  },
  guards: {
    hasSelection: (_ctx, event) => {
      return event != null && typeof event === "object" && "value" in event;
    }
  },
  actions: {
    initFocus: (ctx) => ({
      focusedIndex: ctx.selectedValue !== null ? 0 : 0
    }),
    commitSelection: (ctx, event) => {
      if (event != null && typeof event === "object" && "value" in event) {
        return { selectedValue: event.value };
      }
      return {};
    }
  }
};
