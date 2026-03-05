// @ts-check

/**
 * SigUI core machines module for generate.
 * @module
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { buttonMachine } from "../button.js";
import { checkboxMachine } from "../checkbox.js";
import { dialogMachine } from "../dialog.js";
import { selectMachine } from "../select.js";
import { tabsMachine } from "../tabs.js";
import { accordionMachine } from "../accordion.js";
import { popoverMachine } from "../popover.js";
import { tooltipMachine } from "../tooltip.js";
import { menuMachine } from "../menu.js";
import { sliderMachine } from "../slider.js";
import { toastMachine } from "../toast.js";
import { alertDialogMachine } from "../alertdialog.js";
import { collapsibleMachine } from "../collapsible.js";
import { progressMachine } from "../progress.js";
import { sheetMachine } from "../sheet.js";
const CONTEXT = {
  alertDialog: {
    variables: [{ name: "requiresAction", typeAnnotation: "Bool" }],
    init: ["requiresAction \\in BOOLEAN"],
    guardExpr: { canDismiss: "requiresAction = FALSE" },
    unchanged: "UNCHANGED requiresAction",
    invariants: [
      "\\* Closing is only reachable when the dialog is dismissable",
      'ClosingImpliesDismissable == state = "closing" => requiresAction = FALSE'
    ]
  }
};
function extractInfo(machine) {
  const id = machine.id;
  const states = Object.keys(machine.states);
  const transitions = [];
  const entryActions = new Map;
  const exitActions = new Map;
  for (const [stateName, stateNode] of Object.entries(machine.states)) {
    if (!stateNode)
      continue;
    if (stateNode.entry)
      entryActions.set(stateName, [...stateNode.entry]);
    if (stateNode.exit)
      exitActions.set(stateName, [...stateNode.exit]);
    const on = stateNode.on;
    if (!on)
      continue;
    for (const [event, target] of Object.entries(on)) {
      if (target === undefined)
        continue;
      if (typeof target === "string") {
        transitions.push({ from: stateName, event, to: target });
      } else {
        transitions.push({ from: stateName, event, to: target.target, guard: target.guard });
      }
    }
  }
  const guards = machine.guards ? Object.keys(machine.guards) : [];
  const terminal = states.filter((s) => {
    const node = machine.states[s];
    return !node?.on || Object.keys(node.on).length === 0;
  });
  const moduleName = id.charAt(0).toUpperCase() + id.slice(1);
  return {
    id,
    moduleName,
    states,
    initial: machine.initial,
    terminal,
    transitions,
    guards,
    entryActions,
    exitActions
  };
}
function pascal(s) {
  return s.split(/[_\s-]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
}
function actionName(t) {
  return `${pascal(t.from)}_${pascal(t.event)}`;
}
function deadlockableStates(info) {
  const result = [];
  for (const state of info.states) {
    if (info.terminal.includes(state))
      continue;
    const outgoing = info.transitions.filter((t) => t.from === state);
    if (outgoing.length === 0)
      continue;
    if (outgoing.some((t) => !t.guard))
      continue;
    const guards = [...new Set(outgoing.filter((t) => t.guard).map((t) => t.guard))];
    result.push({ state, guards });
  }
  return result;
}
function generateTLA(info) {
  const ctx = CONTEXT[info.id];
  const allEvents = [...new Set(info.transitions.map((t) => t.event))];
  const edgeNames = info.transitions.map(actionName);
  const ndGuards = info.guards.filter((g) => !ctx?.guardExpr[g]);
  const L = [];
  const w = (s) => L.push(s);
  const ww = (...ss) => {
    for (const s of ss)
      L.push(s);
  };
  w(`---- MODULE ${info.moduleName} ----`);
  w(`\\* Auto-generated from @sig-ui/core/machines/${info.id}.js`);
  w(`\\* Model-based testing spec for Apalache MC`);
  w(`\\*`);
  w(`\\* States:   ${info.states.join(", ")}`);
  w(`\\* Events:   ${allEvents.join(", ")}`);
  if (info.guards.length)
    w(`\\* Guards:   ${info.guards.join(", ")}`);
  if (info.terminal.length)
    w(`\\* Terminal: ${info.terminal.join(", ")}`);
  w(``);
  w(`EXTENDS Integers`);
  w(``);
  const vars = [
    { name: "state", type: "Str" },
    { name: "edge", type: "Str" }
  ];
  if (ctx) {
    for (const v of ctx.variables) {
      vars.push({ name: v.name, type: v.typeAnnotation });
    }
  }
  for (const g of ndGuards) {
    vars.push({ name: `guard_${g}`, type: "Bool" });
  }
  w(`VARIABLES`);
  for (let i = 0;i < vars.length; i++) {
    const v = vars[i];
    const comma = i < vars.length - 1 ? "," : "";
    w(`  \\* @type: ${v.type};`);
    w(`  ${v.name}${comma}`);
  }
  w(``);
  const extraVarNames = vars.slice(2).map((v) => v.name);
  w(`States == {${info.states.map((s) => `"${s}"`).join(", ")}}`);
  w(`Events == {${allEvents.map((e) => `"${e}"`).join(", ")}}`);
  w(`Edges == {${edgeNames.map((e) => `"${e}"`).join(", ")}}`);
  if (info.terminal.length > 0) {
    w(`TerminalStates == {${info.terminal.map((s) => `"${s}"`).join(", ")}}`);
  }
  w(``);
  w(`Init ==`);
  w(`  /\\ state = "${info.initial}"`);
  w(`  /\\ edge = "Init"`);
  if (ctx) {
    for (const init of ctx.init) {
      w(`  /\\ ${init}`);
    }
  }
  for (const g of ndGuards) {
    w(`  /\\ guard_${g} \\in BOOLEAN`);
  }
  w(``);
  for (const t of info.transitions) {
    const name = actionName(t);
    const guardLabel = t.guard ? ` [guard: ${t.guard}]` : "";
    w(`\\* ${t.from} --${t.event}${guardLabel}--> ${t.to}`);
    w(`${name} ==`);
    w(`  /\\ state = "${t.from}"`);
    if (t.guard) {
      if (ctx?.guardExpr[t.guard]) {
        w(`  /\\ ${ctx.guardExpr[t.guard]}`);
      } else {
        w(`  /\\ guard_${t.guard} = TRUE`);
      }
    }
    w(`  /\\ state' = "${t.to}"`);
    w(`  /\\ edge' = "${name}"`);
    if (ctx) {
      w(`  /\\ ${ctx.unchanged}`);
    }
    for (const g of ndGuards) {
      w(`  /\\ guard_${g}' \\in BOOLEAN`);
    }
    w(``);
  }
  const varNames = vars.map((v) => v.name);
  const varTypes = vars.map((v) => v.type);
  w(`\\* @type: <<${varTypes.join(", ")}>>;`);
  w(`vars == <<${varNames.join(", ")}>>`);
  w(``);
  w(`Next ==`);
  w(edgeNames.map((n) => `  \\/ ${n}`).join(`
`));
  if (info.terminal.length > 0) {
    w(`  \\/ (state \\in TerminalStates /\\ UNCHANGED vars)`);
  }
  w(``);
  ww(`\\* ================================================================`, `\\* Invariants`, `\\* ================================================================`, ``);
  w(`TypeOK ==`);
  w(`  /\\ state \\in States`);
  w(`  /\\ edge \\in Edges \\union {"Init"}`);
  w(``);
  const dlStates = deadlockableStates(info);
  if (dlStates.length === 0) {
    w(`\\* All non-terminal states have at least one unguarded transition.`);
    w(`\\* Deadlock is structurally impossible.`);
    w(`NoDeadlock == TRUE`);
    w(``);
  } else {
    w(`\\* Deadlock is possible in states where all exits are guarded.`);
    w(`\\* CanDeadlock_* invariants prove (via counterexample) that these are reachable.`);
    w(``);
    for (const dl of dlStates) {
      const guardExprs = dl.guards.map((g) => {
        const expr = ctx?.guardExpr[g] ? `~(${ctx.guardExpr[g]})` : `guard_${g} = FALSE`;
        return expr;
      });
      w(`\\* Deadlock: ${dl.state} with all guards blocking`);
      w(`CanDeadlock_${pascal(dl.state)} == ~(state = "${dl.state}" /\\ ${guardExprs.join(" /\\ ")})`);
    }
    w(``);
  }
  ww(`\\* ================================================================`, `\\* Reachability (counterexample proves the state is reachable)`, `\\* ================================================================`, ``);
  for (const s of info.states) {
    w(`NotIn_${pascal(s)} == state /= "${s}"`);
  }
  w(``);
  ww(`\\* ================================================================`, `\\* Edge coverage (counterexample proves the transition is traversable)`, `\\* ================================================================`, ``);
  for (const name of edgeNames) {
    w(`NoEdge_${name} == edge /= "${name}"`);
  }
  w(``);
  if (ctx && ctx.invariants.length > 0) {
    ww(`\\* ================================================================`, `\\* Guard & context properties`, `\\* ================================================================`, ``);
    for (const inv of ctx.invariants) {
      w(inv);
    }
    w(``);
  }
  w(`====`);
  return L.join(`
`);
}
const machines = [
  buttonMachine,
  checkboxMachine,
  dialogMachine,
  selectMachine,
  tabsMachine,
  accordionMachine,
  popoverMachine,
  tooltipMachine,
  menuMachine,
  sliderMachine,
  toastMachine,
  alertDialogMachine,
  collapsibleMachine,
  progressMachine,
  sheetMachine
].map((m) => m);
const outDir = join(dirname(new URL(import.meta.url).pathname), "tla");
mkdirSync(outDir, { recursive: true });
let count = 0;
for (const m of machines) {
  const info = extractInfo(m);
  const tla = generateTLA(info);
  const outPath = join(outDir, `${info.moduleName}.tla`);
  writeFileSync(outPath, tla + `
`);
  count++;
  const dl = deadlockableStates(info);
  const dlNote = dl.length > 0 ? `, ${dl.length} deadlockable` : "";
  console.log(`  ${info.moduleName}.tla  (${info.states.length}S ${info.transitions.length}E ${info.guards.length}G${dlNote})`);
}
console.log(`
Generated ${count} TLA+ specs in ${outDir}`);
