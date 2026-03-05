// @ts-check

/**
 * SigUI core machines module for checkbox.
 * @module
 */
export const checkboxMachine = {
  id: "checkbox",
  initial: "unchecked",
  context: {},
  states: {
    unchecked: {
      on: {
        TOGGLE: "checked",
        CHECK: "checked",
        SET_INDETERMINATE: "indeterminate"
      }
    },
    checked: {
      on: {
        TOGGLE: "unchecked",
        UNCHECK: "unchecked",
        SET_INDETERMINATE: "indeterminate"
      }
    },
    indeterminate: {
      on: {
        TOGGLE: "checked",
        CHECK: "checked",
        UNCHECK: "unchecked"
      }
    }
  }
};
