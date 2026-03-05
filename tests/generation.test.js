// @ts-check

/**
 * Repository module for generation.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { generateShadeRamp, findShadeForTarget } from "../src/generation/shade.js";
import { hkOffset } from "../src/generation/hk.js";
import { huntFactor, applyHuntCompensation } from "../src/generation/hunt.js";
import { blendHue } from "../src/generation/hue-blend.js";
import { LC_TARGETS, ALL_STOPS } from "../src/generation/targets.js";
import { apcaContrast } from "../src/contrast/apca.js";
import { toOklch } from "../src/color-space/oklch.js";
describe("H-K compensation", () => {
  test("returns 0 for low chroma", () => {
    expect(hkOffset(0.01, 250)).toBe(0);
    expect(hkOffset(0.03, 25)).toBe(0);
  });
  test("returns positive for high chroma at sensitive hues", () => {
    const blueOffset = hkOffset(0.2, 265);
    expect(blueOffset).toBeGreaterThan(0);
    expect(blueOffset).toBeLessThan(0.02);
    const redOffset = hkOffset(0.2, 25);
    expect(redOffset).toBeGreaterThan(0);
  });
  test("offset increases with chroma", () => {
    const low = hkOffset(0.05, 265);
    const high = hkOffset(0.2, 265);
    expect(high).toBeGreaterThan(low);
  });
  test("red-magenta region (~350) has increased offset vs green (~180)", () => {
    const magentaOffset = hkOffset(0.2, 350);
    const greenOffset = hkOffset(0.2, 180);
    expect(magentaOffset).toBeGreaterThan(greenOffset);
  });
  test("max offset is bounded", () => {
    for (let h = 0;h < 360; h += 1) {
      const offset = hkOffset(0.4, h);
      expect(offset).toBeLessThanOrEqual(0.02);
    }
  });
});
describe("Hunt effect", () => {
  test("dark backgrounds get higher compensation", () => {
    const veryDark = huntFactor(0.05);
    const lighter = huntFactor(0.25);
    expect(veryDark).toBeGreaterThan(lighter);
  });
  test("factor is in range [0.05, 0.15]", () => {
    expect(huntFactor(0.05)).toBeCloseTo(0.15, 2);
    expect(huntFactor(0.25)).toBeCloseTo(0.05, 2);
  });
  test("chroma is boosted", () => {
    const boosted = applyHuntCompensation(0.15, 0.1);
    expect(boosted).toBeGreaterThan(0.15);
    expect(boosted).toBeLessThan(0.175);
  });
});
describe("hue blending", () => {
  test("shade 500 gets no blending", () => {
    const result = blendHue(250, 30, 500);
    expect(result).toBeCloseTo(250, 5);
  });
  test("extreme shades get blended toward background", () => {
    const result100 = blendHue(250, 30, 100);
    expect(result100).not.toBeCloseTo(250, 0);
  });
});
describe("shade generation", () => {
  const bgLight = toOklch("#f8fafc");
  const bgDark = toOklch("#0f172a");
  test("generates complete ramp with extended stops", () => {
    const baseColor = toOklch("#6366f1");
    const ramp = generateShadeRamp(baseColor, {
      mode: "light",
      background: bgLight,
      extendedStops: true
    });
    for (const stop of ALL_STOPS) {
      expect(ramp[stop]).toBeDefined();
      expect(ramp[stop].l).toBeGreaterThanOrEqual(0);
      expect(ramp[stop].l).toBeLessThanOrEqual(1);
    }
  });
  test("light mode: each shade hits APCA Lc target within 2", () => {
    const baseColor = toOklch("#3b82f6");
    const ramp = generateShadeRamp(baseColor, {
      mode: "light",
      background: bgLight
    });
    for (const stop of ALL_STOPS) {
      const shade = ramp[stop];
      const actualLc = Math.abs(apcaContrast(shade, bgLight));
      const targetLc = LC_TARGETS.light[stop];
      expect(Math.abs(actualLc - targetLc)).toBeLessThan(2);
    }
  });
  test("dark mode: each shade hits APCA Lc target within 2", () => {
    const baseColor = toOklch("#3b82f6");
    const ramp = generateShadeRamp(baseColor, {
      mode: "dark",
      background: bgDark
    });
    for (const stop of ALL_STOPS) {
      const shade = ramp[stop];
      const actualLc = Math.abs(apcaContrast(shade, bgDark));
      const targetLc = LC_TARGETS.dark[stop];
      expect(Math.abs(actualLc - targetLc)).toBeLessThan(2);
    }
  });
  test("light mode: higher shades have higher contrast", () => {
    const baseColor = toOklch("#ef4444");
    const ramp = generateShadeRamp(baseColor, {
      mode: "light",
      background: bgLight
    });
    const stops = [100, 200, 300, 400, 500, 600, 700, 800, 900];
    for (let i = 1;i < stops.length; i++) {
      const prevLc = Math.abs(apcaContrast(ramp[stops[i - 1]], bgLight));
      const currLc = Math.abs(apcaContrast(ramp[stops[i]], bgLight));
      expect(currLc).toBeGreaterThanOrEqual(prevLc - 1);
    }
  });
  test("works with various base colors", () => {
    const colors = ["#22c55e", "#f59e0b", "#ef4444", "#6366f1", "#64748b"];
    for (const hex of colors) {
      const base = toOklch(hex);
      const ramp = generateShadeRamp(base, {
        mode: "light",
        background: bgLight
      });
      const lc500 = Math.abs(apcaContrast(ramp[500], bgLight));
      expect(lc500).toBeGreaterThan(45);
      expect(lc500).toBeLessThan(65);
    }
  });
  test("generates without extended stops when disabled", () => {
    const base = toOklch("#3b82f6");
    const ramp = generateShadeRamp(base, {
      mode: "light",
      background: bgLight,
      extendedStops: false
    });
    expect(ramp[50]).toBeUndefined();
    expect(ramp[950]).toBeUndefined();
    expect(ramp[500]).toBeDefined();
  });
});
describe("findShadeForTarget", () => {
  test("finds shade for specific Lc target", () => {
    const bg = toOklch("#ffffff");
    const shade = findShadeForTarget(250, 0.15, 55, bg, "light");
    const actualLc = Math.abs(apcaContrast(shade, bg));
    expect(Math.abs(actualLc - 55)).toBeLessThan(2);
  });
  test("dark mode: finds correct shade", () => {
    const bg = toOklch("#000000");
    const shade = findShadeForTarget(250, 0.15, 55, bg, "dark");
    const actualLc = Math.abs(apcaContrast(shade, bg));
    expect(Math.abs(actualLc - 55)).toBeLessThan(2);
  });
});
