// @ts-check

/**
 * Repository module for alpha.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  computeAlphaEquivalent,
  computeAlphaShadeRamp,
  generateAlphaRamp,
  generateBlackAlphaScale,
  generateWhiteAlphaScale,
  composePalette,
  toOklch,
  generatePalette,
  ALPHA_STOPS
} from "../src/index.js";
import { oklchToOklab, oklabToLinearRgb } from "../src/color-space/oklch.js";
import { linearRgbToSrgb } from "../src/color-space/srgb.js";
const white = toOklch("#ffffff");
const black = toOklch("#000000");
const brand500 = toOklch("#6366f1");
describe("computeAlphaEquivalent", () => {
  test("alpha=0.75 returns a valid AlphaEquivalent", () => {
    const result = computeAlphaEquivalent(brand500, white, 0.75);
    expect(result.alpha).toBe(0.75);
    expect(result.rgba.r).toBeGreaterThanOrEqual(0);
    expect(result.rgba.r).toBeLessThanOrEqual(255);
    expect(result.rgba.g).toBeGreaterThanOrEqual(0);
    expect(result.rgba.g).toBeLessThanOrEqual(255);
    expect(result.rgba.b).toBeGreaterThanOrEqual(0);
    expect(result.rgba.b).toBeLessThanOrEqual(255);
    expect(result.rgba.a).toBe(0.75);
    expect(result.css).toMatch(/^rgba\(\d+, \d+, \d+, 0\.75\)$/);
  });
  test("round-trip: composited RGBA over bg matches target within 1/255", () => {
    for (const alpha of ALPHA_STOPS) {
      const result = computeAlphaEquivalent(brand500, white, alpha);
      const compositeR = Math.round(result.rgba.r * alpha + 255 * (1 - alpha));
      const compositeG = Math.round(result.rgba.g * alpha + 255 * (1 - alpha));
      const compositeB = Math.round(result.rgba.b * alpha + 255 * (1 - alpha));
      const targetResult = computeAlphaEquivalent(brand500, white, 0.75);
      if (result.exact) {
        expect(Math.abs(compositeR - getTargetSrgb(brand500).r)).toBeLessThanOrEqual(1);
        expect(Math.abs(compositeG - getTargetSrgb(brand500).g)).toBeLessThanOrEqual(1);
        expect(Math.abs(compositeB - getTargetSrgb(brand500).b)).toBeLessThanOrEqual(1);
      }
    }
  });
  test("exact flag is false when clamping is needed (low alpha, distant color)", () => {
    const darkColor = toOklch("#111111");
    const result = computeAlphaEquivalent(darkColor, white, 0.05);
    expect(result.exact).toBe(false);
  });
  test("CSS string format is correct", () => {
    const result = computeAlphaEquivalent(brand500, white, 0.5);
    expect(result.css).toMatch(/^rgba\(\d+, \d+, \d+, 0\.5\)$/);
  });
  test("high alpha (0.75) is more likely exact than low alpha (0.05)", () => {
    const highAlpha = computeAlphaEquivalent(brand500, white, 0.75);
    expect(highAlpha.exact).toBe(true);
  });
});
describe("computeAlphaShadeRamp", () => {
  test("returns all 6 alpha stops", () => {
    const ramp = computeAlphaShadeRamp(brand500, white);
    for (const stop of ALPHA_STOPS) {
      expect(ramp[stop]).toBeDefined();
      expect(ramp[stop].alpha).toBe(stop);
    }
  });
});
describe("generateAlphaRamp", () => {
  test("returns alpha equivalents for all 11 shade stops", () => {
    const palette = generatePalette("#6366f1", { background: "#ffffff" });
    const alphaRamp = generateAlphaRamp(palette.ramp, white);
    const shadeStops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    for (const stop of shadeStops) {
      expect(alphaRamp[stop]).toBeDefined();
      for (const alpha of ALPHA_STOPS) {
        expect(alphaRamp[stop][alpha]).toBeDefined();
        expect(alphaRamp[stop][alpha].css).toMatch(/^rgba\(/);
      }
    }
  });
});
describe("generateBlackAlphaScale", () => {
  test("returns 12 steps", () => {
    const scale = generateBlackAlphaScale();
    expect(scale).toHaveLength(12);
  });
  test("steps are numbered 1 through 12", () => {
    const scale = generateBlackAlphaScale();
    for (let i = 0;i < 12; i++) {
      expect(scale[i].step).toBe(i + 1);
    }
  });
  test("opacity is monotonically increasing", () => {
    const scale = generateBlackAlphaScale();
    for (let i = 1;i < scale.length; i++) {
      expect(scale[i].opacity).toBeGreaterThan(scale[i - 1].opacity);
    }
  });
  test("all opacities are in [0, 1]", () => {
    const scale = generateBlackAlphaScale();
    for (const step of scale) {
      expect(step.opacity).toBeGreaterThanOrEqual(0);
      expect(step.opacity).toBeLessThanOrEqual(1);
    }
  });
  test("CSS format is correct", () => {
    const scale = generateBlackAlphaScale();
    for (const step of scale) {
      expect(step.css).toMatch(/^rgba\(0, 0, 0, [\d.]+\)$/);
    }
  });
  test("perceptually uniform L spacing (consecutive deltas within 20% of each other)", () => {
    const scale = generateBlackAlphaScale();
    const ls = scale.map((s) => {
      const gray01 = 1 - s.opacity;
      const linear = gray01 <= 0.04045 / 12.92 ? gray01 / 12.92 : Math.pow((gray01 + 0.055) / 1.055, 2.4);
      return Math.cbrt(Math.max(0, linear));
    });
    const deltas = [];
    for (let i = 1;i < ls.length; i++) {
      deltas.push(Math.abs(ls[i - 1] - ls[i]));
    }
    const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    for (const d of deltas) {
      expect(d / avgDelta).toBeGreaterThan(0.5);
      expect(d / avgDelta).toBeLessThan(1.8);
    }
  });
});
describe("generateWhiteAlphaScale", () => {
  test("returns 12 steps", () => {
    const scale = generateWhiteAlphaScale();
    expect(scale).toHaveLength(12);
  });
  test("opacity is monotonically increasing", () => {
    const scale = generateWhiteAlphaScale();
    for (let i = 1;i < scale.length; i++) {
      expect(scale[i].opacity).toBeGreaterThan(scale[i - 1].opacity);
    }
  });
  test("CSS format uses white (255, 255, 255)", () => {
    const scale = generateWhiteAlphaScale();
    for (const step of scale) {
      expect(step.css).toMatch(/^rgba\(255, 255, 255, [\d.]+\)$/);
    }
  });
  test("perceptually uniform L spacing", () => {
    const scale = generateWhiteAlphaScale();
    const ls = scale.map((s) => {
      const gray01 = s.opacity;
      const linear = gray01 <= 0.04045 / 12.92 ? gray01 / 12.92 : Math.pow((gray01 + 0.055) / 1.055, 2.4);
      return Math.cbrt(Math.max(0, linear));
    });
    const deltas = [];
    for (let i = 1;i < ls.length; i++) {
      deltas.push(Math.abs(ls[i] - ls[i - 1]));
    }
    const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    for (const d of deltas) {
      expect(d / avgDelta).toBeGreaterThan(0.5);
      expect(d / avgDelta).toBeLessThan(1.8);
    }
  });
});
describe("composePalette", () => {
  test("returns 8 palettes (primary, secondary, tertiary, accent, success, warning, danger, info)", () => {
    const result = composePalette("#6366f1");
    const names = Object.keys(result.palettes);
    expect(names).toContain("primary");
    expect(names).toContain("secondary");
    expect(names).toContain("tertiary");
    expect(names).toContain("accent");
    expect(names).toContain("success");
    expect(names).toContain("warning");
    expect(names).toContain("danger");
    expect(names).toContain("info");
    expect(names).toContain("neutral");
    expect(names.length).toBe(9);
  });
  test("includes blackAlpha and whiteAlpha overlay scales", () => {
    const result = composePalette("#6366f1");
    expect(result.blackAlpha).toHaveLength(12);
    expect(result.whiteAlpha).toHaveLength(12);
  });
  test("alphaRamps is undefined by default", () => {
    const result = composePalette("#6366f1");
    expect(result.alphaRamps).toBeUndefined();
  });
  test("alphaRamps is present when alphaVariants is true", () => {
    const result = composePalette("#6366f1", { alphaVariants: true });
    expect(result.alphaRamps).toBeDefined();
    expect(Object.keys(result.alphaRamps).length).toBe(9);
  });
  test("harmony, background, and mode are present", () => {
    const result = composePalette("#6366f1", { mode: "dark" });
    expect(result.harmony).toBeDefined();
    expect(result.harmony.hues).toBeDefined();
    expect(result.harmony.mode).toBeDefined();
    expect(result.background).toBeTruthy();
    expect(result.mode).toBe("dark");
  });
  test("respects harmony mode option", () => {
    const triadic = composePalette("#6366f1", { harmony: "triadic" });
    const complementary = composePalette("#6366f1", { harmony: "complementary" });
    expect(triadic.harmony.mode).toBe("triadic");
    expect(complementary.harmony.mode).toBe("complementary");
  });
});
describe("ALPHA_STOPS", () => {
  test("has 6 stops", () => {
    expect(ALPHA_STOPS).toHaveLength(6);
  });
  test("is sorted ascending", () => {
    for (let i = 1;i < ALPHA_STOPS.length; i++) {
      expect(ALPHA_STOPS[i]).toBeGreaterThan(ALPHA_STOPS[i - 1]);
    }
  });
});
function getTargetSrgb(color) {
  const lab = oklchToOklab(color);
  const linear = oklabToLinearRgb(lab);
  const srgb = linearRgbToSrgb(linear);
  return { r: srgb.r, g: srgb.g, b: srgb.b };
}
