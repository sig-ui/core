// @ts-check

/**
 * SigUI core motion module for easing.
 * @module
 */
/**
 * getEasingCurves.
 * @returns {EasingCurves}
 */
export function getEasingCurves() {
  return {
    default: [0.2, 0, 0, 1],
    in: [0.4, 0, 1, 0.6],
    out: [0, 0, 0.2, 1],
    "in-out": [0.4, 0, 0.2, 1],
    linear: [0, 0, 1, 1],
    spring: [0.175, 0.885, 0.32, 1.275],
    snappy: [0.4, 0, 0, 1]
  };
}
/**
 * cubicBezierToTuple.
 * @param {CubicBezier} curve
 * @returns {BezierTuple}
 */
export function cubicBezierToTuple(curve) {
  return [curve.x1, curve.y1, curve.x2, curve.y2];
}
/**
 * tupleToCubicBezier.
 * @param {BezierTuple} tuple
 * @returns {CubicBezier}
 */
export function tupleToCubicBezier(tuple) {
  return { x1: tuple[0], y1: tuple[1], x2: tuple[2], y2: tuple[3] };
}
/**
 * cubicBezier.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} t
 * @returns {number}
 */
export function cubicBezier(x1, y1, x2, y2, t) {
  if (t <= 0)
    return 0;
  if (t >= 1)
    return 1;
  function sampleX(u) {
    return (1 - u) * (1 - u) * (1 - u) * 0 + 3 * u * (1 - u) * (1 - u) * x1 + 3 * u * u * (1 - u) * x2 + u * u * u * 1;
  }
  function sampleY(u) {
    return 3 * u * (1 - u) * (1 - u) * y1 + 3 * u * u * (1 - u) * y2 + u * u * u;
  }
  function sampleDX(u) {
    return 3 * (1 - u) * (1 - u) * x1 + 6 * u * (1 - u) * (x2 - x1) + 3 * u * u * (1 - x2);
  }
  let u = t;
  const eps = 0.0000001;
  const maxIter = 8;
  for (let i = 0;i < maxIter; i++) {
    const x = sampleX(u) - t;
    if (Math.abs(x) < eps)
      break;
    const dx = sampleDX(u);
    if (Math.abs(dx) < 0.000001)
      break;
    u -= x / dx;
    if (u < 0)
      u = 0;
    if (u > 1)
      u = 1;
  }
  let lo = 0;
  let hi = 1;
  u = t;
  for (let i = 0;i < 12; i++) {
    const x = sampleX(u);
    if (Math.abs(x - t) < eps)
      break;
    if (x < t) {
      lo = u;
    } else {
      hi = u;
    }
    u = (lo + hi) / 2;
  }
  return sampleY(u);
}
/**
 * easingToCss.
 * @param {EasingName} name
 * @returns {string}
 */
export function easingToCss(name) {
  if (name === "linear")
    return "linear";
  const curves = getEasingCurves();
  const [x1, y1, x2, y2] = curves[name];
  return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
}
