// @ts-check

/**
 * SigUI core machines module for tabs.
 * @module
 */
export const tabsMachine = {
  id: "tabs",
  initial: "idle",
  context: { activeTab: "", focusedTab: "", tabs: [] },
  states: {
    idle: {
      on: {
        FOCUS: "focused",
        SELECT: "idle"
      }
    },
    focused: {
      on: {
        BLUR: "idle",
        SELECT: "focused",
        NEXT: "focused",
        PREV: "focused",
        FIRST: "focused",
        LAST: "focused"
      }
    }
  },
  actions: {
    selectTab: (ctx, event) => {
      const tab = event?.tab ?? ctx.focusedTab;
      return { activeTab: tab, focusedTab: tab };
    },
    focusNext: (ctx) => {
      const idx = ctx.tabs.indexOf(ctx.focusedTab);
      const next = ctx.tabs[(idx + 1) % ctx.tabs.length] ?? ctx.focusedTab;
      return { focusedTab: next };
    },
    focusPrev: (ctx) => {
      const idx = ctx.tabs.indexOf(ctx.focusedTab);
      const prev = ctx.tabs[(idx - 1 + ctx.tabs.length) % ctx.tabs.length] ?? ctx.focusedTab;
      return { focusedTab: prev };
    }
  }
};
