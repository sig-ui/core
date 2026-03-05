// @ts-check

/**
 * Repository module for cvd.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { simulateCVD } from "../src/cvd/simulate.js";
import { validateCvdPair, validateCategoricalPalette } from "../src/cvd/validate.js";
import { toOklch } from "../src/color-space/oklch.js";
import { deltaEOK } from "../src/gamut/delta.js";
describe("CVD simulation", () => {
  test("severity 0 returns original color", () => {
    const red = toOklch("#ff0000");
    const sim = simulateCVD(red, "protan", 0);
    expect(sim.l).toBeCloseTo(red.l, 5);
    expect(sim.c).toBeCloseTo(red.c, 5);
    expect(deltaEOK(red, sim)).toBeLessThan(0.001);
  });
  test("deuteranopia shifts green toward brown/yellow", () => {
    const green = toOklch("#00ff00");
    const sim = simulateCVD(green, "deutan", 1);
    expect(deltaEOK(green, sim)).toBeGreaterThan(0.05);
  });
  test("protanopia affects red perception", () => {
    const red = toOklch("#ff0000");
    const sim = simulateCVD(red, "protan", 1);
    expect(sim.c).toBeLessThan(red.c);
  });
  test("tritanopia affects blue-yellow axis", () => {
    const blue = toOklch("#0000ff");
    const sim = simulateCVD(blue, "tritan", 1);
    expect(deltaEOK(blue, sim)).toBeGreaterThan(0.01);
  });
  test("accepts string input", () => {
    const sim = simulateCVD("#ff0000", "deutan", 1);
    expect(sim.l).toBeGreaterThan(0);
  });
  test("intermediate severity interpolates", () => {
    const color = toOklch("#ff0000");
    const half = simulateCVD(color, "protan", 0.5);
    const full = simulateCVD(color, "protan", 1);
    const distHalf = deltaEOK(color, half);
    const distFull = deltaEOK(color, full);
    expect(distHalf).toBeLessThan(distFull);
  });
});
describe("CVD pair validation", () => {
  test("success/danger pair: known CVD risk", () => {
    const result = validateCvdPair("#22c55e", "#ef4444");
    expect(result.minDelta).toBeGreaterThan(0);
    expect(["protan", "deutan"]).toContain(result.worstType);
  });
  test("very different colors pass easily", () => {
    const result = validateCvdPair("#000000", "#ffffff");
    expect(result.pass).toBe(true);
    expect(result.minDelta).toBeGreaterThan(0.5);
  });
  test("identical colors fail", () => {
    const result = validateCvdPair("#ff0000", "#ff0000");
    expect(result.pass).toBe(false);
    expect(result.minDelta).toBeCloseTo(0, 3);
  });
});
describe("categorical palette validation", () => {
  test("diverse palette passes", () => {
    const colors = ["#000000", "#ffffff", "#ff0000", "#0000ff"];
    const result = validateCategoricalPalette(colors);
    expect(result.pass).toBe(true);
  });
  test("similar colors may fail", () => {
    const colors = ["#ff0000", "#ff0500"];
    const result = validateCategoricalPalette(colors);
    expect(result.pass).toBe(false);
  });
  test("returns failing pair details", () => {
    const colors = ["#ff0000", "#ff0500"];
    const result = validateCategoricalPalette(colors);
    if (!result.pass) {
      expect(result.failingPairs.length).toBeGreaterThan(0);
      expect(result.failingPairs[0].i).toBe(0);
      expect(result.failingPairs[0].j).toBe(1);
    }
  });
});
