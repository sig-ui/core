// @ts-check

/**
 * Repository module for gesture.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  computeVelocity,
  detectSwipe,
  applyDragConstraint,
  elasticDisplacement
} from "../src/motion/gesture.js";
describe("computeVelocity", () => {
  test("returns zero for empty samples", () => {
    const vel = computeVelocity([], 1000);
    expect(vel.x).toBe(0);
    expect(vel.y).toBe(0);
  });
  test("returns zero for single sample", () => {
    const samples = [
      { point: { x: 100, y: 200 }, time: 950 }
    ];
    const vel = computeVelocity(samples, 1000);
    expect(vel.x).toBe(0);
    expect(vel.y).toBe(0);
  });
  test("computes correct velocity from samples", () => {
    const samples = [
      { point: { x: 0, y: 0 }, time: 900 },
      { point: { x: 100, y: 50 }, time: 950 },
      { point: { x: 200, y: 100 }, time: 1000 }
    ];
    const vel = computeVelocity(samples, 1000);
    expect(vel.x).toBe(2000);
    expect(vel.y).toBe(1000);
  });
  test("filters stale samples outside window", () => {
    const samples = [
      { point: { x: 0, y: 0 }, time: 500 },
      { point: { x: 100, y: 0 }, time: 700 },
      { point: { x: 200, y: 0 }, time: 920 },
      { point: { x: 300, y: 0 }, time: 1000 }
    ];
    const vel = computeVelocity(samples, 1000, 100);
    expect(vel.x).toBe(1250);
  });
  test("handles custom window size", () => {
    const samples = [
      { point: { x: 0, y: 0 }, time: 800 },
      { point: { x: 500, y: 0 }, time: 1000 }
    ];
    const vel = computeVelocity(samples, 1000, 250);
    expect(vel.x).toBe(2500);
  });
  test("returns zero when all samples have same timestamp", () => {
    const samples = [
      { point: { x: 0, y: 0 }, time: 1000 },
      { point: { x: 100, y: 0 }, time: 1000 }
    ];
    const vel = computeVelocity(samples, 1000);
    expect(vel.x).toBe(0);
    expect(vel.y).toBe(0);
  });
});
describe("detectSwipe", () => {
  test("detects left swipe", () => {
    const dir = detectSwipe({ x: -500, y: 0 }, { x: -50, y: 0 });
    expect(dir).toBe("left");
  });
  test("detects right swipe", () => {
    const dir = detectSwipe({ x: 500, y: 0 }, { x: 50, y: 0 });
    expect(dir).toBe("right");
  });
  test("detects up swipe", () => {
    const dir = detectSwipe({ x: 0, y: -500 }, { x: 0, y: -50 });
    expect(dir).toBe("up");
  });
  test("detects down swipe", () => {
    const dir = detectSwipe({ x: 0, y: 500 }, { x: 0, y: 50 });
    expect(dir).toBe("down");
  });
  test("returns null for slow velocity", () => {
    const dir = detectSwipe({ x: -100, y: 0 }, { x: -50, y: 0 });
    expect(dir).toBeNull();
  });
  test("returns null for small displacement", () => {
    const dir = detectSwipe({ x: -500, y: 0 }, { x: -10, y: 0 });
    expect(dir).toBeNull();
  });
  test("uses custom thresholds", () => {
    const dir = detectSwipe({ x: -200, y: 0 }, { x: -15, y: 0 }, { velocityThreshold: 100, displacementThreshold: 10 });
    expect(dir).toBe("left");
  });
  test("picks dominant axis (horizontal)", () => {
    const dir = detectSwipe({ x: 500, y: 400 }, { x: 50, y: 40 });
    expect(dir).toBe("right");
  });
  test("picks dominant axis (vertical)", () => {
    const dir = detectSwipe({ x: 100, y: -500 }, { x: 10, y: -50 });
    expect(dir).toBe("up");
  });
  test("threshold boundary: exactly at velocity threshold", () => {
    const dir = detectSwipe({ x: 300, y: 0 }, { x: 20, y: 0 });
    expect(dir).toBe("right");
  });
});
describe("applyDragConstraint", () => {
  test("passes through when no constraints", () => {
    const result = applyDragConstraint({ x: 50, y: 75 }, {});
    expect(result.x).toBe(50);
    expect(result.y).toBe(75);
  });
  test("locks to x axis", () => {
    const result = applyDragConstraint({ x: 50, y: 75 }, { axis: "x" });
    expect(result.x).toBe(50);
    expect(result.y).toBe(0);
  });
  test("locks to y axis", () => {
    const result = applyDragConstraint({ x: 50, y: 75 }, { axis: "y" });
    expect(result.x).toBe(0);
    expect(result.y).toBe(75);
  });
  test("clamps to min bounds", () => {
    const result = applyDragConstraint({ x: -20, y: -30 }, { min: { x: 0, y: 0 } });
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });
  test("clamps to max bounds", () => {
    const result = applyDragConstraint({ x: 200, y: 300 }, { max: { x: 100, y: 100 } });
    expect(result.x).toBe(100);
    expect(result.y).toBe(100);
  });
  test("applies both axis lock and bounds", () => {
    const result = applyDragConstraint({ x: 200, y: 50 }, { axis: "x", max: { x: 100, y: 100 } });
    expect(result.x).toBe(100);
    expect(result.y).toBe(0);
  });
  test("values within bounds pass through", () => {
    const result = applyDragConstraint({ x: 50, y: 50 }, { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } });
    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
  });
});
describe("elasticDisplacement", () => {
  test("returns 0 for 0 displacement", () => {
    expect(elasticDisplacement(0)).toBe(0);
  });
  test("small displacement is nearly linear", () => {
    const result = elasticDisplacement(1);
    expect(result).toBeCloseTo(1, 0);
    expect(result).toBeLessThan(1);
  });
  test("approaches maxDrag asymptotically", () => {
    const result = elasticDisplacement(1000, 100);
    expect(result).toBeCloseTo(100, 1);
    expect(result).toBeLessThan(100);
  });
  test("preserves sign for negative displacement", () => {
    const result = elasticDisplacement(-50, 100);
    expect(result).toBeLessThan(0);
    expect(Math.abs(result)).toBeLessThan(50);
  });
  test("respects custom maxDrag", () => {
    const result = elasticDisplacement(500, 50);
    expect(result).toBeCloseTo(50, 1);
  });
  test("returns 0 for zero maxDrag", () => {
    expect(elasticDisplacement(100, 0)).toBe(0);
  });
  test("returns 0 for negative maxDrag", () => {
    expect(elasticDisplacement(100, -50)).toBe(0);
  });
  test("at half maxDrag, result is about 39.3% of max", () => {
    const result = elasticDisplacement(50, 100);
    expect(result).toBeCloseTo(39.35, 0);
  });
});
