// @ts-check

/**
 * Repository module for svg.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  normalizePath,
  interpolatePath,
  approximatePathLength
} from "../src/motion/svg.js";
describe("normalizePath", () => {
  test("normalizes path to target point count", () => {
    const path = "M0,0 L100,0 L100,100 L0,100";
    const normalized = normalizePath(path, 4);
    expect(normalized).toContain("M0,0");
    expect(normalized.match(/L/g)?.length).toBe(3);
  });
  test("upsamples path with fewer points", () => {
    const path = "M0,0 L100,100";
    const normalized = normalizePath(path, 5);
    expect(normalized).toContain("M0,0");
    expect(normalized.match(/L/g)?.length).toBe(4);
  });
  test("downsamples path with more points", () => {
    const path = "M0,0 L25,25 L50,50 L75,75 L100,100";
    const normalized = normalizePath(path, 3);
    expect(normalized).toContain("M0,0");
    expect(normalized.match(/L/g)?.length).toBe(2);
  });
  test("returns M0,0 for empty path", () => {
    expect(normalizePath("", 5)).toBe("M0,0");
  });
  test("returns M0,0 for zero target points", () => {
    expect(normalizePath("M10,20 L30,40", 0)).toBe("M0,0");
  });
  test("preserves exact point count", () => {
    const path = "M10,20 L30,40 L50,60";
    const normalized = normalizePath(path, 3);
    expect(normalized).toBe("M10,20 L30,40 L50,60");
  });
});
describe("interpolatePath", () => {
  test("at t=0, returns from path", () => {
    const from = "M0,0 L100,0";
    const to = "M0,0 L0,100";
    const result = interpolatePath(from, to, 0);
    expect(result).toBe("M0,0 L100,0");
  });
  test("at t=1, returns to path", () => {
    const from = "M0,0 L100,0";
    const to = "M0,0 L0,100";
    const result = interpolatePath(from, to, 1);
    expect(result).toBe("M0,0 L0,100");
  });
  test("at t=0.5, returns midpoint", () => {
    const from = "M0,0 L100,0";
    const to = "M0,0 L0,100";
    const result = interpolatePath(from, to, 0.5);
    expect(result).toBe("M0,0 L50,50");
  });
  test("handles paths with different point counts", () => {
    const from = "M0,0 L100,0";
    const to = "M0,0 L50,0 L100,0";
    const result = interpolatePath(from, to, 0.5);
    expect(result).toContain("M");
  });
  test("handles single-point paths", () => {
    const from = "M0,0";
    const to = "M100,100";
    const result = interpolatePath(from, to, 0.5);
    expect(result).toBe("M50,50");
  });
});
describe("approximatePathLength", () => {
  test("computes horizontal line length", () => {
    const length = approximatePathLength("M0,0 L100,0");
    expect(length).toBeCloseTo(100, 5);
  });
  test("computes vertical line length", () => {
    const length = approximatePathLength("M0,0 L0,50");
    expect(length).toBeCloseTo(50, 5);
  });
  test("computes diagonal length", () => {
    const length = approximatePathLength("M0,0 L30,40");
    expect(length).toBeCloseTo(50, 5);
  });
  test("computes multi-segment length", () => {
    const length = approximatePathLength("M0,0 L100,0 L100,100");
    expect(length).toBeCloseTo(200, 5);
  });
  test("returns 0 for single point", () => {
    expect(approximatePathLength("M50,50")).toBe(0);
  });
  test("returns 0 for empty path", () => {
    expect(approximatePathLength("")).toBe(0);
  });
  test("handles square path perimeter", () => {
    const length = approximatePathLength("M0,0 L100,0 L100,100 L0,100 L0,0");
    expect(length).toBeCloseTo(400, 5);
  });
});
