// @ts-check

/**
 * Repository module for contrast.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { apcaContrast } from "../src/contrast/apca.js";
import { wcag2Contrast, meetsWCAG_AA, meetsWCAG_AAA } from "../src/contrast/wcag2.js";
import {
  bridgeLcToRatio,
  bridgePcaContrast,
  meetsBridgeAA,
  meetsBridgeAAA
} from "../src/contrast/bridge-pca.js";
describe("APCA", () => {
  test("black text on white bg: positive Lc ~106", () => {
    const lc = apcaContrast("#000000", "#ffffff");
    expect(lc).toBeGreaterThan(100);
    expect(lc).toBeLessThan(115);
  });
  test("white text on black bg: negative Lc ~-108", () => {
    const lc = apcaContrast("#ffffff", "#000000");
    expect(lc).toBeLessThan(-100);
    expect(lc).toBeGreaterThan(-115);
  });
  test("same color returns 0", () => {
    const lc = apcaContrast("#808080", "#808080");
    expect(lc).toBe(0);
  });
  test("dark text on light bg is positive (BoW)", () => {
    const lc = apcaContrast("#333333", "#eeeeee");
    expect(lc).toBeGreaterThan(0);
  });
  test("light text on dark bg is negative (WoB)", () => {
    const lc = apcaContrast("#eeeeee", "#333333");
    expect(lc).toBeLessThan(0);
  });
  test("gray on white gives moderate contrast", () => {
    const lc = apcaContrast("#767676", "#ffffff");
    expect(lc).toBeGreaterThan(40);
    expect(lc).toBeLessThan(70);
  });
  test("accepts OklchColor objects", () => {
    const lc = apcaContrast({ l: 0, c: 0, h: 0, alpha: 1 }, { l: 1, c: 0, h: 0, alpha: 1 });
    expect(lc).toBeGreaterThan(100);
  });
});
describe("WCAG 2.x", () => {
  test("black on white has ratio 21:1", () => {
    const ratio = wcag2Contrast("#000000", "#ffffff");
    expect(ratio).toBeCloseTo(21, 0);
  });
  test("white on white has ratio 1:1", () => {
    const ratio = wcag2Contrast("#ffffff", "#ffffff");
    expect(ratio).toBeCloseTo(1, 1);
  });
  test("meetsWCAG_AA: black on white passes", () => {
    expect(meetsWCAG_AA("#000000", "#ffffff")).toBe(true);
  });
  test("meetsWCAG_AA: gray on white may fail", () => {
    expect(meetsWCAG_AA("#959595", "#ffffff")).toBe(false);
  });
  test("meetsWCAG_AAA: black on white passes", () => {
    expect(meetsWCAG_AAA("#000000", "#ffffff")).toBe(true);
  });
  test("meetsWCAG_AA large text: lower threshold", () => {
    expect(meetsWCAG_AA("#767676", "#ffffff", true)).toBe(true);
  });
});
describe("Bridge-PCA", () => {
  test("Lc 60 maps to ratio 4.5", () => {
    expect(bridgeLcToRatio(60)).toBeCloseTo(4.5, 1);
  });
  test("Lc 75 maps to ratio 7.0", () => {
    expect(bridgeLcToRatio(75)).toBeCloseTo(7, 1);
  });
  test("Lc 0 maps to ratio 1.0", () => {
    expect(bridgeLcToRatio(0)).toBe(1);
  });
  test("negative Lc uses absolute value", () => {
    expect(bridgeLcToRatio(-60)).toBeCloseTo(4.5, 1);
  });
  test("Lc->ratio mapping is monotonic", () => {
    let prevRatio = 0;
    for (let lc = 0;lc <= 120; lc += 5) {
      const ratio = bridgeLcToRatio(lc);
      expect(ratio).toBeGreaterThanOrEqual(prevRatio);
      prevRatio = ratio;
    }
  });
  test("black on white passes AA and AAA", () => {
    expect(meetsBridgeAA("#000000", "#ffffff")).toBe(true);
    expect(meetsBridgeAAA("#000000", "#ffffff")).toBe(true);
  });
  test("white on black passes AA and AAA", () => {
    expect(meetsBridgeAA("#ffffff", "#000000")).toBe(true);
    expect(meetsBridgeAAA("#ffffff", "#000000")).toBe(true);
  });
  test("bridgePcaContrast returns a ratio", () => {
    const ratio = bridgePcaContrast("#000000", "#ffffff");
    expect(ratio).toBeGreaterThan(10);
  });
  test("meetsBridgeAA large text uses 3:1 threshold", () => {
    expect(meetsBridgeAA("#808080", "#808080")).toBe(false);
    expect(meetsBridgeAA("#000000", "#ffffff", true)).toBe(true);
  });
});
