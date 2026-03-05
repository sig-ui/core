// @ts-check

/**
 * SigUI core typography module for index.
 * @module
 */
export { generateTypeScale, remToPx, pxToRem } from "./scale.js";
export { computeLineHeight, longMeasureOffset } from "./line-height.js";
export { computeMeasure, measureTokens } from "./measure.js";
export { computeLetterSpacing, capsLetterSpacing } from "./letter-spacing.js";
export { getFontWeights, suggestedWeight } from "./font-weight.js";
export { darkModeAdjustments, gradeOffset } from "./dark-mode.js";
export { fluidFontSize, fluidTypeScale, deriveFluidMaxRatio } from "./fluid.js";
export { assignSemanticRoles, RATIO_BANDS } from "./semantic-roles.js";
export { computeBodyFromViewingAngle, VIEWING_ANGLE_K, DEVICE_PRESETS } from "./visual-angle.js";
export { computeVerticalRhythm, computeHeadingSpacing } from "./vertical-rhythm.js";
export { getDyslexiaAdjustments, applyDyslexiaLineHeight } from "./dyslexia.js";
export { getFontSizeAdjust, FONT_X_HEIGHT_RATIOS, needsXHeightNormalization } from "./x-height.js";
