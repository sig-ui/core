// @ts-check

/**
 * Repository module for font spacing.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  deriveFontSpacingSubset,
  generateFontSpacingSubsets
} from "../src/spacing/font-spacing.js";
describe("deriveFontSpacingSubset", () => {
  test("base step (16px, lh 1.55) produces expected values", () => {
    const result = deriveFontSpacingSubset("base", 16, 1.55);
    expect(result.step).toBe("base");
    expect(result.fontSizePx).toBe(16);
    expect(result.gap).toBe(8);
    expect(result.padX).toBe(16);
    expect(result.padY).toBe(12);
    expect(result.gapStack).toBe(20);
    expect(result.minHeight).toBe(48);
  });
  test("all values are multiples of baseUnit (default 4)", () => {
    const result = deriveFontSpacingSubset("lg", 20, 1.45);
    expect(result.gap % 4).toBe(0);
    expect(result.padX % 4).toBe(0);
    expect(result.padY % 4).toBe(0);
    expect(result.minHeight % 4).toBe(0);
    expect(result.gapStack % 4).toBe(0);
  });
  test("minHeight never below touchMinimum (44px)", () => {
    const result = deriveFontSpacingSubset("xs", 11, 1.71);
    expect(result.minHeight).toBeGreaterThanOrEqual(44);
  });
  test("custom baseUnit (8px) produces 8px-grid-aligned values", () => {
    const result = deriveFontSpacingSubset("base", 16, 1.55, { baseUnit: 8 });
    expect(result.gap % 8).toBe(0);
    expect(result.padX % 8).toBe(0);
    expect(result.padY % 8).toBe(0);
    expect(result.minHeight % 8).toBe(0);
    expect(result.gapStack % 8).toBe(0);
  });
  test("no value below baseUnit", () => {
    const result = deriveFontSpacingSubset("xs", 6, 1.8);
    expect(result.gap).toBeGreaterThanOrEqual(4);
    expect(result.padX).toBeGreaterThanOrEqual(4);
    expect(result.padY).toBeGreaterThanOrEqual(4);
    expect(result.minHeight).toBeGreaterThanOrEqual(4);
    expect(result.gapStack).toBeGreaterThanOrEqual(4);
  });
  test("custom touchMinimum is respected", () => {
    const result = deriveFontSpacingSubset("xs", 11, 1.71, { touchMinimum: 48 });
    expect(result.minHeight).toBeGreaterThanOrEqual(48);
  });
});
describe("generateFontSpacingSubsets", () => {
  const STEPS = ["2xs", "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"];
  const entries = [
    ["2xs", 9, 1.83],
    ["xs", 11, 1.71],
    ["sm", 13, 1.63],
    ["base", 16, 1.55],
    ["lg", 19, 1.49],
    ["xl", 23, 1.44],
    ["2xl", 28, 1.4],
    ["3xl", 33, 1.37],
    ["4xl", 40, 1.34],
    ["5xl", 48, 1.32],
    ["6xl", 57, 1.3],
    ["7xl", 69, 1.28],
    ["8xl", 83, 1.27],
    ["9xl", 99, 1.26]
  ];
  test("generates all 14 steps", () => {
    const map = generateFontSpacingSubsets(entries);
    expect(map.size).toBe(14);
    for (const step of STEPS) {
      expect(map.has(step)).toBe(true);
    }
  });
  test("all values across all steps are multiples of baseUnit", () => {
    const map = generateFontSpacingSubsets(entries);
    for (const subset of map.values()) {
      expect(subset.gap % 4).toBe(0);
      expect(subset.padX % 4).toBe(0);
      expect(subset.padY % 4).toBe(0);
      expect(subset.minHeight % 4).toBe(0);
      expect(subset.gapStack % 4).toBe(0);
    }
  });
  test("minHeight never below touchMinimum across all steps", () => {
    const map = generateFontSpacingSubsets(entries);
    for (const subset of map.values()) {
      expect(subset.minHeight).toBeGreaterThanOrEqual(44);
    }
  });
  test("gap is non-decreasing across steps xs → 6xl", () => {
    const map = generateFontSpacingSubsets(entries);
    let prev = 0;
    for (const step of STEPS) {
      const val = map.get(step).gap;
      expect(val).toBeGreaterThanOrEqual(prev);
      prev = val;
    }
  });
  test("padX is non-decreasing across steps xs → 6xl", () => {
    const map = generateFontSpacingSubsets(entries);
    let prev = 0;
    for (const step of STEPS) {
      const val = map.get(step).padX;
      expect(val).toBeGreaterThanOrEqual(prev);
      prev = val;
    }
  });
  test("padY is non-decreasing across steps xs → 6xl", () => {
    const map = generateFontSpacingSubsets(entries);
    let prev = 0;
    for (const step of STEPS) {
      const val = map.get(step).padY;
      expect(val).toBeGreaterThanOrEqual(prev);
      prev = val;
    }
  });
  test("gapStack is non-decreasing across steps xs → 6xl", () => {
    const map = generateFontSpacingSubsets(entries);
    let prev = 0;
    for (const step of STEPS) {
      const val = map.get(step).gapStack;
      expect(val).toBeGreaterThanOrEqual(prev);
      prev = val;
    }
  });
});
