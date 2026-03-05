// @ts-check

/**
 * Repository module for flip.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  computeFlipInversion,
  FLIP_THRESHOLD_PX
} from "../src/motion/flip.js";
describe("computeFlipInversion", () => {
  test("computes correct translation inversion", () => {
    const first = { x: 100, y: 200, width: 50, height: 50 };
    const last = { x: 150, y: 250, width: 50, height: 50 };
    const inv = computeFlipInversion(first, last);
    expect(inv.x).toBe(-50);
    expect(inv.y).toBe(-50);
    expect(inv.scaleX).toBe(1);
    expect(inv.scaleY).toBe(1);
    expect(inv.isIdentity).toBe(false);
  });
  test("computes correct scale inversion", () => {
    const first = { x: 0, y: 0, width: 100, height: 200 };
    const last = { x: 0, y: 0, width: 50, height: 100 };
    const inv = computeFlipInversion(first, last);
    expect(inv.x).toBe(0);
    expect(inv.y).toBe(0);
    expect(inv.scaleX).toBe(2);
    expect(inv.scaleY).toBe(2);
    expect(inv.isIdentity).toBe(false);
  });
  test("computes combined translation + scale", () => {
    const first = { x: 10, y: 20, width: 100, height: 80 };
    const last = { x: 30, y: 50, width: 200, height: 40 };
    const inv = computeFlipInversion(first, last);
    expect(inv.x).toBe(-20);
    expect(inv.y).toBe(-30);
    expect(inv.scaleX).toBe(0.5);
    expect(inv.scaleY).toBe(2);
  });
  test("detects identity when position unchanged", () => {
    const rect = { x: 50, y: 50, width: 100, height: 100 };
    const inv = computeFlipInversion(rect, rect);
    expect(inv.isIdentity).toBe(true);
    expect(inv.x).toBe(0);
    expect(inv.y).toBe(0);
    expect(inv.scaleX).toBe(1);
    expect(inv.scaleY).toBe(1);
  });
  test("detects identity when changes are below threshold", () => {
    const first = { x: 100, y: 100, width: 100, height: 100 };
    const last = { x: 100.5, y: 100.3, width: 100.5, height: 99.5 };
    const inv = computeFlipInversion(first, last);
    expect(inv.isIdentity).toBe(true);
  });
  test("NOT identity when displacement exceeds threshold", () => {
    const first = { x: 100, y: 100, width: 100, height: 100 };
    const last = { x: 101.5, y: 100, width: 100, height: 100 };
    const inv = computeFlipInversion(first, last);
    expect(inv.isIdentity).toBe(false);
  });
  test("NOT identity when scale deviation exceeds threshold", () => {
    const first = { x: 0, y: 0, width: 100, height: 100 };
    const last = { x: 0, y: 0, width: 90, height: 100 };
    const inv = computeFlipInversion(first, last);
    expect(inv.isIdentity).toBe(false);
  });
  test("handles zero-width last rect (no scale animation)", () => {
    const first = { x: 0, y: 0, width: 100, height: 100 };
    const last = { x: 0, y: 0, width: 0, height: 100 };
    const inv = computeFlipInversion(first, last);
    expect(inv.scaleX).toBe(1);
    expect(inv.scaleY).toBe(1);
  });
  test("handles zero-height last rect", () => {
    const first = { x: 0, y: 0, width: 100, height: 50 };
    const last = { x: 0, y: 0, width: 100, height: 0 };
    const inv = computeFlipInversion(first, last);
    expect(inv.scaleX).toBe(1);
    expect(inv.scaleY).toBe(1);
  });
  test("handles negative positions", () => {
    const first = { x: -50, y: -100, width: 80, height: 60 };
    const last = { x: 50, y: 100, width: 80, height: 60 };
    const inv = computeFlipInversion(first, last);
    expect(inv.x).toBe(-100);
    expect(inv.y).toBe(-200);
    expect(inv.isIdentity).toBe(false);
  });
  test("FLIP_THRESHOLD_PX is 1", () => {
    expect(FLIP_THRESHOLD_PX).toBe(1);
  });
  test("threshold edge case: exactly at threshold", () => {
    const first = { x: 0, y: 0, width: 100, height: 100 };
    const last = { x: -0.99, y: 0, width: 100, height: 100 };
    const inv = computeFlipInversion(first, last);
    expect(inv.isIdentity).toBe(true);
  });
});
