// @ts-check

/**
 * SigUI core motion module for spring.
 * @module
 */
/**
 * getSpringPresets.
 * @param {Partial<Record<string, { stiffness: number; damping: number; mass: number }>>} overrides
 * @returns {SpringPresets}
 */
export function getSpringPresets(overrides) {
  const base = {
    snappy: { stiffness: 300, damping: 30, mass: 0.8 },
    default: { stiffness: 200, damping: 20, mass: 1 },
    gentle: { stiffness: 120, damping: 14, mass: 1 },
    bouncy: { stiffness: 200, damping: 10, mass: 1 }
  };
  if (!overrides)
    return base;
  for (const [name, config] of Object.entries(overrides)) {
    if (name in base) {
      base[name] = config;
    }
  }
  return base;
}
function classifyDamping(config) {
  const { stiffness, damping, mass } = config;
  const criticalDamping = 2 * Math.sqrt(stiffness * mass);
  const ratio = damping / criticalDamping;
  if (Math.abs(ratio - 1) < 0.001)
    return "critically";
  if (ratio > 1)
    return "overdamped";
  return "underdamped";
}
/**
 * computeSpringDuration.
 * @param {SpringConfig} config
 * @returns {number}
 */
export function computeSpringDuration(config) {
  const { stiffness, damping, mass } = config;
  const omega0 = Math.sqrt(stiffness / mass);
  const criticalDamping = 2 * Math.sqrt(stiffness * mass);
  const zeta = damping / criticalDamping;
  const threshold = 0.01;
  const lnThreshold = Math.log(threshold);
  const regime = classifyDamping(config);
  let settlingTimeSec;
  if (regime === "underdamped") {
    settlingTimeSec = -lnThreshold / (zeta * omega0);
  } else if (regime === "critically") {
    settlingTimeSec = 4.75 / omega0;
  } else {
    const slowDecay = omega0 * (zeta - Math.sqrt(zeta * zeta - 1));
    settlingTimeSec = -lnThreshold / slowDecay;
  }
  const ms = settlingTimeSec * 1000;
  return Math.min(Math.round(ms), 2000);
}
/**
 * springToLinear.
 * @param {SpringConfig} config
 * @param {number} numSamples
 * @returns {string}
 */
export function springToLinear(config, numSamples = 64) {
  const { stiffness, damping, mass } = config;
  const omega0 = Math.sqrt(stiffness / mass);
  const criticalDamping = 2 * Math.sqrt(stiffness * mass);
  const zeta = damping / criticalDamping;
  const settlingTimeSec = computeSpringDuration(config) / 1000;
  const totalTime = settlingTimeSec * 1.2;
  const samples = [];
  for (let i = 0;i < numSamples; i++) {
    const t = i / (numSamples - 1) * totalTime;
    let x;
    if (zeta < 1 - 0.000001) {
      const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
      const decay = Math.exp(-zeta * omega0 * t);
      x = 1 - decay * (Math.cos(omegaD * t) + zeta * omega0 / omegaD * Math.sin(omegaD * t));
    } else if (zeta > 1 + 0.000001) {
      const alpha = omega0 * (zeta + Math.sqrt(zeta * zeta - 1));
      const beta = omega0 * (zeta - Math.sqrt(zeta * zeta - 1));
      const A = alpha / (alpha - beta);
      const B = 1 - A;
      x = 1 - A * Math.exp(-beta * t) - B * Math.exp(-alpha * t);
    } else {
      const decay = Math.exp(-omega0 * t);
      x = 1 - decay * (1 + omega0 * t);
    }
    samples.push(Math.round(x * 1000) / 1000);
  }
  while (samples.length > 2) {
    const last = samples[samples.length - 1];
    const secondLast = samples[samples.length - 2];
    if (last !== undefined && secondLast !== undefined && Math.abs(last - 1) < 0.0005 && Math.abs(secondLast - 1) < 0.0005) {
      samples.pop();
    } else {
      break;
    }
  }
  return `linear(${samples.join(", ")})`;
}
/**
 * sampleLinearEasing.
 * @param {string} cssLinear
 * @param {number} t
 * @returns {number}
 */
export function sampleLinearEasing(cssLinear, t) {
  const inner = cssLinear.slice(cssLinear.indexOf("(") + 1, cssLinear.lastIndexOf(")"));
  const values = inner.split(",").map((s) => parseFloat(s.trim()));
  if (values.length < 2)
    return t;
  const clamped = Math.max(0, Math.min(1, t));
  const maxIdx = values.length - 1;
  const scaled = clamped * maxIdx;
  const lo = Math.floor(scaled);
  const hi = Math.min(lo + 1, maxIdx);
  const frac = scaled - lo;
  return values[lo] + (values[hi] - values[lo]) * frac;
}
