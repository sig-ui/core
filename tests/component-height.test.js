// @ts-check

/**
 * Repository module for component height.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  computeComponentHeight,
  VERTICAL_PADDING_PRESETS
} from "../src/spacing/component-height.js";
describe("VERTICAL_PADDING_PRESETS", () => {
  test("contains compact, comfortable, spacious", () => {
    expect(VERTICAL_PADDING_PRESETS.compact).toBe(4);
    expect(VERTICAL_PADDING_PRESETS.comfortable).toBe(8);
    expect(VERTICAL_PADDING_PRESETS.spacious).toBe(12);
  });
});
describe("computeComponentHeight", () => {
  test("default comfortable padding: round_to_4(24.8 + 2×8) = 40 → clamped to 44px", () => {
    const result = computeComponentHeight({
      bodyLineHeightPx: 24.8
    });
    expect(result.height).toBe(44);
    expect(result.clampedByTouch).toBe(true);
  });
  test("compact padding: round_to_4(24.8 + 2×4) = 32 → clamped to 44px", () => {
    const result = computeComponentHeight({
      bodyLineHeightPx: 24.8,
      verticalPadding: VERTICAL_PADDING_PRESETS.compact
    });
    expect(result.height).toBe(44);
    expect(result.clampedByTouch).toBe(true);
  });
  test("spacious padding: round_to_4(24.8 + 2×12) = 48 → not clamped", () => {
    const result = computeComponentHeight({
      bodyLineHeightPx: 24.8,
      verticalPadding: VERTICAL_PADDING_PRESETS.spacious
    });
    expect(result.height).toBe(48);
    expect(result.clampedByTouch).toBe(false);
  });
  test("custom touch minimum overrides default 44px", () => {
    const result = computeComponentHeight({
      bodyLineHeightPx: 20,
      verticalPadding: 4,
      touchMinimum: 36
    });
    expect(result.height).toBe(36);
    expect(result.clampedByTouch).toBe(true);
  });
  test("large line height avoids touch clamping", () => {
    const result = computeComponentHeight({
      bodyLineHeightPx: 32,
      verticalPadding: 8
    });
    expect(result.height).toBe(48);
    expect(result.clampedByTouch).toBe(false);
  });
  test("custom grid unit affects snapping", () => {
    const result = computeComponentHeight({
      bodyLineHeightPx: 24.8,
      verticalPadding: 8,
      gridUnit: 8
    });
    expect(result.height).toBe(44);
  });
  test("result height is always at least touchMinimum", () => {
    for (const lineHeight of [10, 15, 20, 25, 30, 40]) {
      const result = computeComponentHeight({
        bodyLineHeightPx: lineHeight
      });
      expect(result.height).toBeGreaterThanOrEqual(44);
    }
  });
  test("height is always a multiple of gridUnit when not clamped", () => {
    const result = computeComponentHeight({
      bodyLineHeightPx: 28,
      verticalPadding: 12,
      gridUnit: 4
    });
    expect(result.height % 4).toBe(0);
    expect(result.clampedByTouch).toBe(false);
  });
});
