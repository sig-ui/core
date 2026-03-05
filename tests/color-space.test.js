// @ts-check

/**
 * Repository module for color space.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { parseHex, toHex, srgbToLinearRgb, linearRgbToSrgb, srgbToLinear, linearToSrgb } from "../src/color-space/srgb.js";
import { linearRgbToOklab, oklabToLinearRgb, oklabToOklch, oklchToOklab, toOklch, fromOklch } from "../src/color-space/oklch.js";
describe("sRGB", () => {
  test("parseHex #RRGGBB", () => {
    const c = parseHex("#ff8000");
    expect(c.r).toBe(255);
    expect(c.g).toBe(128);
    expect(c.b).toBe(0);
    expect(c.alpha).toBe(1);
  });
  test("parseHex #RGB shorthand", () => {
    const c = parseHex("#f80");
    expect(c.r).toBe(255);
    expect(c.g).toBe(136);
    expect(c.b).toBe(0);
  });
  test("parseHex #RRGGBBAA", () => {
    const c = parseHex("#ff000080");
    expect(c.r).toBe(255);
    expect(c.g).toBe(0);
    expect(c.b).toBe(0);
    expect(c.alpha).toBeCloseTo(0.502, 2);
  });
  test("toHex", () => {
    expect(toHex({ r: 255, g: 128, b: 0, alpha: 1 })).toBe("#ff8000");
    expect(toHex({ r: 0, g: 0, b: 0, alpha: 1 })).toBe("#000000");
    expect(toHex({ r: 255, g: 255, b: 255, alpha: 1 })).toBe("#ffffff");
  });
  test("toHex with alpha", () => {
    const hex = toHex({ r: 255, g: 0, b: 0, alpha: 0.5 });
    expect(hex).toBe("#ff000080");
  });
  test("sRGB transfer function roundtrip", () => {
    for (const v of [0, 0.01, 0.04, 0.04045, 0.05, 0.25, 0.5, 0.75, 1]) {
      const linear = srgbToLinear(v);
      const back = linearToSrgb(linear);
      expect(back).toBeCloseTo(v, 6);
    }
  });
  test("srgbToLinearRgb and back", () => {
    const srgb = { r: 128, g: 64, b: 255, alpha: 1 };
    const linear = srgbToLinearRgb(srgb);
    const back = linearRgbToSrgb(linear);
    expect(back.r).toBe(128);
    expect(back.g).toBe(64);
    expect(back.b).toBe(255);
  });
});
describe("OKLab/OKLCH", () => {
  test("linearRgb → OKLab → linearRgb roundtrip", () => {
    const inputs = [
      { r: 1, g: 0, b: 0 },
      { r: 0, g: 1, b: 0 },
      { r: 0, g: 0, b: 1 },
      { r: 1, g: 1, b: 1 },
      { r: 0, g: 0, b: 0 },
      { r: 0.5, g: 0.3, b: 0.8 }
    ];
    for (const rgb of inputs) {
      const lab = linearRgbToOklab(rgb);
      const back = oklabToLinearRgb(lab);
      expect(back.r).toBeCloseTo(rgb.r, 5);
      expect(back.g).toBeCloseTo(rgb.g, 5);
      expect(back.b).toBeCloseTo(rgb.b, 5);
    }
  });
  test("OKLab → OKLCH → OKLab roundtrip", () => {
    const lab = { L: 0.6, a: 0.1, b: -0.15, alpha: 1 };
    const lch = oklabToOklch(lab);
    const back = oklchToOklab(lch);
    expect(back.L).toBeCloseTo(lab.L, 8);
    expect(back.a).toBeCloseTo(lab.a, 8);
    expect(back.b).toBeCloseTo(lab.b, 8);
  });
  test("white has L ≈ 1, C ≈ 0", () => {
    const white = toOklch("#ffffff");
    expect(white.l).toBeCloseTo(1, 3);
    expect(white.c).toBeCloseTo(0, 3);
  });
  test("black has L ≈ 0, C ≈ 0", () => {
    const black = toOklch("#000000");
    expect(black.l).toBeCloseTo(0, 3);
    expect(black.c).toBeCloseTo(0, 3);
  });
  test("pure red has known OKLCH values", () => {
    const red = toOklch("#ff0000");
    expect(red.l).toBeCloseTo(0.6279, 2);
    expect(red.c).toBeCloseTo(0.2577, 2);
    expect(red.h).toBeCloseTo(29.23, 0);
  });
});
describe("toOklch / fromOklch roundtrip", () => {
  const testColors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ff8000",
    "#808080",
    "#123456",
    "#abcdef"
  ];
  for (const hex of testColors) {
    test(`roundtrip ${hex}`, () => {
      const oklch = toOklch(hex);
      const backHex = fromOklch(oklch, "hex");
      const orig = parseHex(hex);
      const result = parseHex(backHex);
      expect(Math.abs(orig.r - result.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(orig.g - result.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(orig.b - result.b)).toBeLessThanOrEqual(1);
    });
  }
});
describe("format outputs", () => {
  test("fromOklch oklch format", () => {
    const str = fromOklch({ l: 0.5, c: 0.15, h: 250, alpha: 1 });
    expect(str).toMatch(/^oklch\(0\.5 0\.15 250\)$/);
  });
  test("fromOklch oklch format with alpha", () => {
    const str = fromOklch({ l: 0.5, c: 0.15, h: 250, alpha: 0.5 });
    expect(str).toContain("/ 0.5");
  });
  test("fromOklch rgb format", () => {
    const str = fromOklch({ l: 0.5, c: 0, h: 0, alpha: 1 }, "rgb");
    expect(str).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
  });
  test("fromOklch hsl format", () => {
    const str = fromOklch({ l: 0.5, c: 0, h: 0, alpha: 1 }, "hsl");
    expect(str).toMatch(/^hsl\(/);
  });
});
describe("parse various formats", () => {
  test("parse oklch() string", () => {
    const c = toOklch("oklch(0.5 0.15 250)");
    expect(c.l).toBe(0.5);
    expect(c.c).toBe(0.15);
    expect(c.h).toBe(250);
    expect(c.alpha).toBe(1);
  });
  test("parse oklch() with alpha", () => {
    const c = toOklch("oklch(0.5 0.15 250 / 0.8)");
    expect(c.alpha).toBe(0.8);
  });
  test("parse rgb() string", () => {
    const c = toOklch("rgb(255, 0, 0)");
    expect(c.l).toBeCloseTo(0.6279, 2);
  });
  test("parse hsl() string", () => {
    const c = toOklch("hsl(0, 100%, 50%)");
    expect(c.l).toBeCloseTo(0.6279, 2);
  });
});
