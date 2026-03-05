// @ts-check

/**
 * Repository module for manipulation.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { lighten, darken, saturate, desaturate, shiftHue } from "../src/manipulation/adjust.js";
import { interpolateColor, gradientFill, multiGradient } from "../src/manipulation/interpolate.js";
import { toOklch } from "../src/color-space/oklch.js";
describe("adjust", () => {
  test("lighten increases L", () => {
    const c = toOklch("#808080");
    const result = lighten(c, 0.1);
    expect(result.l).toBeCloseTo(c.l + 0.1, 3);
  });
  test("darken decreases L", () => {
    const c = toOklch("#808080");
    const result = darken(c, 0.1);
    expect(result.l).toBeCloseTo(c.l - 0.1, 3);
  });
  test("lighten clamps at 1", () => {
    const result = lighten("#ffffff", 0.5);
    expect(result.l).toBe(1);
  });
  test("darken clamps at 0", () => {
    const result = darken("#000000", 0.5);
    expect(result.l).toBe(0);
  });
  test("saturate increases chroma", () => {
    const c = toOklch("#808080");
    const result = saturate(c, 0.1);
    expect(result.c).toBeCloseTo(c.c + 0.1, 3);
  });
  test("desaturate decreases chroma", () => {
    const c = toOklch("#ff0000");
    const result = desaturate(c, 0.1);
    expect(result.c).toBeLessThan(c.c);
  });
  test("desaturate clamps at 0", () => {
    const result = desaturate("#808080", 1);
    expect(result.c).toBe(0);
  });
  test("shiftHue rotates hue", () => {
    const c = toOklch("#ff0000");
    const result = shiftHue(c, 120);
    expect(result.h).toBeCloseTo((c.h + 120) % 360, 1);
  });
  test("shiftHue wraps around 360", () => {
    const result = shiftHue({ l: 0.5, c: 0.15, h: 350, alpha: 1 }, 30);
    expect(result.h).toBeCloseTo(20, 1);
  });
  test("accepts string input", () => {
    const result = lighten("#ff0000", 0.1);
    expect(result.l).toBeGreaterThan(0);
  });
});
describe("interpolation", () => {
  test("OKLab interpolation at t=0 returns first color", () => {
    const c1 = toOklch("#ff0000");
    const c2 = toOklch("#0000ff");
    const result = interpolateColor(c1, c2, 0);
    expect(result.l).toBeCloseTo(c1.l, 3);
  });
  test("OKLab interpolation at t=1 returns second color", () => {
    const c1 = toOklch("#ff0000");
    const c2 = toOklch("#0000ff");
    const result = interpolateColor(c1, c2, 1);
    expect(result.l).toBeCloseTo(c2.l, 3);
  });
  test("midpoint is between the two colors in L", () => {
    const c1 = toOklch("#000000");
    const c2 = toOklch("#ffffff");
    const mid = interpolateColor(c1, c2, 0.5);
    expect(mid.l).toBeCloseTo(0.5, 1);
  });
  test("OKLCH interpolation uses shortest-path hue", () => {
    const c1 = { l: 0.5, c: 0.15, h: 350, alpha: 1 };
    const c2 = { l: 0.5, c: 0.15, h: 10, alpha: 1 };
    const mid = interpolateColor(c1, c2, 0.5, { space: "oklch" });
    expect(mid.h).toBeCloseTo(0, 0);
  });
  test("gradientFill returns correct number of steps", () => {
    const result = gradientFill("#ff0000", "#0000ff", 5);
    expect(result).toHaveLength(5);
  });
  test("gradientFill first and last match inputs", () => {
    const c1 = toOklch("#ff0000");
    const c2 = toOklch("#0000ff");
    const result = gradientFill(c1, c2, 5);
    expect(result[0].l).toBeCloseTo(c1.l, 3);
    expect(result[4].l).toBeCloseTo(c2.l, 3);
  });
  test("multiGradient with 3 colors", () => {
    const result = multiGradient(["#ff0000", "#00ff00", "#0000ff"], 9);
    expect(result.length).toBeGreaterThanOrEqual(5);
  });
});
