// @ts-check

/**
 * Repository module for visual weight.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  VISUAL_WEIGHTS,
  OPTICAL_ADJUSTMENT_MATRIX,
  getOpticalAdjustment,
  generateOpticalCSS
} from "../src/spacing/visual-weight.js";
describe("Visual Weight Optical Spacing", () => {
  describe("VISUAL_WEIGHTS", () => {
    test("contains exactly 5 categories", () => {
      expect(VISUAL_WEIGHTS).toHaveLength(5);
    });
    test("includes all expected weights", () => {
      expect(VISUAL_WEIGHTS).toContain("solid");
      expect(VISUAL_WEIGHTS).toContain("outlined");
      expect(VISUAL_WEIGHTS).toContain("text");
      expect(VISUAL_WEIGHTS).toContain("icon");
      expect(VISUAL_WEIGHTS).toContain("surface");
    });
  });
  describe("OPTICAL_ADJUSTMENT_MATRIX", () => {
    test("covers all 25 pairs", () => {
      for (const a of VISUAL_WEIGHTS) {
        for (const b of VISUAL_WEIGHTS) {
          const key = `${a}:${b}`;
          expect(OPTICAL_ADJUSTMENT_MATRIX).toHaveProperty(key);
        }
      }
    });
    test("all values are in [-0.20, +0.20]", () => {
      for (const [key, value] of Object.entries(OPTICAL_ADJUSTMENT_MATRIX)) {
        expect(value).toBeGreaterThanOrEqual(-0.2);
        expect(value).toBeLessThanOrEqual(0.2);
      }
    });
    test("magnitudes are symmetric: |adj(A,B)| === |adj(B,A)|", () => {
      for (const a of VISUAL_WEIGHTS) {
        for (const b of VISUAL_WEIGHTS) {
          const ab = Math.abs(getOpticalAdjustment(a, b));
          const ba = Math.abs(getOpticalAdjustment(b, a));
          expect(ab).toBeCloseTo(ba, 10);
        }
      }
    });
    test("zero pairs are correctly zero", () => {
      const zeroPairs = [
        ["solid", "outlined"],
        ["outlined", "solid"],
        ["outlined", "outlined"],
        ["outlined", "surface"],
        ["surface", "outlined"]
      ];
      for (const [a, b] of zeroPairs) {
        expect(getOpticalAdjustment(a, b)).toBe(0);
      }
    });
  });
  describe("getOpticalAdjustment", () => {
    test("solid:solid returns -0.15", () => {
      expect(getOpticalAdjustment("solid", "solid")).toBe(-0.15);
    });
    test("solid:icon returns +0.15", () => {
      expect(getOpticalAdjustment("solid", "icon")).toBe(0.15);
    });
    test("icon:solid returns +0.15", () => {
      expect(getOpticalAdjustment("icon", "solid")).toBe(0.15);
    });
    test("text:text returns -0.05", () => {
      expect(getOpticalAdjustment("text", "text")).toBe(-0.05);
    });
    test("icon:icon returns -0.10", () => {
      expect(getOpticalAdjustment("icon", "icon")).toBe(-0.1);
    });
    test("surface:surface returns -0.08", () => {
      expect(getOpticalAdjustment("surface", "surface")).toBe(-0.08);
    });
    test("text:icon returns +0.10", () => {
      expect(getOpticalAdjustment("text", "icon")).toBe(0.1);
    });
    test("solid:text returns +0.10", () => {
      expect(getOpticalAdjustment("solid", "text")).toBe(0.1);
    });
    test("surface:solid returns -0.10", () => {
      expect(getOpticalAdjustment("surface", "solid")).toBe(-0.1);
    });
    test("surface:text returns +0.05", () => {
      expect(getOpticalAdjustment("surface", "text")).toBe(0.05);
    });
  });
  describe("generateOpticalCSS", () => {
    test("generates non-empty CSS string", () => {
      const css = generateOpticalCSS();
      expect(css.length).toBeGreaterThan(0);
    });
    test("includes rules for non-zero pairs", () => {
      const css = generateOpticalCSS();
      expect(css).toContain('data-visual-weight="solid"');
      expect(css).toContain("--sg-optical-adjust");
    });
    test("does not include rules for zero pairs", () => {
      const css = generateOpticalCSS();
      expect(css).not.toContain('[data-visual-weight="solid"] + [data-visual-weight="outlined"]');
    });
    test("number of rules matches non-zero matrix entries", () => {
      const css = generateOpticalCSS();
      const nonZeroCount = Object.values(OPTICAL_ADJUSTMENT_MATRIX).filter((v) => v !== 0).length;
      const ruleCount = (css.match(/--sg-optical-adjust/g) || []).length;
      expect(ruleCount).toBe(nonZeroCount);
    });
  });
});
