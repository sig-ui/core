// @ts-check

/**
 * SigUI core color space module for p3.
 * @module
 */
import { P3_TO_XYZ, XYZ_TO_P3 } from "./matrices.js";
import { multiplyMatrix3 } from "../utils.js";
/**
 * linearP3ToXyz.
 * @param {LinearRgb} rgb
 * @returns {XyzColor}
 */
export function linearP3ToXyz(rgb) {
  const [x, y, z] = multiplyMatrix3(P3_TO_XYZ, [rgb.r, rgb.g, rgb.b]);
  return { x, y, z };
}
/**
 * xyzToLinearP3.
 * @param {XyzColor} xyz
 * @returns {LinearRgb}
 */
export function xyzToLinearP3(xyz) {
  const [r, g, b] = multiplyMatrix3(XYZ_TO_P3, [xyz.x, xyz.y, xyz.z]);
  return { r, g, b };
}
