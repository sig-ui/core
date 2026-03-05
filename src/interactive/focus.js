// @ts-check

/**
 * SigUI core interactive module for focus.
 * @module
 */
/**
 * getFocusRingConfig.
 * @returns {FocusRingConfig}
 */
export function getFocusRingConfig() {
  return {
    color: "var(--sg-color-border-focus)",
    width: 2,
    offset: 2
  };
}
/**
 * getFocusRingCSS.
 * @param {Partial<FocusRingConfig>} config
 * @returns {{ outline: string, outlineOffset: string }}
 */
export function getFocusRingCSS(config) {
  const c = { ...getFocusRingConfig(), ...config };
  return {
    outline: `${c.width}px solid ${c.color}`,
    outlineOffset: `${c.offset}px`
  };
}
/**
 * getForcedColorsFocusCSS.
 * @returns {{ outline: string, outlineOffset: string }}
 */
export function getForcedColorsFocusCSS() {
  const config = getFocusRingConfig();
  return {
    outline: `${config.width}px solid CanvasText`,
    outlineOffset: `${config.offset}px`
  };
}
/**
 * getScrollPaddingConfig.
 * @returns {ScrollPaddingConfig}
 */
export function getScrollPaddingConfig() {
  return {
    headerHeight: 64,
    footerHeight: 0,
    buffer: 16
  };
}
/**
 * computeScrollPadding.
 * @param {Partial<ScrollPaddingConfig>} config
 * @returns {{ top: number, bottom: number }}
 */
export function computeScrollPadding(config) {
  const c = { ...getScrollPaddingConfig(), ...config };
  return {
    top: c.headerHeight + c.buffer,
    bottom: c.footerHeight + c.buffer
  };
}
