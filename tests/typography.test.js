// @ts-check

/**
 * Repository module for typography.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { generateTypeScale, remToPx, pxToRem } from "../src/typography/scale.js";
import { computeLineHeight, longMeasureOffset } from "../src/typography/line-height.js";
import { computeMeasure, measureTokens } from "../src/typography/measure.js";
import { computeLetterSpacing, capsLetterSpacing } from "../src/typography/letter-spacing.js";
import { getFontWeights, suggestedWeight } from "../src/typography/font-weight.js";
import { darkModeAdjustments, gradeOffset } from "../src/typography/dark-mode.js";
import { fluidFontSize, fluidTypeScale } from "../src/typography/fluid.js";
describe("generateTypeScale", () => {
  test("returns all fourteen named steps", () => {
    const scale = generateTypeScale();
    const keys = [
      "2xs",
      "xs",
      "sm",
      "base",
      "lg",
      "xl",
      "2xl",
      "3xl",
      "4xl",
      "5xl",
      "6xl",
      "7xl",
      "8xl",
      "9xl"
    ];
    for (const key of keys) {
      expect(scale[key]).toBeTypeOf("number");
      expect(scale[key]).toBeGreaterThan(0);
    }
  });
  test("base is exactly 1rem at default settings", () => {
    const scale = generateTypeScale();
    expect(scale.base).toBe(1);
  });
  test("steps are monotonically increasing (2xs < xs < sm < base < lg < ... < 9xl)", () => {
    const scale = generateTypeScale();
    const ordered = [
      scale["2xs"],
      scale.xs,
      scale.sm,
      scale.base,
      scale.lg,
      scale.xl,
      scale["2xl"],
      scale["3xl"],
      scale["4xl"],
      scale["5xl"],
      scale["6xl"],
      scale["7xl"],
      scale["8xl"],
      scale["9xl"]
    ];
    for (let i = 1;i < ordered.length; i++) {
      expect(ordered[i]).toBeGreaterThan(ordered[i - 1]);
    }
  });
  test("default ratio 1.2 produces expected rounded rem values", () => {
    const scale = generateTypeScale();
    expect(scale["2xs"]).toBeCloseTo(0.5625, 4);
    expect(scale.xs).toBeCloseTo(0.6875, 4);
    expect(scale.sm).toBeCloseTo(0.8125, 4);
    expect(scale.base).toBeCloseTo(1, 4);
    expect(scale.lg).toBeCloseTo(1.1875, 4);
    expect(scale.xl).toBeCloseTo(1.4375, 4);
    expect(scale["2xl"]).toBeCloseTo(1.75, 4);
    expect(scale["3xl"]).toBeCloseTo(2.0625, 4);
    expect(scale["4xl"]).toBeCloseTo(2.5, 4);
    expect(scale["5xl"]).toBeCloseTo(3, 4);
    expect(scale["6xl"]).toBeCloseTo(3.5625, 4);
    expect(scale["7xl"]).toBeCloseTo(4.3125, 4);
    expect(scale["8xl"]).toBeCloseTo(5.1875, 4);
    expect(scale["9xl"]).toBeCloseTo(6.1875, 4);
  });
  test("values are multiples of 0.0625 (1px grid at 16px base)", () => {
    const scale = generateTypeScale();
    for (const val of Object.values(scale)) {
      const scaled = val * 16;
      expect(scaled).toBeCloseTo(Math.round(scaled), 8);
    }
  });
  test("custom base size scales all values proportionally", () => {
    const defaultScale = generateTypeScale({ base: 16 });
    const doubleScale = generateTypeScale({ base: 32 });
    expect(doubleScale.base / defaultScale.base).toBeCloseTo(2, 1);
    expect(doubleScale["5xl"] / defaultScale["5xl"]).toBeCloseTo(2, 1);
  });
  test("custom ratio changes step magnitude", () => {
    const minor3rd = generateTypeScale({ ratio: 1.2 });
    const perfFourth = generateTypeScale({ ratio: 1.333 });
    expect(perfFourth["5xl"]).toBeGreaterThan(minor3rd["5xl"]);
  });
  test("px unit returns integer px values", () => {
    const scale = generateTypeScale({ unit: "px" });
    for (const val of Object.values(scale)) {
      expect(val).toBe(Math.round(val));
    }
    expect(scale.base).toBe(16);
  });
  test("small sizes (2xs, xs, sm) are below base", () => {
    const scale = generateTypeScale();
    expect(scale["2xs"]).toBeLessThan(scale.base);
    expect(scale.xs).toBeLessThan(scale.base);
    expect(scale.sm).toBeLessThan(scale.base);
  });
  test("large sizes (4xl–9xl) are notably larger than base", () => {
    const scale = generateTypeScale();
    expect(scale["4xl"]).toBeGreaterThan(scale.base * 2);
    expect(scale["5xl"]).toBeGreaterThan(scale.base * 2.5);
    expect(scale["6xl"]).toBeGreaterThan(scale.base * 3);
    expect(scale["7xl"]).toBeGreaterThan(scale.base * 4);
    expect(scale["8xl"]).toBeGreaterThan(scale.base * 5);
    expect(scale["9xl"]).toBeGreaterThan(scale.base * 6);
  });
});
describe("remToPx / pxToRem", () => {
  test("remToPx converts 1rem to 16px", () => {
    expect(remToPx(1)).toBe(16);
  });
  test("pxToRem converts 16px to 1rem", () => {
    expect(pxToRem(16)).toBe(1);
  });
  test("remToPx and pxToRem are inverse operations", () => {
    expect(remToPx(pxToRem(48))).toBe(48);
    expect(pxToRem(remToPx(3))).toBe(3);
  });
});
describe("computeLineHeight", () => {
  test("returns ratio and computed string", () => {
    const result = computeLineHeight(1);
    expect(result.ratio).toBeTypeOf("number");
    expect(result.computed).toBeTypeOf("string");
  });
  test("computed string matches ratio rounded to 2 decimal places", () => {
    const result = computeLineHeight(1);
    expect(result.computed).toBe(result.ratio.toFixed(2));
  });
  test("base size (1rem / 16px) → ~1.55", () => {
    const result = computeLineHeight(1);
    expect(result.ratio).toBeCloseTo(1.55, 2);
  });
  test("xs (0.6875rem / 11px) → ~1.71", () => {
    const result = computeLineHeight(0.6875);
    expect(result.ratio).toBeCloseTo(1.71, 1);
  });
  test("5xl (3rem / 48px) → ~1.32", () => {
    const result = computeLineHeight(3);
    expect(result.ratio).toBeCloseTo(1.32, 1);
  });
  test("line height strictly decreases as font size increases", () => {
    const scale = generateTypeScale();
    const sizes = [
      scale["2xs"],
      scale.xs,
      scale.sm,
      scale.base,
      scale.lg,
      scale.xl,
      scale["2xl"],
      scale["3xl"],
      scale["4xl"],
      scale["5xl"],
      scale["6xl"],
      scale["7xl"],
      scale["8xl"],
      scale["9xl"]
    ];
    const lineHeights = sizes.map((s) => computeLineHeight(s).ratio);
    for (let i = 1;i < lineHeights.length; i++) {
      expect(lineHeights[i]).toBeLessThan(lineHeights[i - 1]);
    }
  });
  test("all computed values are in the range [1.1, 2.0]", () => {
    const testSizes = [0.5, 0.6875, 1, 1.5, 2, 3, 4];
    for (const size of testSizes) {
      const result = computeLineHeight(size);
      expect(result.ratio).toBeGreaterThan(1.1);
      expect(result.ratio).toBeLessThan(2);
    }
  });
  test("custom leadingBase affects asymptote", () => {
    const defaultResult = computeLineHeight(10);
    const customResult = computeLineHeight(10, { leadingBase: 1.1 });
    expect(customResult.ratio).toBeLessThan(defaultResult.ratio);
  });
  test("custom leadingScale affects small-size extra leading", () => {
    const defaultResult = computeLineHeight(0.6875);
    const moreLeading = computeLineHeight(0.6875, { leadingScale: 8 });
    expect(moreLeading.ratio).toBeGreaterThan(defaultResult.ratio);
  });
  test("WCAG 1.4.12: body text line height ≥ 1.5", () => {
    const result = computeLineHeight(1);
    expect(result.ratio).toBeGreaterThanOrEqual(1.5);
  });
});
describe("longMeasureOffset", () => {
  test("returns 0 for measures at or below 66ch", () => {
    expect(longMeasureOffset(45)).toBe(0);
    expect(longMeasureOffset(66)).toBe(0);
  });
  test("returns 0.1 for measures above 66ch", () => {
    expect(longMeasureOffset(67)).toBe(0.1);
    expect(longMeasureOffset(75)).toBe(0.1);
    expect(longMeasureOffset(100)).toBe(0.1);
  });
  test("custom measureBase threshold", () => {
    expect(longMeasureOffset(75, 75)).toBe(0);
    expect(longMeasureOffset(76, 75)).toBe(0.1);
  });
});
describe("computeMeasure", () => {
  test("returns min=45, ideal=66, max=75", () => {
    const result = computeMeasure(1);
    expect(result.min).toBe(45);
    expect(result.ideal).toBe(66);
    expect(result.max).toBe(75);
  });
  test("min is less than ideal, ideal is less than max", () => {
    const result = computeMeasure(1);
    expect(result.min).toBeLessThan(result.ideal);
    expect(result.ideal).toBeLessThan(result.max);
  });
  test("font-size-independent: same values for any input size", () => {
    const small = computeMeasure(0.6875);
    const large = computeMeasure(3);
    expect(small.min).toBe(large.min);
    expect(small.ideal).toBe(large.ideal);
    expect(small.max).toBe(large.max);
  });
  test("ideal falls within research-backed 45–75 character range", () => {
    const result = computeMeasure(1);
    expect(result.ideal).toBeGreaterThanOrEqual(45);
    expect(result.ideal).toBeLessThanOrEqual(75);
  });
});
describe("measureTokens", () => {
  test("returns ch strings for all three tokens", () => {
    const tokens = measureTokens();
    expect(tokens.narrow).toBe("45ch");
    expect(tokens.base).toBe("66ch");
    expect(tokens.wide).toBe("75ch");
  });
});
describe("computeLetterSpacing", () => {
  test("xs (0.6875rem / 11px) → +0.02em", () => {
    expect(computeLetterSpacing(0.6875)).toBe("0.02em");
  });
  test("sm (0.8125rem / 13px) → positive tracking", () => {
    const spacing = computeLetterSpacing(0.8125);
    const value = parseFloat(spacing);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(0.02);
  });
  test("base (1rem / 16px) → 0em", () => {
    expect(computeLetterSpacing(1)).toBe("0em");
  });
  test("lg (1.1875rem / 19px) → 0em", () => {
    expect(computeLetterSpacing(1.1875)).toBe("0em");
  });
  test("2xl (1.75rem / 28px) → negative tracking", () => {
    const spacing = computeLetterSpacing(1.75);
    const value = parseFloat(spacing);
    expect(value).toBeLessThan(0);
  });
  test("5xl (3rem / 48px) → -0.02em", () => {
    expect(computeLetterSpacing(3)).toBe("-0.02em");
  });
  test("transitions from positive to negative as size increases", () => {
    const scale = generateTypeScale();
    const sizes = [
      scale["2xs"],
      scale.xs,
      scale.sm,
      scale.base,
      scale.lg,
      scale.xl,
      scale["2xl"],
      scale["3xl"],
      scale["4xl"],
      scale["5xl"],
      scale["6xl"],
      scale["7xl"],
      scale["8xl"],
      scale["9xl"]
    ];
    const spacings = sizes.map((s) => parseFloat(computeLetterSpacing(s)));
    expect(spacings[0]).toBeGreaterThanOrEqual(0);
    expect(spacings[spacings.length - 1]).toBeLessThan(0);
    const first = spacings[0];
    const last = spacings[spacings.length - 1];
    expect(last).toBeLessThan(first);
  });
  test("very small sizes clamp to maximum positive tracking", () => {
    const verySmall = computeLetterSpacing(0.25);
    const xs = computeLetterSpacing(0.6875);
    expect(verySmall).toBe(xs);
  });
  test("very large sizes clamp to maximum negative tracking", () => {
    const huge = computeLetterSpacing(10);
    const fiveXl = computeLetterSpacing(3);
    expect(huge).toBe(fiveXl);
  });
  test("returns '0em' string (not '0') for zero spacing", () => {
    const spacing = computeLetterSpacing(1);
    expect(spacing).toBe("0em");
  });
});
describe("capsLetterSpacing", () => {
  test("returns 0.05em for all-caps text", () => {
    expect(capsLetterSpacing()).toBe("0.05em");
  });
});
describe("getFontWeights", () => {
  test("returns all nine named weights", () => {
    const weights = getFontWeights();
    expect(weights.thin).toBe(100);
    expect(weights.extralight).toBe(200);
    expect(weights.light).toBe(300);
    expect(weights.normal).toBe(400);
    expect(weights.medium).toBe(500);
    expect(weights.semibold).toBe(600);
    expect(weights.bold).toBe(700);
    expect(weights.extrabold).toBe(800);
    expect(weights.black).toBe(900);
  });
  test("weights are in ascending order", () => {
    const w = getFontWeights();
    expect(w.thin).toBeLessThan(w.extralight);
    expect(w.extralight).toBeLessThan(w.light);
    expect(w.light).toBeLessThan(w.normal);
    expect(w.normal).toBeLessThan(w.medium);
    expect(w.medium).toBeLessThan(w.semibold);
    expect(w.semibold).toBeLessThan(w.bold);
    expect(w.bold).toBeLessThan(w.extrabold);
    expect(w.extrabold).toBeLessThan(w.black);
  });
  test("values are multiples of 100", () => {
    const weights = getFontWeights();
    for (const [, val] of Object.entries(weights)) {
      expect(val % 100).toBe(0);
    }
  });
  test("spans full range 100–900", () => {
    const weights = getFontWeights();
    const values = Object.values(weights);
    expect(Math.min(...values)).toBe(100);
    expect(Math.max(...values)).toBe(900);
  });
});
describe("suggestedWeight", () => {
  test("small text (xs/sm) → medium (not light)", () => {
    const xs = suggestedWeight(0.6875);
    const sm = suggestedWeight(0.875);
    const weights = getFontWeights();
    expect(weights[xs]).toBeGreaterThanOrEqual(weights.medium);
    expect(weights[sm]).toBeGreaterThanOrEqual(weights.medium);
  });
  test("body text (base/lg) → normal", () => {
    expect(suggestedWeight(1)).toBe("normal");
  });
  test("large headings (4xl, 5xl) → bold or extrabold", () => {
    const w4xl = suggestedWeight(2.5);
    const w5xl = suggestedWeight(3);
    const weights = getFontWeights();
    expect(weights[w4xl]).toBeGreaterThanOrEqual(weights.bold);
    expect(weights[w5xl]).toBeGreaterThanOrEqual(weights.bold);
  });
  test("display text (6xl) → extrabold", () => {
    const w = suggestedWeight(4);
    expect(w).toBe("extrabold");
  });
  test("never suggests light weight", () => {
    const testSizes = [0.5, 0.6875, 0.875, 1, 1.5, 2, 3];
    for (const size of testSizes) {
      expect(suggestedWeight(size)).not.toBe("light");
      expect(suggestedWeight(size)).not.toBe("thin");
      expect(suggestedWeight(size)).not.toBe("extralight");
    }
  });
});
describe("darkModeAdjustments", () => {
  test("reduces weight by 100 (one step) by default", () => {
    const result = darkModeAdjustments(1, 700);
    expect(result.weightOffset).toBe(-100);
    expect(result.adjustedWeight).toBe(600);
  });
  test("floors at 300 (Light) - never below minimum", () => {
    const result = darkModeAdjustments(1, 300);
    expect(result.adjustedWeight).toBe(300);
    const result2 = darkModeAdjustments(1, 200);
    expect(result2.adjustedWeight).toBe(300);
  });
  test("applies offset table from Spec 02 §9.4", () => {
    const weights = getFontWeights();
    const pairs = [
      [weights.normal, weights.light],
      [weights.medium, weights.normal],
      [weights.semibold, weights.medium],
      [weights.bold, weights.semibold],
      [weights.extrabold, weights.bold]
    ];
    for (const [lightWeight, expectedDark] of pairs) {
      const result = darkModeAdjustments(1, lightWeight);
      expect(result.adjustedWeight).toBe(expectedDark);
    }
  });
  test("includes letter-spacing offset string", () => {
    const result = darkModeAdjustments(1, 400);
    expect(result.letterSpacingOffset).toMatch(/^[\d.]+em$/);
    const value = parseFloat(result.letterSpacingOffset);
    expect(value).toBeGreaterThan(0);
  });
  test("custom weight offset", () => {
    const result = darkModeAdjustments(1, 700, { weightOffset: -200 });
    expect(result.weightOffset).toBe(-200);
    expect(result.adjustedWeight).toBe(500);
  });
  test("custom weight floor", () => {
    const result = darkModeAdjustments(1, 400, { weightFloor: 400 });
    expect(result.adjustedWeight).toBe(400);
  });
  test("custom letter spacing offset", () => {
    const result = darkModeAdjustments(1, 400, { letterSpacingOffset: "0.02em" });
    expect(result.letterSpacingOffset).toBe("0.02em");
  });
  test("accepts font size parameter without error", () => {
    expect(() => darkModeAdjustments(0.6875, 400)).not.toThrow();
    expect(() => darkModeAdjustments(3, 700)).not.toThrow();
  });
  test("adjustedWeight is always a multiple of 100", () => {
    const testWeights = [300, 400, 500, 600, 700, 800, 900];
    for (const w of testWeights) {
      const result = darkModeAdjustments(1, w);
      expect(result.adjustedWeight % 100).toBe(0);
    }
  });
});
describe("gradeOffset", () => {
  test("returns -25 by default", () => {
    expect(gradeOffset()).toBe(-25);
  });
  test("accepts custom offset", () => {
    expect(gradeOffset(-50)).toBe(-50);
    expect(gradeOffset(0)).toBe(0);
  });
  test("returns a number", () => {
    expect(gradeOffset()).toBeTypeOf("number");
  });
});
describe("fluidFontSize", () => {
  test("returns a clamp() string", () => {
    const result = fluidFontSize(1, 1.5);
    expect(result).toStartWith("clamp(");
    expect(result).toEndWith(")");
  });
  test("clamp() has three parts separated by commas", () => {
    const result = fluidFontSize(1, 1.5);
    const parts = result.slice(6, -1).split(",").map((s) => s.trim());
    expect(parts).toHaveLength(3);
  });
  test("min value is the minRem argument", () => {
    const result = fluidFontSize(2.0625, 3);
    expect(result).toStartWith("clamp(2.0625rem,");
  });
  test("max value is the maxRem argument", () => {
    const result = fluidFontSize(2.0625, 3);
    expect(result).toEndWith(", 3rem)");
  });
  test("preferred expression contains both rem and vw components", () => {
    const result = fluidFontSize(2.0625, 3);
    const preferred = result.slice(6, -1).split(",")[1].trim();
    expect(preferred).toContain("rem");
    expect(preferred).toContain("vw");
  });
  test("static size (minRem === maxRem) produces valid clamp()", () => {
    const result = fluidFontSize(1, 1);
    expect(result).toStartWith("clamp(");
    expect(result).toContain("1rem");
  });
  test("custom viewport range changes the vw coefficient", () => {
    const narrow = fluidFontSize(1, 2, { minVw: 20, maxVw: 40 });
    const wide = fluidFontSize(1, 2, { minVw: 20, maxVw: 80 });
    expect(narrow).not.toBe(wide);
  });
  test("5xl example from Spec 02 §10.4 is structurally correct", () => {
    const result = fluidFontSize(2.0625, 3);
    expect(result).toStartWith("clamp(2.0625rem,");
    expect(result).toEndWith(", 3rem)");
    expect(result).toContain("vw");
  });
  test("larger size range produces larger vw coefficient", () => {
    const small = fluidFontSize(1, 1.5);
    const large = fluidFontSize(1, 3);
    const smallVw = parseFloat(small.match(/(\d+\.?\d*)vw/)?.[1] ?? "0");
    const largeVw = parseFloat(large.match(/(\d+\.?\d*)vw/)?.[1] ?? "0");
    expect(largeVw).toBeGreaterThan(smallVw);
  });
  test("accessibility: rem components scale with browser zoom", () => {
    const result = fluidFontSize(0.875, 1);
    const preferred = result.slice(6, -1).split(",")[1].trim();
    expect(preferred).toContain("rem");
  });
});
describe("fluidTypeScale", () => {
  test("returns all fourteen scale steps", () => {
    const scale = fluidTypeScale();
    const expected = ["2xs", "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"];
    for (const key of expected) {
      expect(scale[key]).toBeDefined();
      expect(scale[key]).toStartWith("clamp(");
    }
  });
  test("larger steps produce wider size ranges", () => {
    const scale = fluidTypeScale();
    const baseClamp = scale["base"];
    const fiveXlClamp = scale["5xl"];
    const baseMin = parseFloat(baseClamp.slice(6).split(",")[0]);
    const fiveXlMin = parseFloat(fiveXlClamp.slice(6).split(",")[0]);
    expect(fiveXlMin).toBeGreaterThan(baseMin);
  });
  test("all values are valid clamp() expressions", () => {
    const scale = fluidTypeScale();
    for (const value of Object.values(scale)) {
      expect(value).toMatch(/^clamp\(.+,.+,.+\)$/);
    }
  });
  test("custom options are respected", () => {
    const defaultScale = fluidTypeScale();
    const customScale = fluidTypeScale({ minRatio: 1.1, maxRatio: 1.333 });
    expect(customScale["5xl"]).not.toBe(defaultScale["5xl"]);
  });
});
describe("@sig-ui/core/typography subpath export", () => {
  test("exports all main functions", async () => {
    const mod = await import("../src/typography-export.js");
    expect(mod.generateTypeScale).toBeFunction();
    expect(mod.computeLineHeight).toBeFunction();
    expect(mod.computeLetterSpacing).toBeFunction();
    expect(mod.computeMeasure).toBeFunction();
    expect(mod.getFontWeights).toBeFunction();
    expect(mod.darkModeAdjustments).toBeFunction();
    expect(mod.fluidFontSize).toBeFunction();
  });
  test("main index re-exports all typography functions", async () => {
    const mod = await import("../src/index.js");
    expect(mod.generateTypeScale).toBeFunction();
    expect(mod.computeLineHeight).toBeFunction();
    expect(mod.computeLetterSpacing).toBeFunction();
    expect(mod.computeMeasure).toBeFunction();
    expect(mod.getFontWeights).toBeFunction();
    expect(mod.darkModeAdjustments).toBeFunction();
    expect(mod.fluidFontSize).toBeFunction();
  });
});
describe("edge cases", () => {
  test("generateTypeScale: ratio of 1 produces all values equal to base", () => {
    const scale = generateTypeScale({ ratio: 1 });
    for (const val of Object.values(scale)) {
      expect(val).toBe(scale.base);
    }
  });
  test("computeLineHeight: very large font approaches leadingBase", () => {
    const result = computeLineHeight(100);
    expect(result.ratio).toBeCloseTo(1.2, 1);
  });
  test("computeLetterSpacing: returns string with 'em' suffix always", () => {
    const sizes = [0.25, 0.6875, 1, 2, 3, 10];
    for (const s of sizes) {
      expect(computeLetterSpacing(s)).toMatch(/em$/);
    }
  });
  test("darkModeAdjustments: Light weight (300) - no further reduction", () => {
    const result = darkModeAdjustments(1, 300);
    expect(result.adjustedWeight).toBe(300);
  });
  test("fluidFontSize: minRem > maxRem is valid (rare inverse scaling)", () => {
    expect(() => fluidFontSize(2, 1)).not.toThrow();
  });
  test("computeLineHeight: tiny size below 1px does not produce NaN", () => {
    const result = computeLineHeight(0.01);
    expect(Number.isNaN(result.ratio)).toBe(false);
    expect(Number.isFinite(result.ratio)).toBe(true);
  });
});
