// @ts-check

/**
 * SigUI core motion module for svg.
 * @module
 */
function parsePathToPoints(d) {
  const points = [];
  const numbers = d.match(/-?\d+\.?\d*(?:e[+-]?\d+)?/gi);
  if (!numbers)
    return points;
  for (let i = 0;i < numbers.length - 1; i += 2) {
    points.push({
      x: parseFloat(numbers[i]),
      y: parseFloat(numbers[i + 1])
    });
  }
  return points;
}
/**
 * normalizePath.
 * @param {string} d
 * @param {number} targetPoints
 * @returns {string}
 */
export function normalizePath(d, targetPoints) {
  const points = parsePathToPoints(d);
  if (points.length === 0 || targetPoints <= 0) {
    return "M0,0";
  }
  if (points.length === targetPoints) {
    return pointsToPath(points);
  }
  const resampled = resamplePoints(points, targetPoints);
  return pointsToPath(resampled);
}
/**
 * interpolatePath.
 * @param {string} from
 * @param {string} to
 * @param {number} t
 * @returns {string}
 */
export function interpolatePath(from, to, t) {
  const fromPts = parsePathToPoints(from);
  const toPts = parsePathToPoints(to);
  const maxLen = Math.max(fromPts.length, toPts.length);
  const a = fromPts.length === maxLen ? fromPts : resamplePoints(fromPts, maxLen);
  const b = toPts.length === maxLen ? toPts : resamplePoints(toPts, maxLen);
  const result = [];
  for (let i = 0;i < maxLen; i++) {
    result.push({
      x: a[i].x + (b[i].x - a[i].x) * t,
      y: a[i].y + (b[i].y - a[i].y) * t
    });
  }
  return pointsToPath(result);
}
/**
 * approximatePathLength.
 * @param {string} d
 * @returns {number}
 */
export function approximatePathLength(d) {
  const points = parsePathToPoints(d);
  if (points.length < 2)
    return 0;
  let length = 0;
  for (let i = 1;i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}
function resamplePoints(points, targetCount) {
  if (points.length === 0)
    return [];
  if (targetCount === 1)
    return [points[0]];
  if (points.length === 1) {
    return Array.from({ length: targetCount }, () => ({ ...points[0] }));
  }
  const result = [];
  for (let i = 0;i < targetCount; i++) {
    const t = i / (targetCount - 1);
    const idx = t * (points.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, points.length - 1);
    const frac = idx - lo;
    result.push({
      x: points[lo].x + (points[hi].x - points[lo].x) * frac,
      y: points[lo].y + (points[hi].y - points[lo].y) * frac
    });
  }
  return result;
}
function pointsToPath(points) {
  if (points.length === 0)
    return "M0,0";
  const parts = [`M${points[0].x},${points[0].y}`];
  for (let i = 1;i < points.length; i++) {
    parts.push(`L${points[i].x},${points[i].y}`);
  }
  return parts.join(" ");
}
