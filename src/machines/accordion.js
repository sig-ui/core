// @ts-check

/**
 * SigUI core machines module for accordion.
 * @module
 */
export const accordionMachine = {
  id: "accordion",
  initial: "idle",
  context: { openPanels: [], multiple: false },
  states: {
    idle: {
      on: {
        TOGGLE: "idle",
        OPEN: "idle",
        CLOSE: "idle"
      },
      entry: ["handleToggle"]
    }
  },
  actions: {
    handleToggle: (ctx, event) => {
      const panel = event?.panel;
      if (!panel)
        return {};
      const isOpen = ctx.openPanels.includes(panel);
      if (isOpen) {
        return { openPanels: ctx.openPanels.filter((p) => p !== panel) };
      }
      if (ctx.multiple) {
        return { openPanels: [...ctx.openPanels, panel] };
      }
      return { openPanels: [panel] };
    }
  }
};
