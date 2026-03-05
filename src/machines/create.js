// @ts-check

/**
 * SigUI core machines module for create.
 * @module
 */
/** @typedef {(string | number | boolean | null | undefined | Record<string, string | number | boolean | null | undefined> | Array<string | number | boolean | null | undefined>)} MachineValue */
/** @typedef {Record<string, MachineValue>} MachineContext */
/** @typedef {{ target: string, guard?: string }} MachineGuardedTransition */
/** @typedef {string | MachineGuardedTransition} MachineTransition */
/** @typedef {{ on?: Record<string, MachineTransition>, entry?: string[], exit?: string[] }} MachineStateNode */
/** @typedef {{ initial: string, context: MachineContext, states: Record<string, MachineStateNode>, actions?: Record<string, (context: MachineContext, payload?: MachineValue) => Partial<MachineContext> | void>, guards?: Record<string, (context: MachineContext, payload?: MachineValue) => boolean> }} MachineDefinitionLike */
/** @typedef {{ readonly state: string, readonly context: MachineContext, send: (event: string, payload?: MachineValue) => void, subscribe: (listener: (state: string, context: MachineContext) => void) => (() => void) }} MachineInstanceLike */
/**
 * createMachine.
 * @param {MachineDefinitionLike} definition
 * @returns {MachineInstanceLike}
 */
export function createMachine(definition) {
  let currentState = definition.initial;
  let currentContext = { ...definition.context };
  const listeners = new Set;
  const initialNode = definition.states[currentState];
  if (initialNode?.entry) {
    for (const actionName of initialNode.entry) {
      const action = definition.actions?.[actionName];
      if (action) {
        currentContext = { ...currentContext, ...action(currentContext) };
      }
    }
  }
  function notify() {
    for (const listener of listeners) {
      listener(currentState, currentContext);
    }
  }
  function send(event, payload) {
    const stateNode = definition.states[currentState];
    if (!stateNode?.on)
      return;
    const transition = stateNode.on[event];
    if (transition === undefined)
      return;
    let target;
    if (typeof transition === "string") {
      target = transition;
    } else {
      if (transition.guard) {
        const guard = definition.guards?.[transition.guard];
        if (guard && !guard(currentContext, payload))
          return;
      }
      target = transition.target;
    }
    if (stateNode.exit) {
      for (const actionName of stateNode.exit) {
        const action = definition.actions?.[actionName];
        if (action) {
          currentContext = { ...currentContext, ...action(currentContext, payload) };
        }
      }
    }
    currentState = target;
    const targetNode = definition.states[target];
    if (targetNode?.entry) {
      for (const actionName of targetNode.entry) {
        const action = definition.actions?.[actionName];
        if (action) {
          currentContext = { ...currentContext, ...action(currentContext, payload) };
        }
      }
    }
    notify();
  }
  return {
    get state() {
      return currentState;
    },
    get context() {
      return currentContext;
    },
    send,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
}
