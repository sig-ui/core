// @ts-check

/**
 * Repository module for fluid max ratio.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { deriveFluidMaxRatio, fluidTypeScale } from "../src/typography/fluid.js";
describe("deriveFluidMaxRatio", () => {
  test("1.2^1.2 ≈ 1.2446", () => {
    const result = deriveFluidMaxRatio(1.2);
    expect(result).toBeCloseTo(1.2446, 3);
  });
  test("1.25^1.2 ≈ 1.3070", () => {
    const result = deriveFluidMaxRatio(1.25);
    expect(result).toBeCloseTo(1.307, 3);
  });
  test("1.0^1.2 = 1.0 (no scaling)", () => {
    const result = deriveFluidMaxRatio(1);
    expect(result).toBe(1);
  });
  test("1.333^1.2 (Perfect Fourth) produces > 1.333", () => {
    const result = deriveFluidMaxRatio(1.333);
    expect(result).toBeGreaterThan(1.333);
  });
  test("result is always >= input for ratios >= 1", () => {
    for (const ratio of [1, 1.1, 1.15, 1.2, 1.25, 1.333, 1.5]) {
      expect(deriveFluidMaxRatio(ratio)).toBeGreaterThanOrEqual(ratio);
    }
  });
});
describe("fluidTypeScale with scaleRatio", () => {
  test("scaleRatio derives maxRatio when maxRatio is absent", () => {
    const withScaleRatio = fluidTypeScale({ scaleRatio: 1.2 });
    const withDefaultMax = fluidTypeScale({ maxRatio: 1.2 });
    expect(withScaleRatio["5xl"]).not.toBe(withDefaultMax["5xl"]);
  });
  test("explicit maxRatio takes precedence over scaleRatio", () => {
    const withBoth = fluidTypeScale({ scaleRatio: 1.2, maxRatio: 1.3 });
    const withMaxOnly = fluidTypeScale({ maxRatio: 1.3 });
    expect(withBoth["5xl"]).toBe(withMaxOnly["5xl"]);
  });
  test("all scale steps are present", () => {
    const scale = fluidTypeScale({ scaleRatio: 1.25 });
    const expectedKeys = ["2xs", "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"];
    for (const key of expectedKeys) {
      expect(scale[key]).toBeDefined();
      expect(scale[key]).toContain("clamp(");
    }
  });
});
