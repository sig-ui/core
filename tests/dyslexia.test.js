// @ts-check

/**
 * Repository module for dyslexia.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  getDyslexiaAdjustments,
  applyDyslexiaLineHeight
} from "../src/typography/dyslexia.js";
describe("getDyslexiaAdjustments", () => {
  test("returns Zorzi et al. research-backed values", () => {
    const adj = getDyslexiaAdjustments();
    expect(adj.letterSpacingOffset).toBe("+0.05em");
    expect(adj.wordSpacingOffset).toBe("+0.1em");
    expect(adj.lineHeightOffset).toBe(0.2);
    expect(adj.paragraphSpacing).toBe("2em");
  });
  test("all string values contain em units", () => {
    const adj = getDyslexiaAdjustments();
    expect(adj.letterSpacingOffset).toContain("em");
    expect(adj.wordSpacingOffset).toContain("em");
    expect(adj.paragraphSpacing).toContain("em");
  });
  test("lineHeightOffset is a positive number", () => {
    const adj = getDyslexiaAdjustments();
    expect(adj.lineHeightOffset).toBeGreaterThan(0);
  });
});
describe("applyDyslexiaLineHeight", () => {
  test("adds 0.2 to base line height", () => {
    expect(applyDyslexiaLineHeight(1.5)).toBeCloseTo(1.7, 4);
    expect(applyDyslexiaLineHeight(1.2)).toBeCloseTo(1.4, 4);
    expect(applyDyslexiaLineHeight(1.55)).toBeCloseTo(1.75, 4);
  });
  test("result is always greater than input", () => {
    for (const base of [1, 1.2, 1.4, 1.55, 1.8, 2]) {
      expect(applyDyslexiaLineHeight(base)).toBeGreaterThan(base);
    }
  });
});
