// @ts-check

/**
 * SigUI core runtime module for spacing.
 * @module
 */
const baseUnitCache = new WeakMap;
/**
 * readBaseUnit.
 * @param {Element} element
 * @returns {number}
 */
export function readBaseUnit(element) {
  const now = typeof performance !== "undefined" ? performance.now() : 0;
  const frame = Math.floor(now / 16);
  const root = typeof document !== "undefined" ? element ?? document.documentElement : null;
  if (!root)
    return 4;
  const cached = baseUnitCache.get(root);
  if (cached && cached.frame === frame)
    return cached.value;
  const raw = getComputedStyle(root).getPropertyValue("--sg-base-unit").trim();
  let value = 4;
  if (raw) {
    const parsed = parseFloat(raw);
    if (!Number.isNaN(parsed)) {
      value = raw.endsWith("rem") ? parsed * 16 : parsed;
    }
  }
  baseUnitCache.set(root, { value, frame });
  return value;
}
