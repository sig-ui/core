// @ts-check

/**
 * SigUI core i18n module for logical properties.
 * @module
 */
export const LOGICAL_PROPERTY_MAP = [
  { physical: "margin-top", logical: "margin-block-start", axis: "block" },
  { physical: "margin-bottom", logical: "margin-block-end", axis: "block" },
  { physical: "margin-left", logical: "margin-inline-start", axis: "inline" },
  { physical: "margin-right", logical: "margin-inline-end", axis: "inline" },
  { physical: "padding-top", logical: "padding-block-start", axis: "block" },
  { physical: "padding-bottom", logical: "padding-block-end", axis: "block" },
  { physical: "padding-left", logical: "padding-inline-start", axis: "inline" },
  { physical: "padding-right", logical: "padding-inline-end", axis: "inline" },
  { physical: "border-top", logical: "border-block-start", axis: "block" },
  { physical: "border-bottom", logical: "border-block-end", axis: "block" },
  { physical: "border-left", logical: "border-inline-start", axis: "inline" },
  { physical: "border-right", logical: "border-inline-end", axis: "inline" },
  { physical: "border-top-left-radius", logical: "border-start-start-radius", axis: "inline" },
  { physical: "border-top-right-radius", logical: "border-start-end-radius", axis: "inline" },
  { physical: "border-bottom-left-radius", logical: "border-end-start-radius", axis: "inline" },
  { physical: "border-bottom-right-radius", logical: "border-end-end-radius", axis: "inline" },
  { physical: "top", logical: "inset-block-start", axis: "block" },
  { physical: "bottom", logical: "inset-block-end", axis: "block" },
  { physical: "left", logical: "inset-inline-start", axis: "inline" },
  { physical: "right", logical: "inset-inline-end", axis: "inline" },
  { physical: "width", logical: "inline-size", axis: "inline" },
  { physical: "height", logical: "block-size", axis: "block" },
  { physical: "min-width", logical: "min-inline-size", axis: "inline" },
  { physical: "min-height", logical: "min-block-size", axis: "block" },
  { physical: "max-width", logical: "max-inline-size", axis: "inline" },
  { physical: "max-height", logical: "max-block-size", axis: "block" },
  { physical: "text-align: left", logical: "text-align: start", axis: "inline" },
  { physical: "text-align: right", logical: "text-align: end", axis: "inline" },
  { physical: "float: left", logical: "float: inline-start", axis: "inline" },
  { physical: "float: right", logical: "float: inline-end", axis: "inline" },
  { physical: "clear: left", logical: "clear: inline-start", axis: "inline" },
  { physical: "clear: right", logical: "clear: inline-end", axis: "inline" },
  { physical: "overflow-x", logical: "overflow-inline", axis: "inline" },
  { physical: "overflow-y", logical: "overflow-block", axis: "block" },
  { physical: "resize: horizontal", logical: "resize: inline", axis: "inline" },
  { physical: "resize: vertical", logical: "resize: block", axis: "block" },
  { physical: "scroll-margin-left", logical: "scroll-margin-inline-start", axis: "inline" },
  { physical: "scroll-padding-left", logical: "scroll-padding-inline-start", axis: "inline" }
];
export const DIRECTIONAL_ICONS = [
  { icon: "arrow-forward", mustMirror: true },
  { icon: "arrow-back", mustMirror: true },
  { icon: "chevron-next", mustMirror: true },
  { icon: "chevron-prev", mustMirror: true },
  { icon: "external-link", mustMirror: true },
  { icon: "reply", mustMirror: true },
  { icon: "undo", mustMirror: true },
  { icon: "redo", mustMirror: true },
  { icon: "progress", mustMirror: true },
  { icon: "play", mustMirror: false },
  { icon: "checkmark", mustMirror: false },
  { icon: "close", mustMirror: false },
  { icon: "plus", mustMirror: false },
  { icon: "minus", mustMirror: false },
  { icon: "clock", mustMirror: false },
  { icon: "music", mustMirror: false }
];
