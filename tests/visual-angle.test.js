// @ts-check

/**
 * Repository module for visual angle.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  computeBodyFromViewingAngle,
  VIEWING_ANGLE_K,
  DEVICE_PRESETS
} from "../src/typography/visual-angle.js";
describe("VIEWING_ANGLE_K", () => {
  test("is 0.005 radians", () => {
    expect(VIEWING_ANGLE_K).toBe(0.005);
  });
});
describe("DEVICE_PRESETS", () => {
  test("contains standard device categories", () => {
    expect(DEVICE_PRESETS).toHaveProperty("watch");
    expect(DEVICE_PRESETS).toHaveProperty("phone");
    expect(DEVICE_PRESETS).toHaveProperty("tablet");
    expect(DEVICE_PRESETS).toHaveProperty("desktop");
    expect(DEVICE_PRESETS).toHaveProperty("tv");
  });
  test("all presets have positive viewing distance and PPI", () => {
    for (const preset of Object.values(DEVICE_PRESETS)) {
      expect(preset.viewingDistanceCm).toBeGreaterThan(0);
      expect(preset.screenPpi).toBeGreaterThan(0);
    }
  });
});
describe("computeBodyFromViewingAngle", () => {
  test("phone preset (37cm, 160ppi) produces ~11.7px body size", () => {
    const result = computeBodyFromViewingAngle(DEVICE_PRESETS.phone);
    expect(result.bodySizePx).toBeCloseTo(11.65, 0);
    expect(result.bodySizeRem).toBeGreaterThan(0);
  });
  test("desktop preset (60cm, 96ppi) produces ~11.3px body size", () => {
    const result = computeBodyFromViewingAngle(DEVICE_PRESETS.desktop);
    expect(result.bodySizePx).toBeCloseTo(11.34, 0);
  });
  test("returns valid scale step", () => {
    const validSteps = new Set([
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
    ]);
    for (const preset of Object.values(DEVICE_PRESETS)) {
      const result = computeBodyFromViewingAngle(preset);
      expect(validSteps.has(result.nearestScaleStep)).toBe(true);
    }
  });
  test("custom conditions produce consistent results", () => {
    const result = computeBodyFromViewingAngle({
      viewingDistanceCm: 50,
      screenPpi: 110
    });
    expect(result.bodySizePx).toBeCloseTo(10.83, 0);
  });
  test("bodySizeRem is bodySizePx / 16", () => {
    const result = computeBodyFromViewingAngle(DEVICE_PRESETS.desktop);
    expect(result.bodySizeRem).toBeCloseTo(result.bodySizePx / 16, 3);
  });
  test("TV preset (300cm, 40ppi) produces reasonable body size", () => {
    const result = computeBodyFromViewingAngle(DEVICE_PRESETS.tv);
    expect(result.bodySizePx).toBeCloseTo(23.62, 0);
  });
});
