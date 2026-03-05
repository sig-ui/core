// @ts-check

/**
 * SigUI core color space module for xyz.
 * @module
 */
import { SRGB_TO_XYZ, XYZ_TO_SRGB } from "./matrices.js";
import { multiplyMatrix3 } from "../utils.js";
/**
 * linearSrgbToXyz.
 * @param {LinearRgb} rgb
 * @returns {XyzColor}
 */
export function linearSrgbToXyz(rgb) {
  const [x, y, z] = multiplyMatrix3(SRGB_TO_XYZ, [rgb.r, rgb.g, rgb.b]);
  return { x, y, z };
}
/**
 * xyzToLinearSrgb.
 * @param {XyzColor} xyz
 * @returns {LinearRgb}
 */
export function xyzToLinearSrgb(xyz) {
  const [r, g, b] = multiplyMatrix3(XYZ_TO_SRGB, [xyz.x, xyz.y, xyz.z]);
  return { r, g, b };
}
