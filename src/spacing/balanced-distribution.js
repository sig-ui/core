// @ts-check

/**
 * SigUI core spacing module for balanced distribution.
 * @module
 */
import { getRelationshipSpacing } from "./relationship.js";
function applyDensity(constraint, density) {
  return {
    preferred: constraint.preferred * density,
    min: constraint.min * density,
    max: constraint.max * density,
    weight: constraint.weight,
    label: constraint.label
  };
}
function computeEnergy(gaps, values) {
  let energy = 0;
  for (let i = 0;i < gaps.length; i++) {
    const w = gaps[i].weight ?? 1;
    const d = values[i] - gaps[i].preferred;
    energy += w * d * d;
  }
  return energy;
}
/**
 * distributeSpacing.
 * @param {DistributeSpacingOptions} options
 * @returns {DistributionResult}
 */
export function distributeSpacing(options) {
  const { totalAvailable, gaps: rawGaps, density = 1, snapUnit = 0 } = options;
  if (rawGaps.length === 0) {
    return {
      gaps: [],
      totalAllocated: 0,
      residual: totalAvailable,
      energy: 0,
      feasible: true
    };
  }
  const gaps = rawGaps.map((g) => applyDensity(g, density));
  const n = gaps.length;
  let sumMin = 0;
  let sumMax = 0;
  for (let i = 0;i < n; i++) {
    sumMin += gaps[i].min;
    sumMax += gaps[i].max;
  }
  const feasible = totalAvailable >= sumMin && totalAvailable <= sumMax;
  const values = new Float64Array(n);
  const clamped = new Int8Array(n);
  if (!feasible) {
    if (totalAvailable < sumMin) {
      for (let i = 0;i < n; i++)
        values[i] = gaps[i].min;
      const deficit = totalAvailable - sumMin;
      let totalInvW = 0;
      for (let i = 0;i < n; i++)
        totalInvW += 1 / (gaps[i].weight ?? 1);
      for (let i = 0;i < n; i++) {
        const share = deficit * (1 / (gaps[i].weight ?? 1)) / totalInvW;
        values[i] += share;
        clamped[i] = 1;
      }
    } else {
      for (let i = 0;i < n; i++)
        values[i] = gaps[i].max;
      const surplus = totalAvailable - sumMax;
      let totalInvW = 0;
      for (let i = 0;i < n; i++)
        totalInvW += 1 / (gaps[i].weight ?? 1);
      for (let i = 0;i < n; i++) {
        const share = surplus * (1 / (gaps[i].weight ?? 1)) / totalInvW;
        values[i] += share;
        clamped[i] = 2;
      }
    }
  } else {
    for (let i = 0;i < n; i++)
      clamped[i] = 0;
    for (let iter = 0;iter < n; iter++) {
      let clampedSum = 0;
      let freeInvWSum = 0;
      let freePrefWSum = 0;
      for (let i = 0;i < n; i++) {
        if (clamped[i] !== 0) {
          clampedSum += values[i];
        } else {
          const invW = 1 / (gaps[i].weight ?? 1);
          freeInvWSum += invW;
          freePrefWSum += gaps[i].preferred;
        }
      }
      const freeBudget = totalAvailable - clampedSum;
      const residual = freeBudget - freePrefWSum;
      let newClamp = false;
      for (let i = 0;i < n; i++) {
        if (clamped[i] !== 0)
          continue;
        const invW = 1 / (gaps[i].weight ?? 1);
        const s = gaps[i].preferred + residual * invW / freeInvWSum;
        if (s < gaps[i].min) {
          values[i] = gaps[i].min;
          clamped[i] = 1;
          newClamp = true;
        } else if (s > gaps[i].max) {
          values[i] = gaps[i].max;
          clamped[i] = 2;
          newClamp = true;
        } else {
          values[i] = s;
        }
      }
      if (!newClamp)
        break;
    }
  }
  if (snapUnit > 0) {
    for (let i = 0;i < n; i++) {
      values[i] = Math.round(values[i] / snapUnit) * snapUnit;
    }
    let allocated = 0;
    for (let i = 0;i < n; i++)
      allocated += values[i];
    let snapResidual = totalAvailable - allocated;
    let snapIter = 0;
    const maxSnapIter = n * 2;
    while (Math.abs(snapResidual) > snapUnit * 0.5 && snapIter < maxSnapIter) {
      snapIter++;
      const direction = snapResidual > 0 ? 1 : -1;
      let bestIdx = -1;
      let bestScore = -1 / 0;
      for (let i = 0;i < n; i++) {
        const dev = Math.abs(values[i] - gaps[i].preferred);
        const newVal = values[i] + direction * snapUnit;
        if (newVal >= gaps[i].min - snapUnit * 0.01 && newVal <= gaps[i].max + snapUnit * 0.01) {
          const newDev = Math.abs(newVal - gaps[i].preferred);
          const score = dev - newDev + dev * 0.001;
          if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
          }
        }
      }
      if (bestIdx === -1) {
        for (let i = 0;i < n; i++) {
          const newVal = values[i] + direction * snapUnit;
          if (newVal >= 0) {
            bestIdx = i;
            break;
          }
        }
        if (bestIdx === -1)
          break;
      }
      values[bestIdx] += direction * snapUnit;
      snapResidual -= direction * snapUnit;
    }
  }
  let totalAllocated = 0;
  const resultGaps = [];
  for (let i = 0;i < n; i++) {
    const spacing = values[i];
    totalAllocated += spacing;
    resultGaps.push({
      spacing,
      deviation: spacing - gaps[i].preferred,
      clamped: clamped[i] === 1 ? "min" : clamped[i] === 2 ? "max" : "none",
      label: gaps[i].label
    });
  }
  return {
    gaps: resultGaps,
    totalAllocated,
    residual: totalAvailable - totalAllocated,
    energy: computeEnergy(gaps, Array.from(values)),
    feasible
  };
}
/**
 * constraintsFromRelationships.
 * @param {readonly SpacingRelationship[]} tiers
 * @param {{ weights?: readonly number[] }} options
 * @returns {SpacingConstraint[]}
 */
export function constraintsFromRelationships(tiers, options) {
  return tiers.map((tier, i) => {
    const range = getRelationshipSpacing(tier);
    return {
      preferred: range.default,
      min: range.min,
      max: range.max,
      weight: options?.weights?.[i],
      label: tier
    };
  });
}
/**
 * distributeRelationshipSpacing.
 * @param {readonly SpacingRelationship[]} tiers
 * @param {number} availableSpace
 * @param {{ density?: number; weights?: readonly number[]; snapUnit?: number }} options
 * @returns {DistributionResult}
 */
export function distributeRelationshipSpacing(tiers, availableSpace, options) {
  const constraints = constraintsFromRelationships(tiers, {
    weights: options?.weights
  });
  return distributeSpacing({
    totalAvailable: availableSpace,
    gaps: constraints,
    density: options?.density,
    snapUnit: options?.snapUnit
  });
}
/**
 * computeDistributionEnergy.
 * @param {readonly SpacingConstraint[]} gaps
 * @param {readonly number[]} actual
 * @returns {number}
 */
export function computeDistributionEnergy(gaps, actual) {
  return computeEnergy(gaps, actual);
}
