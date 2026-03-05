// @ts-check

/**
 * Repository module for optical spacing.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  opticalSpacingMultiplier,
  opticalSpacingFluid
} from "../src/spacing/optical-spacing.js";
describe("opticalSpacingMultiplier", () => {
  test("at 320px viewport → multiplier = 1.2", () => {
    expect(opticalSpacingMultiplier(320)).toBeCloseTo(1.2, 4);
  });
  test("at 1440px viewport → multiplier = 1.0", () => {
    expect(opticalSpacingMultiplier(1440)).toBeCloseTo(1, 4);
  });
  test("at min viewport → 1.2 (below range is clamped)", () => {
    expect(opticalSpacingMultiplier(200)).toBeCloseTo(1.2, 4);
  });
  test("at max viewport → 1.0 (above range is clamped)", () => {
    expect(opticalSpacingMultiplier(2000)).toBeCloseTo(1, 4);
  });
  test("mid-range interpolation (880px = midpoint)", () => {
    expect(opticalSpacingMultiplier(880)).toBeCloseTo(1.1, 4);
  });
  test("result is always in [1.0, 1.2]", () => {
    for (const vw of [0, 100, 320, 500, 880, 1200, 1440, 2000, 5000]) {
      const m = opticalSpacingMultiplier(vw);
      expect(m).toBeGreaterThanOrEqual(1);
      expect(m).toBeLessThanOrEqual(1.2);
    }
  });
  test("monotonically decreasing as viewport increases", () => {
    const viewports = [320, 500, 700, 900, 1100, 1300, 1440];
    for (let i = 1;i < viewports.length; i++) {
      expect(opticalSpacingMultiplier(viewports[i])).toBeLessThanOrEqual(opticalSpacingMultiplier(viewports[i - 1]));
    }
  });
  test("custom viewport range", () => {
    const opts = { minVw: 400, maxVw: 1200 };
    expect(opticalSpacingMultiplier(400, opts)).toBeCloseTo(1.2, 4);
    expect(opticalSpacingMultiplier(1200, opts)).toBeCloseTo(1, 4);
    expect(opticalSpacingMultiplier(800, opts)).toBeCloseTo(1.1, 4);
  });
});
describe("opticalSpacingFluid", () => {
  test("returns a CSS clamp() expression", () => {
    const result = opticalSpacingFluid();
    expect(result).toContain("clamp(");
    expect(result).toContain("1");
    expect(result).toContain("1.2");
    expect(result).toContain("vw");
  });
  test("custom viewport range is reflected", () => {
    const result = opticalSpacingFluid({ minVw: 400, maxVw: 1200 });
    expect(result).toContain("clamp(");
  });
});
