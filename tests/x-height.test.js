// @ts-check

/**
 * Repository module for x height.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  getFontSizeAdjust,
  FONT_X_HEIGHT_RATIOS,
  needsXHeightNormalization
} from "../src/typography/x-height.js";
describe("FONT_X_HEIGHT_RATIOS", () => {
  test("contains common web fonts", () => {
    expect(FONT_X_HEIGHT_RATIOS).toHaveProperty("Inter");
    expect(FONT_X_HEIGHT_RATIOS).toHaveProperty("Roboto");
    expect(FONT_X_HEIGHT_RATIOS).toHaveProperty("Open Sans");
    expect(FONT_X_HEIGHT_RATIOS).toHaveProperty("Lato");
    expect(FONT_X_HEIGHT_RATIOS).toHaveProperty("system-ui");
  });
  test("all ratios are between 0 and 1", () => {
    for (const ratio of Object.values(FONT_X_HEIGHT_RATIOS)) {
      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThan(1);
    }
  });
  test("Inter has ratio 0.54", () => {
    expect(FONT_X_HEIGHT_RATIOS["Inter"]).toBe(0.54);
  });
  test("Roboto has ratio 0.53", () => {
    expect(FONT_X_HEIGHT_RATIOS["Roboto"]).toBe(0.53);
  });
});
describe("getFontSizeAdjust", () => {
  test("default returns '0.52'", () => {
    expect(getFontSizeAdjust()).toBe("0.52");
  });
  test("custom ratio returns that ratio as string", () => {
    expect(getFontSizeAdjust(0.54)).toBe("0.54");
    expect(getFontSizeAdjust(0.48)).toBe("0.48");
  });
});
describe("needsXHeightNormalization", () => {
  test("Inter (0.54) does not need normalization at default threshold", () => {
    expect(needsXHeightNormalization("Inter")).toBe(false);
  });
  test("Montserrat (0.48) needs normalization at default threshold", () => {
    expect(needsXHeightNormalization("Montserrat")).toBe(true);
  });
  test("Raleway (0.47) needs normalization at default threshold", () => {
    expect(needsXHeightNormalization("Raleway")).toBe(true);
  });
  test("PT Sans (0.50) does not need normalization at default threshold 0.50", () => {
    expect(needsXHeightNormalization("PT Sans")).toBe(false);
  });
  test("custom threshold changes the decision", () => {
    expect(needsXHeightNormalization("Inter", 0.55)).toBe(true);
  });
  test("unknown fonts return true (conservative)", () => {
    expect(needsXHeightNormalization("Unknown Font")).toBe(true);
  });
});
