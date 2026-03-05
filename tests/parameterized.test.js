// @ts-check

/**
 * Repository module for parameterized.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { getBorderRadiusScale } from "../src/elevation/border.js";
import { getDurationScale, getScaledDurationScale } from "../src/motion/duration.js";
import { getSpringPresets } from "../src/motion/spring.js";
describe("getBorderRadiusScale with overrides", () => {
  test("no overrides returns default scale", () => {
    const scale = getBorderRadiusScale();
    expect(scale.sm).toBe(4);
    expect(scale.md).toBe(8);
    expect(scale.lg).toBe(12);
    expect(scale.none).toBe(0);
    expect(scale.full).toBe(9999);
  });
  test("overrides replace specific stops", () => {
    const scale = getBorderRadiusScale({ md: 10, lg: 16 });
    expect(scale.md).toBe(10);
    expect(scale.lg).toBe(16);
    expect(scale.sm).toBe(4);
    expect(scale.xl).toBe(16);
  });
  test("none and full are never overridden", () => {
    const scale = getBorderRadiusScale({ sm: 0, md: 0, lg: 0, xl: 0, "2xl": 0 });
    expect(scale.none).toBe(0);
    expect(scale.full).toBe(9999);
  });
  test("single override leaves others unchanged", () => {
    const scale = getBorderRadiusScale({ "2xl": 48 });
    expect(scale.sm).toBe(4);
    expect(scale.md).toBe(8);
    expect(scale.lg).toBe(12);
    expect(scale.xl).toBe(16);
    expect(scale["2xl"]).toBe(48);
  });
});
describe("getScaledDurationScale", () => {
  const base = getDurationScale();
  test("factor 1.0 returns same values", () => {
    const scaled = getScaledDurationScale(base, 1);
    expect(scaled.instant).toBe(0);
    expect(scaled.fast).toBe(100);
    expect(scaled.normal).toBe(200);
    expect(scaled.slower).toBe(500);
  });
  test("factor 0.5 halves all durations", () => {
    const scaled = getScaledDurationScale(base, 0.5);
    expect(scaled.instant).toBe(0);
    expect(scaled.faster).toBe(25);
    expect(scaled.fast).toBe(50);
    expect(scaled.normal).toBe(100);
    expect(scaled.moderate).toBe(150);
    expect(scaled.slow).toBe(200);
    expect(scaled.slower).toBe(250);
  });
  test("factor 2.0 doubles all durations", () => {
    const scaled = getScaledDurationScale(base, 2);
    expect(scaled.fast).toBe(200);
    expect(scaled.normal).toBe(400);
    expect(scaled.slower).toBe(1000);
  });
  test("factor 0.05 (instant preset) near-zeros durations", () => {
    const scaled = getScaledDurationScale(base, 0.05);
    expect(scaled.normal).toBe(10);
    expect(scaled.fast).toBe(5);
  });
  test("values are rounded to integers", () => {
    const scaled = getScaledDurationScale(base, 0.33);
    expect(scaled.normal).toBe(66);
    expect(scaled.fast).toBe(33);
    expect(scaled.faster).toBe(17);
  });
});
describe("getSpringPresets with overrides", () => {
  test("no overrides returns default presets", () => {
    const presets = getSpringPresets();
    expect(presets.snappy.stiffness).toBe(300);
    expect(presets.default.stiffness).toBe(200);
    expect(presets.gentle.stiffness).toBe(120);
    expect(presets.bouncy.stiffness).toBe(200);
    expect(presets.bouncy.damping).toBe(10);
  });
  test("overrides replace specific presets", () => {
    const presets = getSpringPresets({
      bouncy: { stiffness: 180, damping: 8, mass: 1 }
    });
    expect(presets.bouncy.stiffness).toBe(180);
    expect(presets.bouncy.damping).toBe(8);
    expect(presets.snappy.stiffness).toBe(300);
  });
  test("overrides for unknown presets are ignored", () => {
    const presets = getSpringPresets({
      custom: { stiffness: 100, damping: 5, mass: 0.5 }
    });
    expect(presets.custom).toBeUndefined();
    expect(presets.snappy.stiffness).toBe(300);
  });
});
