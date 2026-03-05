// @ts-check

/**
 * Repository module for fluid spacing.test.
 * @module
 */
import { describe, test, expect } from "bun:test";
import { fluidSpacing, fluidSpacingScale } from "../src/spacing/fluid.js";
describe("fluidSpacing", () => {
  test("produces valid clamp() strings", () => {
    const result = fluidSpacing(12, 20);
    expect(result).toMatch(/^clamp\(.+rem,.+,.+rem\)$/);
    expect(result).toContain("min(");
    expect(result).toContain("vw");
  });
  test("returns static rem for equal min and max", () => {
    const result = fluidSpacing(16, 16);
    expect(result).toBe("1rem");
  });
  test("returns '0' when both min and max are zero", () => {
    const result = fluidSpacing(0, 0);
    expect(result).toBe("0");
  });
  test("min bound is in rem", () => {
    const result = fluidSpacing(12, 20);
    expect(result).toContain("clamp(0.75rem");
  });
  test("max bound is in rem", () => {
    const result = fluidSpacing(12, 20);
    expect(result).toContain("1.25rem)");
  });
  test("custom viewport options work", () => {
    const result = fluidSpacing(12, 20, { minVw: 25, maxVw: 100 });
    expect(result).toMatch(/^clamp\(/);
    const defaultResult = fluidSpacing(12, 20);
    expect(result).not.toBe(defaultResult);
  });
  test("linear easing can be explicitly selected (opt-out)", () => {
    const result = fluidSpacing(12, 20, { fluidEasing: "linear" });
    expect(result).not.toContain("min(");
    expect(result).toContain("vw");
  });
  test("ease-out and linear produce different preferred values", () => {
    const eased = fluidSpacing(12, 20, { fluidEasing: "ease-out" });
    const linear = fluidSpacing(12, 20, { fluidEasing: "linear" });
    expect(eased).not.toBe(linear);
  });
});
describe("fluidSpacingScale", () => {
  test("covers all canonical spacing tokens", () => {
    const scale = fluidSpacingScale();
    const expected = [
      "0",
      "px",
      "0.5",
      "1",
      "1.5",
      "2",
      "3",
      "4",
      "5",
      "6",
      "8",
      "10",
      "12",
      "16",
      "20",
      "24"
    ];
    for (const name of expected) {
      expect(scale.has(name)).toBe(true);
    }
  });
  test("token '0' remains static", () => {
    const scale = fluidSpacingScale();
    expect(scale.get("0")).toBe("0");
  });
  test("token 'px' remains static (no fluid)", () => {
    const scale = fluidSpacingScale();
    const pxValue = scale.get("px");
    expect(pxValue).not.toContain("clamp");
    expect(pxValue).toContain("rem");
  });
  test("non-static tokens produce clamp() values", () => {
    const scale = fluidSpacingScale();
    for (const [name, value] of scale) {
      if (name === "0" || name === "px")
        continue;
      expect(value).toMatch(/^clamp\(/);
    }
  });
  test("clamp min < clamp max for positive tokens", () => {
    const scale = fluidSpacingScale();
    for (const [name, value] of scale) {
      if (name === "0" || name === "px")
        continue;
      const match = value.match(/^clamp\((.+?)rem,.*,\s*(.+?)rem\)$/);
      expect(match).not.toBeNull();
      const min = parseFloat(match[1]);
      const max = parseFloat(match[2]);
      expect(min).toBeLessThan(max);
    }
  });
  test("custom baseUnit changes values", () => {
    const defaultScale = fluidSpacingScale();
    const largerScale = fluidSpacingScale({ baseUnit: 8 });
    const default4 = defaultScale.get("4");
    const larger4 = largerScale.get("4");
    expect(default4).not.toBe(larger4);
  });
  test("custom viewport range changes clamp values", () => {
    const defaultScale = fluidSpacingScale();
    const customScale = fluidSpacingScale({ minVw: 25, maxVw: 100 });
    const default4 = defaultScale.get("4");
    const custom4 = customScale.get("4");
    expect(default4).not.toBe(custom4);
  });
  test("optical multiplier is composed into clamp min bound", () => {
    const scale = fluidSpacingScale();
    const value = scale.get("4");
    expect(value).toContain("clamp(0.9rem");
  });
  test("touch floor prevents compacting large tokens below 44px", () => {
    const scale = fluidSpacingScale();
    const value = scale.get("12");
    expect(value).toContain("clamp(2.75rem");
  });
  test("extended tokens are included when requested", () => {
    const scale = fluidSpacingScale({ includeExtended: true });
    expect(scale.has("2.5")).toBe(true);
    expect(scale.has("3.5")).toBe(true);
  });
});
