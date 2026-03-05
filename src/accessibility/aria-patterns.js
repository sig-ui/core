// @ts-check

/**
 * SigUI core accessibility module for aria patterns.
 * @module
 */
export const ARIA_PATTERNS = {
  button: {
    role: "button",
    nativeElement: "button",
    attributes: [
      { attribute: "role", value: "button", condition: "always", notes: "Native <button> provides implicitly" },
      { attribute: "aria-pressed", value: "true/false/mixed", condition: "toggle buttons", notes: "Not used on standard action buttons" },
      { attribute: "aria-expanded", value: "true/false", condition: "disclosure buttons", notes: "Controls a collapsible region" },
      { attribute: "aria-controls", value: "id of controlled element", condition: "with aria-expanded", notes: "Links button to target" },
      { attribute: "aria-haspopup", value: "true/menu/listbox/dialog", condition: "popup triggers", notes: "Declares popup type" },
      { attribute: "aria-disabled", value: "true", condition: "focusable disabled buttons", notes: "Use when focus needed for tooltip" },
      { attribute: "aria-label", value: "text", condition: "icon-only buttons", notes: "Required when no visible text" },
      { attribute: "type", value: "button/submit/reset", condition: "always", notes: "Prevents accidental form submission" }
    ]
  },
  link: {
    role: "link",
    nativeElement: "a",
    attributes: [
      { attribute: "href", value: "URL", condition: "always", notes: "Required for keyboard activation" },
      { attribute: "aria-current", value: "page/step/true", condition: "current page links", notes: "Announced by screen readers" },
      { attribute: "target", value: "_blank", condition: "external links", notes: 'Pair with "(opens in new tab)" indicator' },
      { attribute: "rel", value: "noopener noreferrer", condition: "with target=_blank", notes: "Security requirement" }
    ]
  },
  input: {
    role: "textbox",
    nativeElement: "input",
    attributes: [
      { attribute: "aria-required", value: "true", condition: "required fields", notes: "Pair with visible indicator" },
      { attribute: "aria-invalid", value: "true", condition: "validation failure", notes: "Triggers screen reader announcement" },
      { attribute: "aria-describedby", value: "space-separated ids", condition: "help text, errors, counts", notes: "Order matters for announcement" },
      { attribute: "aria-errormessage", value: "id of error", condition: "with aria-invalid", notes: "Used alongside aria-describedby for fallback" },
      { attribute: "autocomplete", value: "appropriate value", condition: "personal data inputs", notes: "SC 1.3.5 input purpose identification" },
      { attribute: "inputmode", value: "numeric/tel/email/url", condition: "mobile inputs", notes: "Provides appropriate virtual keyboard" }
    ]
  },
  checkbox: {
    role: "checkbox",
    nativeElement: "input[type=checkbox]",
    attributes: [
      { attribute: "aria-checked", value: "true/false/mixed", condition: "custom checkboxes", notes: "Native manages state; mixed for indeterminate" },
      { attribute: "aria-required", value: "true", condition: "required checkboxes", notes: "E.g., terms acceptance" }
    ]
  },
  radioGroup: {
    role: "radiogroup",
    nativeElement: "fieldset",
    attributes: [
      { attribute: "aria-required", value: "true", condition: "mandatory selection", notes: "On the fieldset, not individual radios" },
      { attribute: "aria-invalid", value: "true", condition: "no selection when required", notes: "On the fieldset" }
    ]
  },
  listbox: {
    role: "listbox",
    nativeElement: "select",
    attributes: [
      { attribute: "aria-selected", value: "true/false", condition: "each option", notes: "Current selection" },
      { attribute: "aria-activedescendant", value: "id of focused option", condition: "activedescendant pattern", notes: "Focus remains on container" },
      { attribute: "aria-multiselectable", value: "true", condition: "multi-select", notes: "Enables multiple selection" },
      { attribute: "aria-label", value: "text", condition: "always", notes: "Every listbox needs an accessible name" }
    ]
  },
  combobox: {
    role: "combobox",
    nativeElement: "input",
    attributes: [
      { attribute: "role", value: "combobox", condition: "always", notes: "The text input is the combobox" },
      { attribute: "aria-expanded", value: "true/false", condition: "always", notes: "Popup visibility" },
      { attribute: "aria-controls", value: "id of listbox", condition: "always", notes: "Links input to popup" },
      { attribute: "aria-autocomplete", value: "none/list/both/inline", condition: "always", notes: "Describes filter behavior" },
      { attribute: "aria-activedescendant", value: "id of highlighted option", condition: "when option highlighted", notes: "Virtual focus in popup" },
      { attribute: "aria-haspopup", value: "listbox", condition: "always", notes: "Popup type declaration" }
    ]
  },
  dialog: {
    role: "dialog",
    nativeElement: "dialog",
    attributes: [
      { attribute: "aria-modal", value: "true", condition: "modal dialogs", notes: "showModal() implies this" },
      { attribute: "aria-labelledby", value: "id of title", condition: "always", notes: "Title announced on open" },
      { attribute: "aria-describedby", value: "id of description", condition: "when present", notes: "Context after title" }
    ]
  },
  tabs: {
    role: "tablist",
    nativeElement: "div",
    attributes: [
      { attribute: "role", value: "tablist", condition: "on tab container", notes: "Groups tabs" },
      { attribute: "role", value: "tab", condition: "on each button", notes: "Individual trigger" },
      { attribute: "role", value: "tabpanel", condition: "on content panels", notes: "Associated content" },
      { attribute: "aria-selected", value: "true/false", condition: "each tab", notes: "Active state" },
      { attribute: "aria-controls", value: "id of panel", condition: "each tab", notes: "Tab-to-panel link" },
      { attribute: "aria-labelledby", value: "id of tab", condition: "each panel", notes: "Panel-to-tab link" },
      { attribute: "tabindex", value: "0 (active) / -1 (inactive)", condition: "each tab", notes: "Roving tabindex" },
      { attribute: "aria-orientation", value: "horizontal/vertical", condition: "on tablist", notes: "Arrow key direction" }
    ]
  },
  menu: {
    role: "menu",
    nativeElement: "div",
    attributes: [
      { attribute: "role", value: "menu", condition: "on container", notes: "Action menu" },
      { attribute: "role", value: "menuitem", condition: "standard items", notes: "Individual action" },
      { attribute: "role", value: "menuitemcheckbox", condition: "checkable items", notes: "aria-checked required" },
      { attribute: "role", value: "menuitemradio", condition: "exclusive items", notes: "aria-checked required" },
      { attribute: "aria-haspopup", value: "menu", condition: "on trigger button", notes: "Popup declaration" },
      { attribute: "aria-expanded", value: "true/false", condition: "on trigger", notes: "Visibility state" }
    ]
  },
  tooltip: {
    role: "tooltip",
    nativeElement: "div",
    attributes: [
      { attribute: "role", value: "tooltip", condition: "always", notes: "Identifies popup type" },
      { attribute: "aria-describedby", value: "id of tooltip", condition: "on trigger", notes: "Links trigger to tooltip" }
    ]
  },
  alert: {
    role: "alert",
    nativeElement: "div",
    attributes: [
      { attribute: "role", value: "alert", condition: "always", notes: "Implies aria-live=assertive" }
    ]
  },
  toast: {
    role: "status",
    nativeElement: "div",
    attributes: [
      { attribute: "role", value: "status", condition: "always", notes: "Implies aria-live=polite" }
    ]
  },
  accordion: {
    role: "region",
    nativeElement: "div",
    attributes: [
      { attribute: "aria-expanded", value: "true/false", condition: "on each button", notes: "Section open/closed" },
      { attribute: "aria-controls", value: "id of panel", condition: "on each button", notes: "Links button to content" },
      { attribute: "role", value: "region", condition: "on each panel", notes: "For landmark navigation" },
      { attribute: "aria-labelledby", value: "id of button", condition: "on each panel", notes: "Panel-to-heading link" }
    ]
  },
  table: {
    role: "table",
    nativeElement: "table",
    attributes: [
      { attribute: "aria-sort", value: "ascending/descending/none", condition: "sortable columns", notes: "Current sort state" },
      { attribute: "aria-colcount", value: "total count", condition: "virtualized tables", notes: "Full dataset dimensions" },
      { attribute: "aria-rowcount", value: "total count", condition: "virtualized tables", notes: "Full dataset dimensions" },
      { attribute: "aria-colindex", value: "position", condition: "virtualized cells", notes: "Position in full dataset" },
      { attribute: "aria-rowindex", value: "position", condition: "virtualized rows", notes: "Position in full dataset" }
    ]
  },
  progressbar: {
    role: "progressbar",
    nativeElement: "progress",
    attributes: [
      { attribute: "role", value: "progressbar", condition: "always", notes: "Native <progress> provides this" },
      { attribute: "aria-valuenow", value: "number", condition: "determinate progress", notes: "Current value" },
      { attribute: "aria-valuemin", value: "number", condition: "determinate progress", notes: "Minimum value" },
      { attribute: "aria-valuemax", value: "number", condition: "determinate progress", notes: "Maximum value" },
      { attribute: "aria-valuetext", value: "human-readable", condition: "when value needs context", notes: '"3 of 10 files uploaded"' },
      { attribute: "aria-label", value: "text", condition: "always", notes: "What is progressing" },
      { attribute: "aria-busy", value: "true", condition: "on loading container", notes: "Defers SR announcement" }
    ]
  }
};
const PATTERN_NAMES = Object.keys(ARIA_PATTERNS);
/**
 * getAriaPattern.
 * @param {AriaPatternName} name
 * @returns {AriaPattern}
 */
export function getAriaPattern(name) {
  return ARIA_PATTERNS[name];
}
/**
 * getAriaPatternNames.
 * @returns {readonly AriaPatternName[]}
 */
export function getAriaPatternNames() {
  return PATTERN_NAMES;
}
