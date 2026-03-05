// @ts-check

/**
 * SigUI core spacing module for scale.
 * @module
 */
const SCALE_PX_VALUES = [
  ["0", 0],
  ["px", 1],
  ["0.5", 2],
  ["1", 4],
  ["1.5", 6],
  ["2", 8],
  ["3", 12],
  ["4", 16],
  ["5", 20],
  ["6", 24],
  ["8", 32],
  ["10", 40],
  ["12", 48],
  ["16", 64],
  ["20", 80],
  ["24", 96]
];
const EXTENDED_PX_VALUES = [
  ["2.5", 10],
  ["3.5", 14],
  ["7", 28],
  ["9", 36],
  ["11", 44],
  ["14", 56],
  ["28", 112],
  ["32", 128],
  ["36", 144],
  ["40", 160],
  ["44", 176],
  ["48", 192],
  ["52", 208],
  ["56", 224],
  ["60", 240],
  ["64", 256],
  ["72", 288],
  ["80", 320],
  ["96", 384]
];
function pxToRem(px) {
  if (px === 0)
    return "0";
  const rem = px / 16;
  return `${parseFloat(rem.toFixed(4))}rem`;
}
/**
 * generateSpacingScale.
 * @param {SpacingScaleOptions} options
 * @returns {SpacingScaleMap}
 */
export function generateSpacingScale(options) {
  const {
    baseUnit = 4,
    unit = "rem",
    includeExtended = false
  } = options ?? {};
  const entries = [
    ...SCALE_PX_VALUES,
    ...includeExtended ? EXTENDED_PX_VALUES : []
  ];
  const map = new Map;
  for (const [name, basePx] of entries) {
    const scaledPx = basePx === 0 || name === "px" ? basePx : basePx / 4 * baseUnit;
    const remValue = scaledPx / 16;
    const entry = {
      name,
      px: scaledPx,
      rem: pxToRem(scaledPx),
      remValue
    };
    map.set(name, entry);
  }
  const sorted = new Map([...map.entries()].sort(([, a], [, b]) => {
    return a.px - b.px;
  }));
  return sorted;
}
/**
 * getSpacingValue.
 * @param {SpacingScaleMap} scale
 * @param {string} token
 * @param {"rem" | "px"} unit
 * @returns {string | undefined}
 */
export function getSpacingValue(scale, token, unit = "rem") {
  const entry = scale.get(token);
  if (!entry)
    return;
  if (unit === "px") {
    return entry.px === 0 ? "0" : `${entry.px}px`;
  }
  return entry.rem;
}
export const SEMANTIC_SPACING_TOKENS = {
  "gap-inline": "2",
  "gap-stack": "4",
  "gap-section": "12",
  "gap-targets": "2",
  "pad-input": "3",
  "pad-button-y": "3",
  "pad-button-x": "4",
  "pad-card": "6",
  "pad-page": "6",
  "pad-page-lg": "16"
};
