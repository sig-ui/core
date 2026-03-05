// @ts-check

/**
 * SigUI core contrast module for apca.
 * @module
 */
import { oklchToOklab, oklabToLinearRgb, toOklch } from "../color-space/oklch.js";
const SA98G = {
  sRco: 0.2126729,
  sGco: 0.7151522,
  sBco: 0.072175,
  normBG: 0.56,
  normTXT: 0.57,
  revBG: 0.65,
  revTXT: 0.62,
  scaleBoW: 1.14,
  scaleWoB: 1.14,
  loClip: 0.1,
  deltaYmin: 0.0005,
  loBoWoffset: 0.027,
  loWoBoffset: 0.027,
  blkThrs: 0.022,
  blkClmp: 1.414
};
function toLuminance(linearR, linearG, linearB) {
  let y = SA98G.sRco * linearR + SA98G.sGco * linearG + SA98G.sBco * linearB;
  if (y < SA98G.blkThrs) {
    y += Math.pow(SA98G.blkThrs - y, SA98G.blkClmp);
  }
  return y;
}
function resolveToLinear(color) {
  const oklch = typeof color === "string" ? toOklch(color) : color;
  const lab = oklchToOklab(oklch);
  const linear = oklabToLinearRgb(lab);
  return [
    Math.max(0, linear.r),
    Math.max(0, linear.g),
    Math.max(0, linear.b)
  ];
}
/**
 * apcaContrast.
 * @param {OklchColor | string} textColor
 * @param {OklchColor | string} bgColor
 * @returns {number}
 */
export function apcaContrast(textColor, bgColor) {
  const [tR, tG, tB] = resolveToLinear(textColor);
  const [bR, bG, bB] = resolveToLinear(bgColor);
  const txtY = toLuminance(tR, tG, tB);
  const bgY = toLuminance(bR, bG, bB);
  if (Math.abs(bgY - txtY) < SA98G.deltaYmin)
    return 0;
  let outputContrast;
  if (bgY > txtY) {
    const sapc = (Math.pow(bgY, SA98G.normBG) - Math.pow(txtY, SA98G.normTXT)) * SA98G.scaleBoW;
    outputContrast = sapc < SA98G.loClip ? 0 : sapc - SA98G.loBoWoffset;
  } else {
    const sapc = (Math.pow(bgY, SA98G.revBG) - Math.pow(txtY, SA98G.revTXT)) * SA98G.scaleWoB;
    outputContrast = sapc > -SA98G.loClip ? 0 : sapc + SA98G.loWoBoffset;
  }
  return outputContrast * 100;
}
