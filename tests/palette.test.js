// @ts-check

/**
 * Repository module for palette.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { generatePalette } from "../src/palette.js";
import { apcaContrast, toOklch } from "../src/index.js";
import { LC_TARGETS, ALL_STOPS } from "../src/generation/targets.js";
describe("generatePalette", () => {
  test("generates complete palette with hex output", () => {
    const result = generatePalette("#6366f1", { background: "#ffffff" });
    expect(result.ramp).toBeDefined();
    expect(result.formatted).toBeDefined();
    for (const stop of ALL_STOPS) {
      expect(result.formatted[stop]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
  test("generates oklch format output", () => {
    const result = generatePalette("#6366f1", {
      background: "#ffffff",
      format: "oklch"
    });
    for (const stop of ALL_STOPS) {
      expect(result.formatted[stop]).toMatch(/^oklch\(/);
    }
  });
  test("light mode shades hit APCA targets", () => {
    const bg = "#f8fafc";
    const result = generatePalette("#3b82f6", { background: bg });
    const bgOklch = toOklch(bg);
    for (const stop of ALL_STOPS) {
      const shade = result.ramp[stop];
      const actualLc = Math.abs(apcaContrast(shade, bgOklch));
      const targetLc = LC_TARGETS.light[stop];
      expect(Math.abs(actualLc - targetLc)).toBeLessThan(2);
    }
  });
  test("dark mode shades hit APCA targets", () => {
    const bg = "#0f172a";
    const result = generatePalette("#3b82f6", {
      background: bg,
      mode: "dark"
    });
    const bgOklch = toOklch(bg);
    for (const stop of ALL_STOPS) {
      const shade = result.ramp[stop];
      const actualLc = Math.abs(apcaContrast(shade, bgOklch));
      const targetLc = LC_TARGETS.dark[stop];
      expect(Math.abs(actualLc - targetLc)).toBeLessThan(2);
    }
  });
  test("without extended stops, omits 50 and 950", () => {
    const result = generatePalette("#6366f1", {
      background: "#ffffff",
      extendedStops: false
    });
    expect(result.formatted[50]).toBeUndefined();
    expect(result.formatted[950]).toBeUndefined();
    expect(result.formatted[500]).toBeDefined();
  });
  test("works with various colors", () => {
    const colors = ["#22c55e", "#f59e0b", "#ef4444", "#6366f1", "#64748b"];
    for (const hex of colors) {
      const result = generatePalette(hex, { background: "#ffffff" });
      expect(Object.keys(result.formatted).length).toBe(11);
    }
  });
});
