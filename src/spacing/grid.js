// @ts-check

/**
 * SigUI core spacing module for grid.
 * @module
 */
const GRID_CONFIGS = {
  default: {
    columns: 4,
    gutter: 16,
    margin: 16,
    maxWidth: null
  },
  sm: {
    columns: 4,
    gutter: 16,
    margin: 16,
    maxWidth: null
  },
  md: {
    columns: 8,
    gutter: 24,
    margin: 24,
    maxWidth: null
  },
  lg: {
    columns: 12,
    gutter: 24,
    margin: 24,
    maxWidth: null
  },
  xl: {
    columns: 12,
    gutter: 32,
    margin: 32,
    maxWidth: 1280
  },
  "2xl": {
    columns: 12,
    gutter: 32,
    margin: 64,
    maxWidth: 1280
  }
};
/**
 * getGridConfig.
 * @param {GridBreakpointKey} breakpoint
 * @returns {FullGridConfig}
 */
export function getGridConfig(breakpoint = "default") {
  return GRID_CONFIGS[breakpoint];
}
/**
 * getAllGridConfigs.
 * @returns {Readonly<
  Record<GridBreakpointKey, FullGridConfig>
>}
 */
export function getAllGridConfigs() {
  return GRID_CONFIGS;
}
/**
 * computeColumnWidth.
 * @param {number} containerWidth
 * @param {number} columns
 * @param {number} gutter
 * @param {number} margin
 * @returns {number}
 */
export function computeColumnWidth(containerWidth, columns, gutter, margin = 0) {
  if (columns <= 0)
    return 0;
  const totalGutterSpace = (columns - 1) * gutter;
  const totalMarginSpace = 2 * margin;
  const availableWidth = containerWidth - totalGutterSpace - totalMarginSpace;
  return Math.max(0, availableWidth / columns);
}
/**
 * computeSpanWidth.
 * @param {number} colSpan
 * @param {number} columnWidth
 * @param {number} gutter
 * @returns {number}
 */
export function computeSpanWidth(colSpan, columnWidth, gutter) {
  if (colSpan <= 0)
    return 0;
  return colSpan * columnWidth + (colSpan - 1) * gutter;
}
/**
 * validateGridConfig.
 * @param {GridConfig} config
 * @param {number} containerWidth
 * @returns {ReadonlyArray<string>}
 */
export function validateGridConfig(config, containerWidth) {
  const errors = [];
  if (config.columns < 1) {
    errors.push("columns must be at least 1");
  }
  if (config.gutter < 0) {
    errors.push("gutter must be non-negative");
  }
  if (config.margin < 0) {
    errors.push("margin must be non-negative");
  }
  if (containerWidth !== undefined) {
    const minRequired = config.gutter * (config.columns - 1) + 2 * config.margin;
    if (containerWidth <= minRequired) {
      errors.push(`containerWidth (${containerWidth}px) is too narrow for ${config.columns} columns ` + `with ${config.gutter}px gutters and ${config.margin}px margins ` + `(minimum: ${minRequired + 1}px)`);
    }
  }
  return errors;
}
