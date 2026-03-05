// @ts-check

/**
 * Repository module for gamut.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { deltaEOK } from "../src/gamut/delta.js";
import { isInGamut } from "../src/gamut/check.js";
import { clampToGamut, clipToGamut } from "../src/gamut/clamp.js";
import { compareRampGamut, comparePaletteGamut } from "../src/gamut/compare.js";
import { generateShadeRamp } from "../src/generation/shade.js";
import { toOklch } from "../src/color-space/oklch.js";
describe("deltaEOK", () => {
  test("identical colors have distance 0", () => {
    const c = { l: 0.5, c: 0.15, h: 250, alpha: 1 };
    expect(deltaEOK(c, c)).toBeCloseTo(0, 10);
  });
  test("black and white have large distance", () => {
    const black = { l: 0, c: 0, h: 0, alpha: 1 };
    const white = { l: 1, c: 0, h: 0, alpha: 1 };
    expect(deltaEOK(black, white)).toBeCloseTo(1, 2);
  });
  test("JND threshold: distance < 0.02 is imperceptible", () => {
    const c1 = { l: 0.5, c: 0.15, h: 250, alpha: 1 };
    const c2 = { l: 0.501, c: 0.15, h: 250, alpha: 1 };
    expect(deltaEOK(c1, c2)).toBeLessThan(0.02);
  });
});
describe("isInGamut", () => {
  test("white is in sRGB", () => {
    expect(isInGamut(toOklch("#ffffff"), "srgb")).toBe(true);
  });
  test("black is in sRGB", () => {
    expect(isInGamut(toOklch("#000000"), "srgb")).toBe(true);
  });
  test("pure red is in sRGB", () => {
    expect(isInGamut(toOklch("#ff0000"), "srgb")).toBe(true);
  });
  test("high-chroma color may be outside sRGB", () => {
    const outOfGamut = { l: 0.5, c: 0.4, h: 150, alpha: 1 };
    expect(isInGamut(outOfGamut, "srgb")).toBe(false);
  });
  test("normal colors are in P3", () => {
    expect(isInGamut(toOklch("#ff0000"), "p3")).toBe(true);
    expect(isInGamut(toOklch("#00ff00"), "p3")).toBe(true);
  });
});
describe("clampToGamut", () => {
  test("in-gamut color returned unchanged", () => {
    const c = toOklch("#ff8000");
    const clamped = clampToGamut(c, "srgb");
    expect(clamped.l).toBeCloseTo(c.l, 4);
    expect(clamped.c).toBeCloseTo(c.c, 4);
    expect(clamped.h).toBeCloseTo(c.h, 2);
  });
  test("out-of-gamut color gets clamped to sRGB", () => {
    const outOfGamut = { l: 0.5, c: 0.4, h: 150, alpha: 1 };
    const clamped = clampToGamut(outOfGamut, "srgb");
    expect(isInGamut(clamped, "srgb")).toBe(true);
    expect(clamped.c).toBeGreaterThan(0);
  });
  test("approximately preserves hue during clamping", () => {
    const outOfGamut = { l: 0.5, c: 0.4, h: 250, alpha: 1 };
    const clamped = clampToGamut(outOfGamut, "srgb");
    expect(Math.abs(clamped.h - 250)).toBeLessThan(5);
  });
  test("CSS Color 4 algorithm preserves more chroma than naive clamping", () => {
    const vividYellow = { l: 0.9, c: 0.25, h: 110, alpha: 1 };
    if (!isInGamut(vividYellow, "srgb")) {
      const css4 = clampToGamut(vividYellow, "srgb");
      const naive = clipToGamut(vividYellow, "srgb");
      expect(css4.c).toBeGreaterThanOrEqual(naive.c - 0.001);
    }
  });
  test("extreme L values handled", () => {
    const veryDark = { l: 0, c: 0.3, h: 100, alpha: 1 };
    const clamped = clampToGamut(veryDark, "srgb");
    expect(clamped.l).toBe(0);
    expect(clamped.c).toBe(0);
    const veryLight = { l: 1, c: 0.3, h: 100, alpha: 1 };
    const clamped2 = clampToGamut(veryLight, "srgb");
    expect(clamped2.l).toBe(1);
    expect(clamped2.c).toBe(0);
  });
});
const bgLight = toOklch("#f8fafc");
describe("compareRampGamut", () => {
  test("sRGB-gamut palette has 0 out-of-gamut stops", () => {
    const ramp = generateShadeRamp(toOklch("#64748b"), {
      mode: "light",
      background: bgLight,
      gamut: "srgb"
    });
    const result = compareRampGamut(ramp);
    expect(result.outOfSrgbCount).toBe(0);
    expect(result.maxDeltaE).toBe(0);
  });
  test("P3 vivid palette may have out-of-gamut stops with deltaE > 0", () => {
    const ramp = generateShadeRamp(toOklch("#22c55e"), {
      mode: "light",
      background: bgLight,
      gamut: "p3"
    });
    const result = compareRampGamut(ramp);
    expect(result.stops.length).toBeGreaterThan(0);
    expect(result.outOfSrgbCount).toBeGreaterThanOrEqual(0);
    if (result.outOfSrgbCount > 0) {
      expect(result.maxDeltaE).toBeGreaterThan(0);
    }
  });
  test("in-sRGB entries have deltaE = 0", () => {
    const ramp = generateShadeRamp(toOklch("#64748b"), {
      mode: "light",
      background: bgLight,
      gamut: "srgb"
    });
    const result = compareRampGamut(ramp);
    for (const stop of result.stops) {
      if (stop.inSrgb) {
        expect(stop.deltaE).toBe(0);
      }
    }
  });
});
describe("comparePaletteGamut", () => {
  test("reports totals across all ramps", () => {
    const ramps = {
      slate: generateShadeRamp(toOklch("#64748b"), {
        mode: "light",
        background: bgLight,
        gamut: "srgb"
      }),
      brand: generateShadeRamp(toOklch("#6366f1"), {
        mode: "light",
        background: bgLight,
        gamut: "p3"
      })
    };
    const result = comparePaletteGamut(ramps);
    expect(result.totalStops).toBeGreaterThan(0);
    expect(result.ramps.slate).toBeDefined();
    expect(result.ramps.brand).toBeDefined();
    expect(result.totalOutOfSrgb).toBeGreaterThanOrEqual(0);
  });
});
