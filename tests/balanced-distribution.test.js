// @ts-check

/**
 * Repository module for balanced distribution.test.
 * @module
 */
import { describe, test, expect } from "bun:test";
import {
  distributeSpacing,
  constraintsFromRelationships,
  distributeRelationshipSpacing,
  computeDistributionEnergy
} from "../src/spacing/balanced-distribution.js";
function sumGaps(result) {
  return result.gaps.reduce((s, g) => s + g.spacing, 0);
}
const TOLERANCE = 0.000000001;
describe("distributeSpacing – trivial cases", () => {
  test("empty gaps returns zero allocation", () => {
    const result = distributeSpacing({ totalAvailable: 100, gaps: [] });
    expect(result.gaps).toHaveLength(0);
    expect(result.totalAllocated).toBe(0);
    expect(result.residual).toBe(100);
    expect(result.energy).toBe(0);
    expect(result.feasible).toBe(true);
  });
  test("single gap gets full budget when within bounds", () => {
    const result = distributeSpacing({
      totalAvailable: 30,
      gaps: [{ preferred: 20, min: 10, max: 50 }]
    });
    expect(result.gaps).toHaveLength(1);
    expect(result.gaps[0].spacing).toBeCloseTo(30, 10);
    expect(result.totalAllocated).toBeCloseTo(30, 10);
    expect(result.residual).toBeCloseTo(0, 10);
    expect(result.feasible).toBe(true);
  });
  test("single gap clamped to min", () => {
    const result = distributeSpacing({
      totalAvailable: 5,
      gaps: [{ preferred: 20, min: 10, max: 50 }]
    });
    expect(result.feasible).toBe(false);
  });
  test("single gap clamped to max", () => {
    const result = distributeSpacing({
      totalAvailable: 100,
      gaps: [{ preferred: 20, min: 10, max: 50 }]
    });
    expect(result.feasible).toBe(false);
  });
  test("budget exactly matches sum of preferred", () => {
    const gaps = [
      { preferred: 10, min: 5, max: 20 },
      { preferred: 20, min: 10, max: 40 },
      { preferred: 30, min: 15, max: 60 }
    ];
    const result = distributeSpacing({ totalAvailable: 60, gaps });
    expect(result.feasible).toBe(true);
    expect(result.energy).toBeCloseTo(0, 10);
    for (let i = 0;i < 3; i++) {
      expect(result.gaps[i].spacing).toBeCloseTo(gaps[i].preferred, 10);
      expect(result.gaps[i].deviation).toBeCloseTo(0, 10);
      expect(result.gaps[i].clamped).toBe("none");
    }
    expect(result.totalAllocated).toBeCloseTo(60, 10);
    expect(result.residual).toBeCloseTo(0, 10);
  });
});
describe("distributeSpacing – unconstrained", () => {
  test("equal weights distribute residual evenly", () => {
    const gaps = [
      { preferred: 20, min: 0, max: 100, weight: 1 },
      { preferred: 20, min: 0, max: 100, weight: 1 },
      { preferred: 20, min: 0, max: 100, weight: 1 }
    ];
    const result = distributeSpacing({ totalAvailable: 90, gaps });
    expect(result.feasible).toBe(true);
    for (const g of result.gaps) {
      expect(g.spacing).toBeCloseTo(30, 10);
      expect(g.deviation).toBeCloseTo(10, 10);
    }
  });
  test("unequal weights distribute inversely proportional", () => {
    const gaps = [
      { preferred: 20, min: 0, max: 200, weight: 4 },
      { preferred: 20, min: 0, max: 200, weight: 1 }
    ];
    const result = distributeSpacing({ totalAvailable: 60, gaps });
    expect(result.gaps[0].spacing).toBeCloseTo(24, 10);
    expect(result.gaps[1].spacing).toBeCloseTo(36, 10);
    expect(result.totalAllocated).toBeCloseTo(60, 10);
  });
  test("high-weight gap deviates least", () => {
    const gaps = [
      { preferred: 30, min: 0, max: 200, weight: 100 },
      { preferred: 30, min: 0, max: 200, weight: 1 }
    ];
    const result = distributeSpacing({ totalAvailable: 80, gaps });
    expect(Math.abs(result.gaps[0].deviation)).toBeLessThan(1);
    expect(Math.abs(result.gaps[1].deviation)).toBeGreaterThan(15);
  });
  test("deficit with equal weights splits evenly", () => {
    const gaps = [
      { preferred: 40, min: 0, max: 100, weight: 1 },
      { preferred: 40, min: 0, max: 100, weight: 1 }
    ];
    const result = distributeSpacing({ totalAvailable: 60, gaps });
    expect(result.gaps[0].spacing).toBeCloseTo(30, 10);
    expect(result.gaps[1].spacing).toBeCloseTo(30, 10);
  });
  test("default weight is 1", () => {
    const gaps = [
      { preferred: 20, min: 0, max: 100 },
      { preferred: 20, min: 0, max: 100, weight: 1 }
    ];
    const result = distributeSpacing({ totalAvailable: 60, gaps });
    expect(result.gaps[0].spacing).toBeCloseTo(result.gaps[1].spacing, 10);
  });
});
describe("distributeSpacing – constrained", () => {
  test("gap hits min constraint", () => {
    const gaps = [
      { preferred: 50, min: 40, max: 80, weight: 1 },
      { preferred: 50, min: 40, max: 80, weight: 1 }
    ];
    const gaps2 = [
      { preferred: 30, min: 30, max: 60, weight: 1 },
      { preferred: 50, min: 10, max: 80, weight: 1 }
    ];
    const result = distributeSpacing({ totalAvailable: 50, gaps: gaps2 });
    expect(result.gaps[0].spacing).toBeCloseTo(30, 10);
    expect(result.gaps[0].clamped).toBe("min");
    expect(result.gaps[1].spacing).toBeCloseTo(20, 10);
    expect(result.totalAllocated).toBeCloseTo(50, 10);
  });
  test("gap hits max constraint", () => {
    const gaps = [
      { preferred: 20, min: 10, max: 25, weight: 1 },
      { preferred: 20, min: 10, max: 100, weight: 1 }
    ];
    const result = distributeSpacing({ totalAvailable: 80, gaps });
    expect(result.gaps[0].spacing).toBeCloseTo(25, 10);
    expect(result.gaps[0].clamped).toBe("max");
    expect(result.gaps[1].spacing).toBeCloseTo(55, 10);
    expect(result.totalAllocated).toBeCloseTo(80, 10);
  });
  test("mixed min and max clamping", () => {
    const gaps = [
      { preferred: 10, min: 10, max: 15, weight: 1 },
      { preferred: 30, min: 5, max: 30, weight: 1 },
      { preferred: 20, min: 5, max: 100, weight: 1 }
    ];
    const result = distributeSpacing({ totalAvailable: 100, gaps });
    expect(result.gaps[0].spacing).toBeCloseTo(15, 10);
    expect(result.gaps[0].clamped).toBe("max");
    expect(result.gaps[1].spacing).toBeCloseTo(30, 10);
    expect(result.gaps[1].clamped).toBe("max");
    expect(result.gaps[2].spacing).toBeCloseTo(55, 10);
    expect(result.gaps[2].clamped).toBe("none");
    expect(result.totalAllocated).toBeCloseTo(100, 10);
  });
  test("cascading clamp: first clamp frees budget that clamps another", () => {
    const gaps = [
      { preferred: 10, min: 10, max: 12, weight: 1 },
      { preferred: 10, min: 10, max: 12, weight: 1 },
      { preferred: 10, min: 10, max: 12, weight: 1 },
      { preferred: 10, min: 5, max: 100, weight: 1 }
    ];
    const gaps2 = [
      { preferred: 10, min: 5, max: 12, weight: 1 },
      { preferred: 10, min: 5, max: 12, weight: 1 },
      { preferred: 10, min: 5, max: 100, weight: 1 }
    ];
    const result = distributeSpacing({ totalAvailable: 20, gaps: gaps2 });
    expect(result.feasible).toBe(true);
    expect(result.totalAllocated).toBeCloseTo(20, 10);
  });
});
describe("distributeSpacing – infeasibility", () => {
  test("budget below sum of mins", () => {
    const gaps = [
      { preferred: 20, min: 15, max: 40 },
      { preferred: 20, min: 15, max: 40 }
    ];
    const result = distributeSpacing({ totalAvailable: 20, gaps });
    expect(result.feasible).toBe(false);
    expect(result.totalAllocated).toBeCloseTo(20, 10);
    expect(result.residual).toBeCloseTo(0, 10);
  });
  test("budget above sum of maxes", () => {
    const gaps = [
      { preferred: 20, min: 10, max: 30 },
      { preferred: 20, min: 10, max: 30 }
    ];
    const result = distributeSpacing({ totalAvailable: 100, gaps });
    expect(result.feasible).toBe(false);
    expect(result.totalAllocated).toBeCloseTo(100, 10);
  });
  test("infeasible with unequal weights distributes deficit by inverse weight", () => {
    const gaps = [
      { preferred: 30, min: 20, max: 50, weight: 4 },
      { preferred: 30, min: 20, max: 50, weight: 1 }
    ];
    const result = distributeSpacing({ totalAvailable: 30, gaps });
    expect(result.feasible).toBe(false);
    expect(Math.abs(result.gaps[0].spacing - 20)).toBeLessThan(Math.abs(result.gaps[1].spacing - 20));
    expect(result.totalAllocated).toBeCloseTo(30, 10);
  });
});
describe("distributeSpacing – energy", () => {
  test("energy is zero when preferred satisfies budget", () => {
    const gaps = [
      { preferred: 25, min: 10, max: 50 },
      { preferred: 25, min: 10, max: 50 }
    ];
    const result = distributeSpacing({ totalAvailable: 50, gaps });
    expect(result.energy).toBeCloseTo(0, 10);
  });
  test("energy increases with deviation", () => {
    const gaps = [
      { preferred: 20, min: 0, max: 100 },
      { preferred: 20, min: 0, max: 100 }
    ];
    const r1 = distributeSpacing({ totalAvailable: 42, gaps });
    const r2 = distributeSpacing({ totalAvailable: 60, gaps });
    expect(r2.energy).toBeGreaterThan(r1.energy);
  });
  test("weight amplifies energy", () => {
    const gapsLow = [
      { preferred: 20, min: 0, max: 100, weight: 1 }
    ];
    const gapsHigh = [
      { preferred: 20, min: 0, max: 100, weight: 10 }
    ];
    const rLow = distributeSpacing({ totalAvailable: 30, gaps: gapsLow });
    const rHigh = distributeSpacing({ totalAvailable: 30, gaps: gapsHigh });
    expect(rHigh.energy).toBeCloseTo(rLow.energy * 10, 8);
  });
});
describe("distributeSpacing – budget conservation", () => {
  test("totalAllocated equals totalAvailable for feasible cases", () => {
    const gaps = [
      { preferred: 10, min: 5, max: 30 },
      { preferred: 20, min: 10, max: 50 },
      { preferred: 15, min: 8, max: 40 }
    ];
    const result = distributeSpacing({ totalAvailable: 60, gaps });
    expect(result.totalAllocated).toBeCloseTo(60, 10);
    expect(result.residual).toBeCloseTo(0, 10);
    expect(sumGaps(result)).toBeCloseTo(60, 10);
  });
  test("totalAllocated equals totalAvailable for infeasible cases", () => {
    const gaps = [
      { preferred: 20, min: 15, max: 40 },
      { preferred: 20, min: 15, max: 40 }
    ];
    const result = distributeSpacing({ totalAvailable: 20, gaps });
    expect(result.totalAllocated).toBeCloseTo(20, 10);
  });
  test("sum of gap spacings equals totalAllocated", () => {
    const gaps = [
      { preferred: 12, min: 4, max: 30, weight: 2 },
      { preferred: 24, min: 12, max: 48, weight: 1 },
      { preferred: 16, min: 8, max: 32, weight: 3 }
    ];
    const result = distributeSpacing({ totalAvailable: 70, gaps });
    const sum = result.gaps.reduce((s, g) => s + g.spacing, 0);
    expect(sum).toBeCloseTo(result.totalAllocated, 10);
  });
});
describe("distributeSpacing – snap", () => {
  test("results are multiples of snapUnit", () => {
    const gaps = [
      { preferred: 13, min: 4, max: 40 },
      { preferred: 22, min: 8, max: 50 },
      { preferred: 17, min: 4, max: 40 }
    ];
    const result = distributeSpacing({
      totalAvailable: 60,
      gaps,
      snapUnit: 4
    });
    for (const g of result.gaps) {
      expect(g.spacing % 4).toBeCloseTo(0, 10);
    }
  });
  test("snapped budget approximately conserved", () => {
    const gaps = [
      { preferred: 10, min: 4, max: 30 },
      { preferred: 15, min: 4, max: 40 },
      { preferred: 20, min: 8, max: 50 }
    ];
    const result = distributeSpacing({
      totalAvailable: 52,
      gaps,
      snapUnit: 4
    });
    expect(Math.abs(result.totalAllocated - 52)).toBeLessThanOrEqual(4);
  });
  test("snap with 8px grid", () => {
    const gaps = [
      { preferred: 16, min: 8, max: 48 },
      { preferred: 24, min: 8, max: 56 }
    ];
    const result = distributeSpacing({
      totalAvailable: 48,
      gaps,
      snapUnit: 8
    });
    for (const g of result.gaps) {
      expect(g.spacing % 8).toBeCloseTo(0, 10);
    }
    expect(Math.abs(result.totalAllocated - 48)).toBeLessThanOrEqual(8);
  });
});
describe("distributeSpacing – density", () => {
  test("density 0.75 produces compact gaps", () => {
    const gaps = [
      { preferred: 20, min: 10, max: 40 },
      { preferred: 20, min: 10, max: 40 }
    ];
    const normal = distributeSpacing({ totalAvailable: 40, gaps, density: 1 });
    const compact = distributeSpacing({ totalAvailable: 40, gaps, density: 0.75 });
    expect(compact.energy).toBeGreaterThan(normal.energy);
  });
  test("density 1.5 produces spacious gaps (wider preferred)", () => {
    const gaps = [
      { preferred: 20, min: 10, max: 40 },
      { preferred: 20, min: 10, max: 40 }
    ];
    const spacious = distributeSpacing({ totalAvailable: 60, gaps, density: 1.5 });
    expect(spacious.energy).toBeCloseTo(0, 10);
    expect(spacious.gaps[0].spacing).toBeCloseTo(30, 10);
    expect(spacious.gaps[1].spacing).toBeCloseTo(30, 10);
  });
  test("density scales min and max", () => {
    const gaps = [
      { preferred: 20, min: 10, max: 30 }
    ];
    const result = distributeSpacing({ totalAvailable: 50, gaps, density: 2 });
    expect(result.feasible).toBe(true);
    expect(result.gaps[0].spacing).toBeCloseTo(50, 10);
  });
});
describe("constraintsFromRelationships", () => {
  test("maps relationship tiers correctly", () => {
    const constraints = constraintsFromRelationships(["related", "grouped", "separated", "distinct"]);
    expect(constraints).toHaveLength(4);
    expect(constraints[0]).toMatchObject({ preferred: 4, min: 4, max: 8, label: "related" });
    expect(constraints[1]).toMatchObject({ preferred: 16, min: 12, max: 16, label: "grouped" });
    expect(constraints[2]).toMatchObject({ preferred: 24, min: 24, max: 32, label: "separated" });
    expect(constraints[3]).toMatchObject({ preferred: 48, min: 48, max: 64, label: "distinct" });
  });
  test("applies weight overrides", () => {
    const constraints = constraintsFromRelationships(["related", "grouped"], { weights: [3, 5] });
    expect(constraints[0].weight).toBe(3);
    expect(constraints[1].weight).toBe(5);
  });
  test("weight is undefined when not provided", () => {
    const constraints = constraintsFromRelationships(["related"]);
    expect(constraints[0].weight).toBeUndefined();
  });
});
describe("distributeRelationshipSpacing", () => {
  test("nav bar: three related gaps", () => {
    const result = distributeRelationshipSpacing(["related", "related", "related"], 18);
    expect(result.feasible).toBe(true);
    expect(result.totalAllocated).toBeCloseTo(18, 10);
    for (const g of result.gaps) {
      expect(g.spacing).toBeCloseTo(6, 10);
    }
  });
  test("sidebar + content: separated + distinct", () => {
    const result = distributeRelationshipSpacing(["separated", "distinct"], 80);
    expect(result.feasible).toBe(true);
    expect(result.totalAllocated).toBeCloseTo(80, 10);
    expect(result.gaps[0].spacing).toBeCloseTo(28, 10);
    expect(result.gaps[1].spacing).toBeCloseTo(52, 10);
  });
  test("form groups: grouped + grouped + separated", () => {
    const result = distributeRelationshipSpacing(["grouped", "grouped", "separated"], 56);
    expect(result.feasible).toBe(true);
    expect(result.totalAllocated).toBeCloseTo(56, 10);
  });
  test("with density and snapUnit", () => {
    const result = distributeRelationshipSpacing(["related", "grouped"], 30, { density: 0.85, snapUnit: 4 });
    for (const g of result.gaps) {
      expect(g.spacing % 4).toBeCloseTo(0, 10);
    }
  });
  test("with custom weights", () => {
    const result = distributeRelationshipSpacing(["related", "distinct"], 60, { weights: [10, 1] });
    expect(result.feasible).toBe(true);
    expect(result.totalAllocated).toBeCloseTo(60, 10);
    expect(Math.abs(result.gaps[0].deviation)).toBeLessThan(Math.abs(result.gaps[1].deviation));
  });
});
describe("computeDistributionEnergy", () => {
  test("zero at preferred", () => {
    const gaps = [
      { preferred: 10, min: 5, max: 20 },
      { preferred: 20, min: 10, max: 40 }
    ];
    expect(computeDistributionEnergy(gaps, [10, 20])).toBe(0);
  });
  test("positive for any deviation", () => {
    const gaps = [
      { preferred: 10, min: 5, max: 20 }
    ];
    expect(computeDistributionEnergy(gaps, [12])).toBeGreaterThan(0);
    expect(computeDistributionEnergy(gaps, [8])).toBeGreaterThan(0);
  });
  test("correct formula: w * (actual - preferred)^2", () => {
    const gaps = [
      { preferred: 16, min: 12, max: 24, weight: 2 }
    ];
    expect(computeDistributionEnergy(gaps, [20])).toBeCloseTo(32, 10);
  });
  test("weight amplification", () => {
    const gapsW1 = [
      { preferred: 10, min: 0, max: 100, weight: 1 }
    ];
    const gapsW5 = [
      { preferred: 10, min: 0, max: 100, weight: 5 }
    ];
    const e1 = computeDistributionEnergy(gapsW1, [15]);
    const e5 = computeDistributionEnergy(gapsW5, [15]);
    expect(e5).toBeCloseTo(e1 * 5, 10);
  });
  test("multi-gap energy sums", () => {
    const gaps = [
      { preferred: 10, min: 0, max: 50, weight: 1 },
      { preferred: 20, min: 0, max: 50, weight: 2 }
    ];
    expect(computeDistributionEnergy(gaps, [15, 25])).toBeCloseTo(75, 10);
  });
  test("default weight is 1", () => {
    const gaps = [
      { preferred: 10, min: 0, max: 50 }
    ];
    expect(computeDistributionEnergy(gaps, [15])).toBeCloseTo(25, 10);
  });
});
describe("distributeSpacing – labels", () => {
  test("labels pass through to result", () => {
    const gaps = [
      { preferred: 10, min: 5, max: 20, label: "header-gap" },
      { preferred: 10, min: 5, max: 20, label: "content-gap" }
    ];
    const result = distributeSpacing({ totalAvailable: 20, gaps });
    expect(result.gaps[0].label).toBe("header-gap");
    expect(result.gaps[1].label).toBe("content-gap");
  });
  test("undefined labels pass through as undefined", () => {
    const gaps = [
      { preferred: 10, min: 5, max: 20 }
    ];
    const result = distributeSpacing({ totalAvailable: 10, gaps });
    expect(result.gaps[0].label).toBeUndefined();
  });
});
describe("distributeSpacing – edge cases", () => {
  test("all gaps identical", () => {
    const gap = { preferred: 16, min: 8, max: 32 };
    const result = distributeSpacing({
      totalAvailable: 80,
      gaps: [gap, gap, gap, gap, gap]
    });
    expect(result.energy).toBeCloseTo(0, 10);
    for (const g of result.gaps) {
      expect(g.spacing).toBeCloseTo(16, 10);
    }
  });
  test("zero budget with zero mins", () => {
    const gaps = [
      { preferred: 10, min: 0, max: 20 },
      { preferred: 10, min: 0, max: 20 }
    ];
    const result = distributeSpacing({ totalAvailable: 0, gaps });
    expect(result.feasible).toBe(true);
    expect(result.totalAllocated).toBeCloseTo(0, 10);
  });
  test("very large N (10 gaps)", () => {
    const gaps = Array.from({ length: 10 }, (_, i) => ({
      preferred: 10 + i,
      min: 5,
      max: 50,
      weight: 1 + i * 0.5
    }));
    const sumPref = gaps.reduce((s, g) => s + g.preferred, 0);
    const result = distributeSpacing({ totalAvailable: sumPref + 20, gaps });
    expect(result.feasible).toBe(true);
    expect(result.totalAllocated).toBeCloseTo(sumPref + 20, 8);
  });
});
