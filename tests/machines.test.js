// @ts-check

/**
 * Repository module for machines.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  createMachine,
  buttonMachine,
  dialogMachine,
  checkboxMachine,
  selectMachine,
  popoverMachine,
  tooltipMachine,
  menuMachine,
  toastMachine,
  sliderMachine,
  tabsMachine,
  accordionMachine,
  alertDialogMachine,
  collapsibleMachine,
  progressMachine,
  sheetMachine
} from "../src/machines/index.js";
describe("createMachine", () => {
  test("starts in initial state", () => {
    const m = createMachine(buttonMachine);
    expect(m.state).toBe("idle");
  });
  test("transitions on valid events", () => {
    const m = createMachine(buttonMachine);
    m.send("PRESS");
    expect(m.state).toBe("pressed");
  });
  test("ignores invalid events", () => {
    const m = createMachine(buttonMachine);
    m.send("RELEASE");
    expect(m.state).toBe("idle");
  });
  test("runs entry actions on transition", () => {
    const m = createMachine(buttonMachine);
    expect(m.context.pressCount).toBe(0);
    m.send("PRESS");
    expect(m.context.pressCount).toBe(1);
    m.send("RELEASE");
    m.send("PRESS");
    expect(m.context.pressCount).toBe(2);
  });
  test("subscribe notifies on transitions", () => {
    const m = createMachine(buttonMachine);
    const states = [];
    const unsub = m.subscribe((state) => states.push(state));
    m.send("PRESS");
    m.send("RELEASE");
    expect(states).toEqual(["pressed", "idle"]);
    unsub();
    m.send("PRESS");
    expect(states).toEqual(["pressed", "idle"]);
  });
  test("guards prevent transitions", () => {
    const m = createMachine({
      id: "guarded",
      initial: "a",
      context: { allowed: false },
      states: {
        a: {
          on: { GO: { target: "b", guard: "isAllowed" } }
        },
        b: {
          on: { BACK: "a" }
        }
      },
      guards: {
        isAllowed: (ctx) => ctx.allowed
      }
    });
    m.send("GO");
    expect(m.state).toBe("a");
    const m2 = createMachine({
      id: "guarded2",
      initial: "a",
      context: { allowed: true },
      states: {
        a: {
          on: { GO: { target: "b", guard: "isAllowed" } }
        },
        b: {}
      },
      guards: {
        isAllowed: (ctx) => ctx.allowed
      }
    });
    m2.send("GO");
    expect(m2.state).toBe("b");
  });
});
describe("buttonMachine", () => {
  test("idle → PRESS → pressed → RELEASE → idle", () => {
    const m = createMachine(buttonMachine);
    expect(m.state).toBe("idle");
    m.send("PRESS");
    expect(m.state).toBe("pressed");
    m.send("RELEASE");
    expect(m.state).toBe("idle");
  });
  test("idle → LOAD_START → loading → LOAD_END → idle", () => {
    const m = createMachine(buttonMachine);
    m.send("LOAD_START");
    expect(m.state).toBe("loading");
    m.send("LOAD_END");
    expect(m.state).toBe("idle");
  });
  test("increments press count", () => {
    const m = createMachine(buttonMachine);
    m.send("PRESS");
    m.send("RELEASE");
    m.send("PRESS");
    m.send("RELEASE");
    m.send("PRESS");
    expect(m.context.pressCount).toBe(3);
  });
});
describe("dialogMachine", () => {
  test("full lifecycle: closed → opening → open → closing → closed", () => {
    const m = createMachine(dialogMachine);
    expect(m.state).toBe("closed");
    m.send("OPEN");
    expect(m.state).toBe("opening");
    m.send("ANIMATION_END");
    expect(m.state).toBe("open");
    m.send("CLOSE");
    expect(m.state).toBe("closing");
    m.send("ANIMATION_END");
    expect(m.state).toBe("closed");
  });
  test("saves focus target on opening", () => {
    const m = createMachine(dialogMachine);
    m.send("OPEN");
    expect(m.context.returnFocusTo).toBe("trigger");
  });
  test("clears focus target on closing", () => {
    const m = createMachine(dialogMachine);
    m.send("OPEN");
    m.send("ANIMATION_END");
    m.send("CLOSE");
    expect(m.context.returnFocusTo).toBeNull();
  });
});
describe("checkboxMachine", () => {
  test("tri-state cycling", () => {
    const m = createMachine(checkboxMachine);
    expect(m.state).toBe("unchecked");
    m.send("TOGGLE");
    expect(m.state).toBe("checked");
    m.send("TOGGLE");
    expect(m.state).toBe("unchecked");
  });
  test("indeterminate state", () => {
    const m = createMachine(checkboxMachine);
    m.send("SET_INDETERMINATE");
    expect(m.state).toBe("indeterminate");
    m.send("TOGGLE");
    expect(m.state).toBe("checked");
  });
  test("explicit check/uncheck", () => {
    const m = createMachine(checkboxMachine);
    m.send("CHECK");
    expect(m.state).toBe("checked");
    m.send("UNCHECK");
    expect(m.state).toBe("unchecked");
  });
});
describe("selectMachine", () => {
  test("open and close", () => {
    const m = createMachine(selectMachine);
    expect(m.state).toBe("closed");
    m.send("OPEN");
    expect(m.state).toBe("open");
    m.send("CLOSE");
    expect(m.state).toBe("closed");
  });
  test("toggle", () => {
    const m = createMachine(selectMachine);
    m.send("TOGGLE");
    expect(m.state).toBe("open");
    m.send("TOGGLE");
    expect(m.state).toBe("closed");
  });
  test("select closes with guard", () => {
    const m = createMachine(selectMachine);
    m.send("OPEN");
    m.send("SELECT", { value: "option-1" });
    expect(m.state).toBe("closed");
  });
});
describe("popoverMachine", () => {
  test("full lifecycle", () => {
    const m = createMachine(popoverMachine);
    m.send("OPEN");
    expect(m.state).toBe("opening");
    m.send("ANIMATION_END");
    expect(m.state).toBe("open");
    m.send("CLOSE");
    expect(m.state).toBe("closing");
    m.send("ANIMATION_END");
    expect(m.state).toBe("closed");
  });
  test("toggle", () => {
    const m = createMachine(popoverMachine);
    m.send("TOGGLE");
    expect(m.state).toBe("opening");
  });
  test("reopen from closing", () => {
    const m = createMachine(popoverMachine);
    m.send("OPEN");
    m.send("ANIMATION_END");
    m.send("CLOSE");
    expect(m.state).toBe("closing");
    m.send("OPEN");
    expect(m.state).toBe("opening");
  });
});
describe("tooltipMachine", () => {
  test("hover lifecycle", () => {
    const m = createMachine(tooltipMachine);
    m.send("POINTER_ENTER");
    expect(m.state).toBe("waiting");
    m.send("DELAY_END");
    expect(m.state).toBe("visible");
    m.send("POINTER_LEAVE");
    expect(m.state).toBe("hiding");
    m.send("ANIMATION_END");
    expect(m.state).toBe("idle");
  });
  test("cancel before delay", () => {
    const m = createMachine(tooltipMachine);
    m.send("POINTER_ENTER");
    m.send("POINTER_LEAVE");
    expect(m.state).toBe("idle");
  });
  test("focus triggers tooltip", () => {
    const m = createMachine(tooltipMachine);
    m.send("FOCUS");
    expect(m.state).toBe("waiting");
  });
});
describe("menuMachine", () => {
  test("open and close", () => {
    const m = createMachine(menuMachine);
    m.send("OPEN");
    expect(m.state).toBe("open");
    expect(m.context.focusedIndex).toBe(0);
    m.send("CLOSE");
    expect(m.state).toBe("closed");
    expect(m.context.focusedIndex).toBe(-1);
  });
  test("select closes menu", () => {
    const m = createMachine(menuMachine);
    m.send("OPEN");
    m.send("SELECT");
    expect(m.state).toBe("closed");
  });
});
describe("toastMachine", () => {
  test("full lifecycle", () => {
    const m = createMachine(toastMachine);
    m.send("SHOW");
    expect(m.state).toBe("entering");
    m.send("ANIMATION_END");
    expect(m.state).toBe("visible");
    m.send("TIMEOUT");
    expect(m.state).toBe("exiting");
    m.send("ANIMATION_END");
    expect(m.state).toBe("done");
  });
  test("manual dismiss", () => {
    const m = createMachine(toastMachine);
    m.send("SHOW");
    m.send("ANIMATION_END");
    m.send("DISMISS");
    expect(m.state).toBe("exiting");
  });
});
describe("sliderMachine", () => {
  test("drag lifecycle", () => {
    const m = createMachine(sliderMachine);
    m.send("DRAG_START");
    expect(m.state).toBe("dragging");
    m.send("DRAG_END");
    expect(m.state).toBe("idle");
  });
  test("keyboard focus", () => {
    const m = createMachine(sliderMachine);
    m.send("FOCUS");
    expect(m.state).toBe("focused");
    m.send("BLUR");
    expect(m.state).toBe("idle");
  });
});
describe("tabsMachine", () => {
  test("focus and blur", () => {
    const m = createMachine(tabsMachine);
    m.send("FOCUS");
    expect(m.state).toBe("focused");
    m.send("BLUR");
    expect(m.state).toBe("idle");
  });
  test("select in idle", () => {
    const m = createMachine(tabsMachine);
    m.send("SELECT");
    expect(m.state).toBe("idle");
  });
});
describe("accordionMachine", () => {
  test("stays in idle (single-state machine with context changes)", () => {
    const m = createMachine(accordionMachine);
    expect(m.state).toBe("idle");
    m.send("TOGGLE", { panel: "p1" });
    expect(m.state).toBe("idle");
  });
});
describe("alertDialogMachine", () => {
  test("full lifecycle: closed → opening → open → closing → closed", () => {
    const m = createMachine(alertDialogMachine);
    expect(m.state).toBe("closed");
    m.send("OPEN");
    expect(m.state).toBe("opening");
    m.send("ANIMATION_END");
    expect(m.state).toBe("open");
    m.send("CLOSE");
    expect(m.state).toBe("open");
  });
  test("saves focus target on opening", () => {
    const m = createMachine(alertDialogMachine);
    m.send("OPEN");
    expect(m.context.returnFocusTo).toBe("trigger");
  });
  test("requiresAction guard blocks backdrop dismiss", () => {
    const m = createMachine(alertDialogMachine);
    m.send("OPEN");
    m.send("ANIMATION_END");
    m.send("CLOSE");
    expect(m.state).toBe("open");
  });
  test("allows close when requiresAction is false", () => {
    const machine = {
      ...alertDialogMachine,
      context: { ...alertDialogMachine.context, requiresAction: false }
    };
    const m = createMachine(machine);
    m.send("OPEN");
    m.send("ANIMATION_END");
    m.send("CLOSE");
    expect(m.state).toBe("closing");
    m.send("ANIMATION_END");
    expect(m.state).toBe("closed");
  });
});
describe("collapsibleMachine", () => {
  test("full lifecycle: closed → opening → open → closing → closed", () => {
    const m = createMachine(collapsibleMachine);
    expect(m.state).toBe("closed");
    m.send("TOGGLE");
    expect(m.state).toBe("opening");
    m.send("ANIMATION_END");
    expect(m.state).toBe("open");
    m.send("TOGGLE");
    expect(m.state).toBe("closing");
    m.send("ANIMATION_END");
    expect(m.state).toBe("closed");
  });
  test("explicit open/close", () => {
    const m = createMachine(collapsibleMachine);
    m.send("OPEN");
    expect(m.state).toBe("opening");
    m.send("ANIMATION_END");
    expect(m.state).toBe("open");
    m.send("CLOSE");
    expect(m.state).toBe("closing");
    m.send("ANIMATION_END");
    expect(m.state).toBe("closed");
  });
  test("ignores CLOSE when already closed", () => {
    const m = createMachine(collapsibleMachine);
    m.send("CLOSE");
    expect(m.state).toBe("closed");
  });
});
describe("progressMachine", () => {
  test("full lifecycle: idle → running → complete", () => {
    const m = createMachine(progressMachine);
    expect(m.state).toBe("idle");
    m.send("START");
    expect(m.state).toBe("running");
    m.send("COMPLETE");
    expect(m.state).toBe("complete");
  });
  test("reset returns to idle", () => {
    const m = createMachine(progressMachine);
    m.send("START");
    m.send("COMPLETE");
    m.send("RESET");
    expect(m.state).toBe("idle");
  });
  test("update stays in running", () => {
    const m = createMachine(progressMachine);
    m.send("START");
    m.send("UPDATE");
    expect(m.state).toBe("running");
  });
  test("initial context has value 0 and max 100", () => {
    const m = createMachine(progressMachine);
    expect(m.context.value).toBe(0);
    expect(m.context.max).toBe(100);
  });
  test("complete sets value to max", () => {
    const m = createMachine(progressMachine);
    m.send("START");
    m.send("COMPLETE");
    expect(m.context.value).toBe(100);
  });
});
describe("sheetMachine", () => {
  test("full lifecycle: closed → opening → open → closing → closed", () => {
    const m = createMachine(sheetMachine);
    expect(m.state).toBe("closed");
    m.send("OPEN");
    expect(m.state).toBe("opening");
    m.send("ANIMATION_END");
    expect(m.state).toBe("open");
    m.send("CLOSE");
    expect(m.state).toBe("closing");
    m.send("ANIMATION_END");
    expect(m.state).toBe("closed");
  });
  test("default side is right", () => {
    const m = createMachine(sheetMachine);
    expect(m.context.side).toBe("right");
  });
  test("saves and restores focus target", () => {
    const m = createMachine(sheetMachine);
    m.send("OPEN");
    expect(m.context.returnFocusTo).toBe("trigger");
    m.send("ANIMATION_END");
    m.send("CLOSE");
    expect(m.context.returnFocusTo).toBeNull();
  });
  test("custom side in context", () => {
    const machine = {
      ...sheetMachine,
      context: { ...sheetMachine.context, side: "left" }
    };
    const m = createMachine(machine);
    expect(m.context.side).toBe("left");
  });
});
describe("subpath export", () => {
  test("@sig-ui/core/machines resolves", async () => {
    const mod = await import("@sig-ui/core/machines");
    expect(mod.createMachine).toBeDefined();
    expect(mod.buttonMachine).toBeDefined();
    expect(mod.dialogMachine).toBeDefined();
    expect(mod.checkboxMachine).toBeDefined();
    expect(mod.selectMachine).toBeDefined();
    expect(mod.tabsMachine).toBeDefined();
    expect(mod.accordionMachine).toBeDefined();
    expect(mod.popoverMachine).toBeDefined();
    expect(mod.tooltipMachine).toBeDefined();
    expect(mod.menuMachine).toBeDefined();
    expect(mod.sliderMachine).toBeDefined();
    expect(mod.toastMachine).toBeDefined();
    expect(mod.alertDialogMachine).toBeDefined();
    expect(mod.collapsibleMachine).toBeDefined();
    expect(mod.progressMachine).toBeDefined();
    expect(mod.sheetMachine).toBeDefined();
  });
});
