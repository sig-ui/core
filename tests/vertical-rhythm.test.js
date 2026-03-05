// @ts-check

/**
 * Repository module for vertical rhythm.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  computeVerticalRhythm,
  computeHeadingSpacing
} from "../src/typography/vertical-rhythm.js";
describe("computeVerticalRhythm", () => {
  test("default prose tokens match §7.3 table (4px base)", () => {
    const result = computeVerticalRhythm();
    expect(result.baseUnit).toBe(4);
    expect(result.proseTokens.proseGapXs).toBe(4);
    expect(result.proseTokens.proseGapSm).toBe(8);
    expect(result.proseTokens.proseGapBase).toBe(16);
    expect(result.proseTokens.proseGapLg).toBe(24);
    expect(result.proseTokens.proseGapXl).toBe(32);
    expect(result.proseTokens.proseGap2xl).toBe(48);
  });
  test("heading spacing: top=48px, bottom=16px (3:1 ratio)", () => {
    const result = computeVerticalRhythm();
    expect(result.headingSpacing.marginTop).toBe(48);
    expect(result.headingSpacing.marginBottom).toBe(16);
    expect(result.headingSpacing.marginTop / result.headingSpacing.marginBottom).toBe(3);
  });
  test("custom base unit scales all tokens proportionally", () => {
    const result = computeVerticalRhythm({ baseUnit: 8 });
    expect(result.baseUnit).toBe(8);
    expect(result.proseTokens.proseGapXs).toBe(8);
    expect(result.proseTokens.proseGapSm).toBe(16);
    expect(result.proseTokens.proseGapBase).toBe(32);
    expect(result.proseTokens.proseGapLg).toBe(48);
    expect(result.proseTokens.proseGapXl).toBe(64);
    expect(result.proseTokens.proseGap2xl).toBe(96);
  });
  test("all prose tokens are positive integers", () => {
    const result = computeVerticalRhythm();
    for (const value of Object.values(result.proseTokens)) {
      expect(value).toBeGreaterThan(0);
      expect(Number.isInteger(value)).toBe(true);
    }
  });
  test("prose tokens are strictly increasing", () => {
    const result = computeVerticalRhythm();
    const values = [
      result.proseTokens.proseGapXs,
      result.proseTokens.proseGapSm,
      result.proseTokens.proseGapBase,
      result.proseTokens.proseGapLg,
      result.proseTokens.proseGapXl,
      result.proseTokens.proseGap2xl
    ];
    for (let i = 1;i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});
describe("computeHeadingSpacing", () => {
  test("returns consistent heading spacing", () => {
    const result = computeHeadingSpacing(24.8);
    expect(result.marginTop).toBe(48);
    expect(result.marginBottom).toBe(16);
  });
  test("marginTop is always greater than marginBottom", () => {
    const result = computeHeadingSpacing(20);
    expect(result.marginTop).toBeGreaterThan(result.marginBottom);
  });
});
