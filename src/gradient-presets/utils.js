// @ts-check

/**
 * SigUI core gradient presets module for utils.
 * @module
 */
/**
 * opacityFromIntensity.
 * @param {number} intensity
 * @param {number} scale
 * @returns {string}
 */
export function opacityFromIntensity(intensity, scale = 1) {
  const pct = Math.round(Math.min(100, Math.max(1, intensity)) * scale);
  return `${pct}%`;
}
/**
 * mix.
 * @param {string} color
 * @param {string} opacity
 * @returns {string}
 */
export function mix(color, opacity) {
  return `color-mix(in oklch, ${color} ${opacity}, transparent)`;
}
/**
 * mixLightness.
 * @param {string} color
 * @param {"white" | "black"} target
 * @param {string} amount
 * @returns {string}
 */
export function mixLightness(color, target, amount) {
  return `color-mix(in oklch, ${color} ${amount}, ${target})`;
}
/**
 * neutralVariants.
 * @param {readonly string[]} colors
 * @param {number} intensity
 * @returns {string[]}
 */
export function neutralVariants(colors, intensity) {
  const n = colors.length;
  if (n === 1)
    return [colors[0]];
  return colors.map((c, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const lightAmount = Math.round(30 + t * 40);
    const target = t < 0.5 ? "white" : "black";
    const mixPct = `${100 - lightAmount}%`;
    return mixLightness(c, target, mixPct);
  });
}
/**
 * fillToArity.
 * @template T
 * @param {readonly T[]} arr
 * @param {number} arity
 * @returns {T[]}
 */
export function fillToArity(arr, arity) {
  if (arr.length >= arity)
    return arr.slice(0, arity);
  const last = arr[arr.length - 1];
  return [...arr, ...Array(arity - arr.length).fill(last)];
}
/**
 * defaultPositions.
 * @param {number} count
 * @returns {Position2D[]}
 */
export function defaultPositions(count) {
  if (count === 1)
    return [{ x: 50, y: 50 }];
  if (count === 2)
    return [{ x: 30, y: 30 }, { x: 70, y: 70 }];
  if (count === 3)
    return [{ x: 20, y: 30 }, { x: 80, y: 70 }, { x: 50, y: 90 }];
  return Array.from({ length: count }, (_, i) => {
    const angle = i / count * Math.PI * 2 - Math.PI / 2;
    return {
      x: Math.round(50 + 30 * Math.cos(angle)),
      y: Math.round(50 + 30 * Math.sin(angle))
    };
  });
}
