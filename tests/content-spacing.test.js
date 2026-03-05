// @ts-check

/**
 * Repository module for content spacing.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { computeContentSpacing } from "../src/spacing/content-spacing.js";
describe("computeContentSpacing", () => {
  test("paragraph spacing ~0.75× body line-height, snapped to 4px grid", () => {
    const result = computeContentSpacing(16, 1.55);
    expect(result.paragraphSpacing).toBe(20);
  });
  test("heading top margin ~1.5× body line-height, snapped to 4px grid", () => {
    const result = computeContentSpacing(16, 1.55);
    expect(result.headingTopMargin).toBe(36);
  });
  test("heading bottom margin ~0.5× body line-height, snapped to 4px grid", () => {
    const result = computeContentSpacing(16, 1.55);
    expect(result.headingBottomMargin).toBe(12);
  });
  test("all values snap to 4px grid", () => {
    const result = computeContentSpacing(16, 1.55);
    expect(result.paragraphSpacing % 4).toBe(0);
    expect(result.headingTopMargin % 4).toBe(0);
    expect(result.headingBottomMargin % 4).toBe(0);
  });
  test("custom grid unit snaps accordingly", () => {
    const result = computeContentSpacing(16, 1.55, { gridUnit: 8 });
    expect(result.paragraphSpacing % 8).toBe(0);
    expect(result.headingTopMargin % 8).toBe(0);
    expect(result.headingBottomMargin % 8).toBe(0);
  });
  test("larger font sizes scale spacing proportionally", () => {
    const small = computeContentSpacing(14, 1.55);
    const large = computeContentSpacing(20, 1.55);
    expect(large.paragraphSpacing).toBeGreaterThanOrEqual(small.paragraphSpacing);
    expect(large.headingTopMargin).toBeGreaterThanOrEqual(small.headingTopMargin);
  });
  test("headingTopMargin > headingBottomMargin for visual hierarchy", () => {
    const result = computeContentSpacing(16, 1.55);
    expect(result.headingTopMargin).toBeGreaterThan(result.headingBottomMargin);
  });
  test("all values are positive", () => {
    const result = computeContentSpacing(16, 1.55);
    expect(result.paragraphSpacing).toBeGreaterThan(0);
    expect(result.headingTopMargin).toBeGreaterThan(0);
    expect(result.headingBottomMargin).toBeGreaterThan(0);
  });
});
