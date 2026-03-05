// @ts-check

/**
 * Repository module for motion.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  getDurationScale,
  computeDuration
} from "../src/motion/duration.js";
import {
  getEasingCurves,
  cubicBezier,
  easingToCss,
  tupleToCubicBezier,
  cubicBezierToTuple
} from "../src/motion/easing.js";
import {
  getSpringPresets,
  computeSpringDuration,
  springToLinear
} from "../src/motion/spring.js";
import {
  getReducedMotionAlternative,
  isReducedMotion,
  getAllReducedMotionAlternatives,
  isValidReducedMotionStrategy
} from "../src/motion/reduced-motion.js";
import {
  getTransitionPreset,
  getAllTransitionPresets,
  computeStaggerDelay,
  computeEasedStaggerDelay
} from "../src/motion/transition.js";
import * as MotionSubpath from "../src/motion-export.js";
describe("getDurationScale", () => {
  test("returns all six named tokens from Spec 05 §2.1", () => {
    const scale = getDurationScale();
    expect(scale).toHaveProperty("instant");
    expect(scale).toHaveProperty("fast");
    expect(scale).toHaveProperty("normal");
    expect(scale).toHaveProperty("moderate");
    expect(scale).toHaveProperty("slow");
    expect(scale).toHaveProperty("slower");
  });
  test("instant is exactly 0", () => {
    expect(getDurationScale().instant).toBe(0);
  });
  test("fast is exactly 100ms (causality window)", () => {
    expect(getDurationScale().fast).toBe(100);
  });
  test("slower is exactly 500ms (hard cap)", () => {
    expect(getDurationScale().slower).toBe(500);
  });
  test("values are monotonically increasing", () => {
    const scale = getDurationScale();
    const ordered = [
      "instant",
      "fast",
      "normal",
      "moderate",
      "slow",
      "slower"
    ];
    for (let i = 1;i < ordered.length; i++) {
      const prev = ordered[i - 1];
      const curr = ordered[i];
      expect(scale[curr]).toBeGreaterThan(scale[prev]);
    }
  });
  test("all values are non-negative integers", () => {
    const scale = getDurationScale();
    for (const [, value] of Object.entries(scale)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(value)).toBe(true);
    }
  });
  test("normal is at the perceptual present threshold (200ms)", () => {
    expect(getDurationScale().normal).toBe(200);
  });
  test("values match Spec 05 §2.1 table exactly", () => {
    const scale = getDurationScale();
    expect(scale.instant).toBe(0);
    expect(scale.fast).toBe(100);
    expect(scale.normal).toBe(200);
    expect(scale.moderate).toBe(300);
    expect(scale.slow).toBe(400);
    expect(scale.slower).toBe(500);
  });
});
describe("computeDuration", () => {
  test("zero distance returns 0ms", () => {
    expect(computeDuration(0)).toBe(0);
  });
  test("negative distance is treated as absolute value", () => {
    expect(computeDuration(-100)).toBe(computeDuration(100));
  });
  test("small distance (<50px) produces fast duration (<=150ms)", () => {
    const d = computeDuration(50);
    expect(d).toBeLessThanOrEqual(150);
    expect(d).toBeGreaterThan(0);
  });
  test("reference distance produces exactly the base duration", () => {
    expect(computeDuration(100)).toBe(200);
  });
  test("large distance (>200px) produces moderate duration (>=200ms)", () => {
    const d = computeDuration(200);
    expect(d).toBeGreaterThanOrEqual(200);
  });
  test("result is capped at 500ms by default", () => {
    expect(computeDuration(1e4)).toBe(500);
    expect(computeDuration(999999)).toBe(500);
  });
  test("custom maxDuration cap is respected", () => {
    expect(computeDuration(1e4, { maxDuration: 300 })).toBe(300);
  });
  test("custom baseDuration is used in formula", () => {
    expect(computeDuration(100, { baseDuration: 100 })).toBe(100);
  });
  test("custom referenceDistance changes scaling", () => {
    expect(computeDuration(50, { referenceDistance: 50 })).toBe(200);
  });
  test("sublinear: doubling distance does not double duration", () => {
    const d100 = computeDuration(100);
    const d400 = computeDuration(400);
    expect(d400).toBeLessThan(d100 * 4);
    expect(d400).toBeCloseTo(d100 * 2, 0);
  });
  test("returns integer ms values", () => {
    for (const px of [8, 25, 50, 100, 200, 300, 500]) {
      const d = computeDuration(px);
      expect(Number.isInteger(d)).toBe(true);
    }
  });
});
describe("getEasingCurves", () => {
  test("returns all seven named curves", () => {
    const curves = getEasingCurves();
    const expectedKeys = [
      "default",
      "in",
      "out",
      "in-out",
      "linear",
      "spring",
      "snappy"
    ];
    for (const key of expectedKeys) {
      expect(curves).toHaveProperty(key);
    }
  });
  test("each curve is a 4-element tuple", () => {
    const curves = getEasingCurves();
    for (const [, tuple] of Object.entries(curves)) {
      expect(Array.isArray(tuple)).toBe(true);
      expect(tuple).toHaveLength(4);
    }
  });
  test("x1 and x2 control points are in [0, 1] for all curves", () => {
    const curves = getEasingCurves();
    for (const [name, [x1, , x2]] of Object.entries(curves)) {
      expect(x1).toBeGreaterThanOrEqual(0);
      expect(x1).toBeLessThanOrEqual(1);
      expect(x2).toBeGreaterThanOrEqual(0);
      expect(x2).toBeLessThanOrEqual(1);
    }
  });
  test("linear curve has identical control points (0,0,1,1)", () => {
    const [x1, y1, x2, y2] = getEasingCurves().linear;
    expect(x1).toBe(0);
    expect(y1).toBe(0);
    expect(x2).toBe(1);
    expect(y2).toBe(1);
  });
  test("default curve matches spec (0.2, 0, 0, 1)", () => {
    const [x1, y1, x2, y2] = getEasingCurves().default;
    expect(x1).toBe(0.2);
    expect(y1).toBe(0);
    expect(x2).toBe(0);
    expect(y2).toBe(1);
  });
  test("ease-in curve matches spec (0.4, 0, 1, 0.6)", () => {
    const [x1, y1, x2, y2] = getEasingCurves().in;
    expect(x1).toBe(0.4);
    expect(y1).toBe(0);
    expect(x2).toBe(1);
    expect(y2).toBe(0.6);
  });
  test("spring curve allows y2 > 1 (overshoot)", () => {
    const [, , , y2] = getEasingCurves().spring;
    expect(y2).toBeGreaterThan(1);
  });
});
describe("cubicBezier", () => {
  test("t=0 returns exactly 0 for all standard curves", () => {
    const curves = getEasingCurves();
    for (const [, [x1, y1, x2, y2]] of Object.entries(curves)) {
      expect(cubicBezier(x1, y1, x2, y2, 0)).toBe(0);
    }
  });
  test("t=1 returns exactly 1 for all standard curves", () => {
    const curves = getEasingCurves();
    for (const [, [x1, y1, x2, y2]] of Object.entries(curves)) {
      expect(cubicBezier(x1, y1, x2, y2, 1)).toBe(1);
    }
  });
  test("linear curve: t=0.5 returns 0.5", () => {
    expect(cubicBezier(0, 0, 1, 1, 0.5)).toBeCloseTo(0.5, 3);
  });
  test("linear curve: t=0.25 returns 0.25", () => {
    expect(cubicBezier(0, 0, 1, 1, 0.25)).toBeCloseTo(0.25, 3);
  });
  test("ease-out (default): midpoint value > 0.5 (fast start)", () => {
    const mid = cubicBezier(0.2, 0, 0, 1, 0.5);
    expect(mid).toBeGreaterThan(0.5);
  });
  test("ease-in: midpoint value < 0.5 (slow start)", () => {
    const mid = cubicBezier(0.4, 0, 1, 0.6, 0.5);
    expect(mid).toBeLessThan(0.5);
  });
  test("spring curve can return values > 1 (overshoot)", () => {
    const [x1, y1, x2, y2] = getEasingCurves().spring;
    let hasOvershoot = false;
    for (let t = 0.6;t <= 0.95; t += 0.05) {
      if (cubicBezier(x1, y1, x2, y2, t) > 1) {
        hasOvershoot = true;
        break;
      }
    }
    expect(hasOvershoot).toBe(true);
  });
  test("values are monotonically increasing for standard ease curves", () => {
    const monotonicCurves = [
      [0.2, 0, 0, 1],
      [0.4, 0, 1, 0.6],
      [0.4, 0, 0.2, 1],
      [0, 0, 1, 1]
    ];
    for (const [x1, y1, x2, y2] of monotonicCurves) {
      let prev = 0;
      for (let i = 1;i <= 20; i++) {
        const t = i / 20;
        const val = cubicBezier(x1, y1, x2, y2, t);
        expect(val).toBeGreaterThanOrEqual(prev - 0.000001);
        prev = val;
      }
    }
  });
  test("output is in [0, 1] for standard non-overshoot curves", () => {
    const standardCurves = [
      [0.2, 0, 0, 1],
      [0.4, 0, 1, 0.6],
      [0.4, 0, 0.2, 1],
      [0, 0, 1, 1],
      [0.4, 0, 0, 1]
    ];
    for (const [x1, y1, x2, y2] of standardCurves) {
      for (let i = 0;i <= 20; i++) {
        const t = i / 20;
        const val = cubicBezier(x1, y1, x2, y2, t);
        expect(val).toBeGreaterThanOrEqual(-0.0000000001);
        expect(val).toBeLessThanOrEqual(1 + 0.0000000001);
      }
    }
  });
});
describe("easingToCss", () => {
  test("produces valid CSS easing string for each named curve", () => {
    const curves = getEasingCurves();
    for (const name of Object.keys(curves)) {
      const css = easingToCss(name);
      if (name === "linear") {
        expect(css).toBe("linear");
      } else {
        expect(css).toMatch(/^cubic-bezier\(/);
        expect(css).toMatch(/\)$/);
        const inner = css.slice("cubic-bezier(".length, -1);
        const parts = inner.split(",").map((s) => s.trim());
        expect(parts).toHaveLength(4);
        for (const part of parts) {
          expect(Number.isFinite(parseFloat(part))).toBe(true);
        }
      }
    }
  });
});
describe("cubicBezier tuple/object conversions", () => {
  test("tupleToCubicBezier round-trips through cubicBezierToTuple", () => {
    const curves = getEasingCurves();
    for (const [, tuple] of Object.entries(curves)) {
      const obj = tupleToCubicBezier(tuple);
      const back = cubicBezierToTuple(obj);
      expect(back[0]).toBe(tuple[0]);
      expect(back[1]).toBe(tuple[1]);
      expect(back[2]).toBe(tuple[2]);
      expect(back[3]).toBe(tuple[3]);
    }
  });
});
describe("getSpringPresets", () => {
  test("returns all four named presets", () => {
    const presets = getSpringPresets();
    expect(presets).toHaveProperty("snappy");
    expect(presets).toHaveProperty("default");
    expect(presets).toHaveProperty("gentle");
    expect(presets).toHaveProperty("bouncy");
  });
  test("each preset has stiffness, damping, and mass", () => {
    const presets = getSpringPresets();
    for (const [, config] of Object.entries(presets)) {
      expect(config).toHaveProperty("stiffness");
      expect(config).toHaveProperty("damping");
      expect(config).toHaveProperty("mass");
    }
  });
  test("stiffness is positive for all presets", () => {
    const presets = getSpringPresets();
    for (const [, { stiffness }] of Object.entries(presets)) {
      expect(stiffness).toBeGreaterThan(0);
    }
  });
  test("damping is positive for all presets", () => {
    const presets = getSpringPresets();
    for (const [, { damping }] of Object.entries(presets)) {
      expect(damping).toBeGreaterThan(0);
    }
  });
  test("mass is positive for all presets", () => {
    const presets = getSpringPresets();
    for (const [, { mass }] of Object.entries(presets)) {
      expect(mass).toBeGreaterThan(0);
    }
  });
  test("stiffness values are within spec range [100, 400]", () => {
    const presets = getSpringPresets();
    for (const [, { stiffness }] of Object.entries(presets)) {
      expect(stiffness).toBeGreaterThanOrEqual(100);
      expect(stiffness).toBeLessThanOrEqual(400);
    }
  });
  test("damping values are within spec range [10, 30]", () => {
    const presets = getSpringPresets();
    for (const [, { damping }] of Object.entries(presets)) {
      expect(damping).toBeGreaterThanOrEqual(10);
      expect(damping).toBeLessThanOrEqual(30);
    }
  });
  test("mass values are within spec range [0.5, 2.0]", () => {
    const presets = getSpringPresets();
    for (const [, { mass }] of Object.entries(presets)) {
      expect(mass).toBeGreaterThanOrEqual(0.5);
      expect(mass).toBeLessThanOrEqual(2);
    }
  });
  test("snappy has lower mass than other presets (faster response)", () => {
    const presets = getSpringPresets();
    expect(presets.snappy.mass).toBeLessThan(presets.default.mass);
    expect(presets.snappy.mass).toBeLessThan(presets.gentle.mass);
    expect(presets.snappy.mass).toBeLessThan(presets.bouncy.mass);
  });
  test("gentle has lowest stiffness (slowest spring)", () => {
    const presets = getSpringPresets();
    expect(presets.gentle.stiffness).toBeLessThan(presets.default.stiffness);
    expect(presets.gentle.stiffness).toBeLessThan(presets.snappy.stiffness);
  });
  test("bouncy has lowest damping (most overshoot)", () => {
    const presets = getSpringPresets();
    expect(presets.bouncy.damping).toBeLessThan(presets.default.damping);
    expect(presets.bouncy.damping).toBeLessThan(presets.snappy.damping);
    expect(presets.bouncy.damping).toBeLessThan(presets.gentle.damping);
  });
});
describe("computeSpringDuration", () => {
  test("returns positive duration for all presets", () => {
    const presets = getSpringPresets();
    for (const [, config] of Object.entries(presets)) {
      const duration = computeSpringDuration(config);
      expect(duration).toBeGreaterThan(0);
    }
  });
  test("returns integer milliseconds", () => {
    const presets = getSpringPresets();
    for (const [, config] of Object.entries(presets)) {
      expect(Number.isInteger(computeSpringDuration(config))).toBe(true);
    }
  });
  test("snappy settles faster than gentle (reasonable physical ordering)", () => {
    const presets = getSpringPresets();
    const snappyDur = computeSpringDuration(presets.snappy);
    const gentleDur = computeSpringDuration(presets.gentle);
    expect(snappyDur).toBeLessThan(gentleDur);
  });
  test("bouncy settles slower than snappy (more oscillation)", () => {
    const presets = getSpringPresets();
    const bouncyDur = computeSpringDuration(presets.bouncy);
    const snappyDur = computeSpringDuration(presets.snappy);
    expect(bouncyDur).toBeGreaterThan(snappyDur);
  });
  test("all presets settle within the patience threshold (<2000ms cap)", () => {
    const presets = getSpringPresets();
    for (const [, config] of Object.entries(presets)) {
      expect(computeSpringDuration(config)).toBeLessThanOrEqual(2000);
    }
  });
  test("snappy settles reasonably fast (< 700ms)", () => {
    const presets = getSpringPresets();
    expect(computeSpringDuration(presets.snappy)).toBeLessThan(700);
  });
  test("critically damped spring (ζ=1) produces valid duration", () => {
    const criticalConfig = { stiffness: 100, damping: 20, mass: 1 };
    const dur = computeSpringDuration(criticalConfig);
    expect(dur).toBeGreaterThan(0);
    expect(dur).toBeLessThanOrEqual(2000);
  });
  test("overdamped spring (ζ>1) produces valid duration", () => {
    const overdampedConfig = { stiffness: 100, damping: 50, mass: 1 };
    const dur = computeSpringDuration(overdampedConfig);
    expect(dur).toBeGreaterThan(0);
    expect(dur).toBeLessThanOrEqual(2000);
  });
});
describe("springToLinear", () => {
  test("produces a linear() CSS string for each preset", () => {
    const presets = getSpringPresets();
    for (const [, config] of Object.entries(presets)) {
      const css = springToLinear(config);
      expect(css).toMatch(/^linear\(/);
      expect(css).toMatch(/\)$/);
    }
  });
  test("first sample value is 0 (starts at rest)", () => {
    const presets = getSpringPresets();
    for (const [, config] of Object.entries(presets)) {
      const css = springToLinear(config);
      const inner = css.slice("linear(".length, -1);
      const first = parseFloat(inner.split(",")[0]);
      expect(first).toBeCloseTo(0, 2);
    }
  });
  test("last sample value is approximately 1 (settled)", () => {
    const presets = getSpringPresets();
    for (const [, config] of Object.entries(presets)) {
      const css = springToLinear(config);
      const inner = css.slice("linear(".length, -1);
      const values = inner.split(",").map((s) => parseFloat(s.trim()));
      const last = values[values.length - 1];
      expect(last).toBeCloseTo(1, 1);
    }
  });
  test("contains at least 5 sample points", () => {
    const presets = getSpringPresets();
    for (const [, config] of Object.entries(presets)) {
      const css = springToLinear(config, 32);
      const inner = css.slice("linear(".length, -1);
      const values = inner.split(",");
      expect(values.length).toBeGreaterThanOrEqual(5);
    }
  });
  test("custom sample count is respected (approximately)", () => {
    const config = getSpringPresets().snappy;
    const css32 = springToLinear(config, 32);
    const css64 = springToLinear(config, 64);
    const points32 = css32.slice("linear(".length, -1).split(",").length;
    const points64 = css64.slice("linear(".length, -1).split(",").length;
    expect(points64).toBeGreaterThanOrEqual(points32);
  });
  test("bouncy spring can have values > 1 (overshoot)", () => {
    const css = springToLinear(getSpringPresets().bouncy, 64);
    const inner = css.slice("linear(".length, -1);
    const values = inner.split(",").map((s) => parseFloat(s.trim()));
    const hasOvershoot = values.some((v) => v > 1.001);
    expect(hasOvershoot).toBe(true);
  });
});
describe("getReducedMotionAlternative", () => {
  test("slide maps to crossfade strategy", () => {
    const alt = getReducedMotionAlternative("slide");
    expect(alt.strategy).toBe("crossfade");
  });
  test("scale maps to instant strategy", () => {
    const alt = getReducedMotionAlternative("scale");
    expect(alt.strategy).toBe("instant");
  });
  test("fade maps to reduce-duration strategy", () => {
    const alt = getReducedMotionAlternative("fade");
    expect(alt.strategy).toBe("reduce-duration");
  });
  test("expand maps to instant strategy", () => {
    const alt = getReducedMotionAlternative("expand");
    expect(alt.strategy).toBe("instant");
  });
  test("rotate maps to none strategy", () => {
    const alt = getReducedMotionAlternative("rotate");
    expect(alt.strategy).toBe("none");
  });
  test("all alternatives have a non-empty description", () => {
    const types = ["slide", "scale", "fade", "expand", "rotate"];
    for (const type of types) {
      const alt = getReducedMotionAlternative(type);
      expect(typeof alt.description).toBe("string");
      expect(alt.description.length).toBeGreaterThan(10);
    }
  });
  test("all alternatives have a defined durationOverride", () => {
    const types = ["slide", "scale", "fade", "expand", "rotate"];
    for (const type of types) {
      const alt = getReducedMotionAlternative(type);
      expect(alt.durationOverride).toBeDefined();
      expect(alt.durationOverride).toBeGreaterThanOrEqual(0);
    }
  });
  test("crossfade strategy gets normal duration (200ms) override", () => {
    const alt = getReducedMotionAlternative("slide");
    expect(alt.durationOverride).toBe(200);
  });
  test("instant strategy gets 0ms duration", () => {
    const scale = getReducedMotionAlternative("scale");
    const expand = getReducedMotionAlternative("expand");
    expect(scale.durationOverride).toBe(0);
    expect(expand.durationOverride).toBe(0);
  });
  test("none strategy gets 0ms duration", () => {
    expect(getReducedMotionAlternative("rotate").durationOverride).toBe(0);
  });
});
describe("isReducedMotion", () => {
  test("returns false in non-browser environment (Bun)", () => {
    expect(isReducedMotion()).toBe(false);
  });
});
describe("getAllReducedMotionAlternatives", () => {
  test("returns all five animation types", () => {
    const all = getAllReducedMotionAlternatives();
    expect(all).toHaveProperty("slide");
    expect(all).toHaveProperty("scale");
    expect(all).toHaveProperty("fade");
    expect(all).toHaveProperty("expand");
    expect(all).toHaveProperty("rotate");
  });
  test("each alternative has a valid strategy", () => {
    const all = getAllReducedMotionAlternatives();
    for (const [, alt] of Object.entries(all)) {
      expect(isValidReducedMotionStrategy(alt.strategy)).toBe(true);
    }
  });
});
describe("isValidReducedMotionStrategy", () => {
  test("accepts all four valid strategies", () => {
    expect(isValidReducedMotionStrategy("crossfade")).toBe(true);
    expect(isValidReducedMotionStrategy("instant")).toBe(true);
    expect(isValidReducedMotionStrategy("reduce-duration")).toBe(true);
    expect(isValidReducedMotionStrategy("none")).toBe(true);
  });
  test("rejects unknown strings", () => {
    expect(isValidReducedMotionStrategy("remove")).toBe(false);
    expect(isValidReducedMotionStrategy("")).toBe(false);
    expect(isValidReducedMotionStrategy("fade")).toBe(false);
  });
});
describe("getTransitionPreset", () => {
  test("fade preset has opacity as the property", () => {
    const preset = getTransitionPreset("fade");
    expect(preset.property).toBe("opacity");
  });
  test("fade preset uses normal duration (200ms) per Spec 05 §6.1", () => {
    expect(getTransitionPreset("fade").duration).toBe(200);
  });
  test("slide-up preset includes transform and opacity", () => {
    const preset = getTransitionPreset("slide-up");
    expect(preset.property).toContain("transform");
    expect(preset.property).toContain("opacity");
  });
  test("slide-down is faster than slide-up (exit < enter)", () => {
    const up = getTransitionPreset("slide-up");
    const down = getTransitionPreset("slide-down");
    expect(down.duration).toBeLessThan(up.duration);
  });
  test("collapse is faster than expand (exit < enter)", () => {
    const expand = getTransitionPreset("expand");
    const collapse = getTransitionPreset("collapse");
    expect(collapse.duration).toBeLessThan(expand.duration);
  });
  test("all presets have valid easing with x1/x2 in [0, 1]", () => {
    const names = [
      "fade",
      "slide-up",
      "slide-down",
      "scale",
      "expand",
      "collapse"
    ];
    for (const name of names) {
      const { easing } = getTransitionPreset(name);
      expect(easing.x1).toBeGreaterThanOrEqual(0);
      expect(easing.x1).toBeLessThanOrEqual(1);
      expect(easing.x2).toBeGreaterThanOrEqual(0);
      expect(easing.x2).toBeLessThanOrEqual(1);
    }
  });
  test("all presets have a non-empty css string", () => {
    const names = [
      "fade",
      "slide-up",
      "slide-down",
      "scale",
      "expand",
      "collapse"
    ];
    for (const name of names) {
      const { css } = getTransitionPreset(name);
      expect(typeof css).toBe("string");
      expect(css.length).toBeGreaterThan(5);
    }
  });
  test("css string contains the duration in ms", () => {
    const names = [
      "fade",
      "slide-up",
      "slide-down",
      "scale",
      "expand",
      "collapse"
    ];
    for (const name of names) {
      const { css, duration } = getTransitionPreset(name);
      expect(css).toContain(`${duration}ms`);
    }
  });
  test("css string contains cubic-bezier()", () => {
    const names = [
      "fade",
      "slide-up",
      "slide-down",
      "scale",
      "expand",
      "collapse"
    ];
    for (const name of names) {
      expect(getTransitionPreset(name).css).toContain("cubic-bezier(");
    }
  });
  test("all preset durations are in the valid range [0, 500]", () => {
    const names = [
      "fade",
      "slide-up",
      "slide-down",
      "scale",
      "expand",
      "collapse"
    ];
    for (const name of names) {
      const { duration } = getTransitionPreset(name);
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(duration).toBeLessThanOrEqual(500);
    }
  });
});
describe("getAllTransitionPresets", () => {
  test("returns all six presets", () => {
    const all = getAllTransitionPresets();
    expect(Object.keys(all)).toHaveLength(6);
    expect(all).toHaveProperty("fade");
    expect(all).toHaveProperty("slide-up");
    expect(all).toHaveProperty("slide-down");
    expect(all).toHaveProperty("scale");
    expect(all).toHaveProperty("expand");
    expect(all).toHaveProperty("collapse");
  });
});
describe("computeStaggerDelay", () => {
  test("index 0 returns 0ms delay", () => {
    expect(computeStaggerDelay(0)).toBe(0);
  });
  test("index 1 returns 50ms (one step)", () => {
    expect(computeStaggerDelay(1)).toBe(50);
  });
  test("index 3 returns 150ms", () => {
    expect(computeStaggerDelay(3)).toBe(150);
  });
  test("index 10 returns 500ms (max 10 × 50ms)", () => {
    expect(computeStaggerDelay(10)).toBe(500);
  });
  test("index 15 is capped at 10 items (500ms)", () => {
    expect(computeStaggerDelay(15)).toBe(500);
  });
  test("index 100 is also capped at 500ms", () => {
    expect(computeStaggerDelay(100)).toBe(500);
  });
  test("custom perItemMs is applied", () => {
    expect(computeStaggerDelay(3, 30)).toBe(90);
  });
  test("custom maxItems cap is respected", () => {
    expect(computeStaggerDelay(10, 50, 5)).toBe(250);
    expect(computeStaggerDelay(5, 50, 5)).toBe(250);
  });
});
describe("computeEasedStaggerDelay", () => {
  test("first item always returns 0ms", () => {
    expect(computeEasedStaggerDelay(0, 5, 650)).toBe(0);
  });
  test("last item always returns totalDurationMs", () => {
    expect(computeEasedStaggerDelay(4, 5, 650)).toBe(650);
  });
  test("single item returns 0ms", () => {
    expect(computeEasedStaggerDelay(0, 1, 650)).toBe(0);
  });
  test("intermediate items produce delays between 0 and totalDuration", () => {
    for (let i = 1;i < 4; i++) {
      const delay = computeEasedStaggerDelay(i, 5, 650);
      expect(delay).toBeGreaterThan(0);
      expect(delay).toBeLessThan(650);
    }
  });
  test("ease-out: delays are front-loaded (bigger gaps at end)", () => {
    const d1 = computeEasedStaggerDelay(1, 5, 1000, "out");
    const d2 = computeEasedStaggerDelay(2, 5, 1000, "out");
    const d3 = computeEasedStaggerDelay(3, 5, 1000, "out");
    expect(d1).toBeGreaterThan(0);
    expect(d2).toBeGreaterThan(d1);
    expect(d3).toBeGreaterThan(d2);
  });
  test("delays are monotonically increasing", () => {
    const total = 8;
    let prev = -1;
    for (let i = 0;i < total; i++) {
      const delay = computeEasedStaggerDelay(i, total, 1000);
      expect(delay).toBeGreaterThanOrEqual(prev);
      prev = delay;
    }
  });
  test("different easings produce different distributions", () => {
    const outDelay = computeEasedStaggerDelay(2, 5, 1000, "out");
    const inDelay = computeEasedStaggerDelay(2, 5, 1000, "in");
    expect(outDelay).not.toBe(inDelay);
  });
  test("returns integer milliseconds", () => {
    for (let i = 0;i < 5; i++) {
      const delay = computeEasedStaggerDelay(i, 5, 650);
      expect(delay).toBe(Math.round(delay));
    }
  });
});
describe("@sig-ui/core/motion subpath export", () => {
  test("getDurationScale is exported", () => {
    expect(typeof MotionSubpath.getDurationScale).toBe("function");
  });
  test("computeDuration is exported", () => {
    expect(typeof MotionSubpath.computeDuration).toBe("function");
  });
  test("getEasingCurves is exported", () => {
    expect(typeof MotionSubpath.getEasingCurves).toBe("function");
  });
  test("cubicBezier is exported", () => {
    expect(typeof MotionSubpath.cubicBezier).toBe("function");
  });
  test("getSpringPresets is exported", () => {
    expect(typeof MotionSubpath.getSpringPresets).toBe("function");
  });
  test("computeSpringDuration is exported", () => {
    expect(typeof MotionSubpath.computeSpringDuration).toBe("function");
  });
  test("springToLinear is exported", () => {
    expect(typeof MotionSubpath.springToLinear).toBe("function");
  });
  test("getReducedMotionAlternative is exported", () => {
    expect(typeof MotionSubpath.getReducedMotionAlternative).toBe("function");
  });
  test("isReducedMotion is exported", () => {
    expect(typeof MotionSubpath.isReducedMotion).toBe("function");
  });
  test("getTransitionPreset is exported", () => {
    expect(typeof MotionSubpath.getTransitionPreset).toBe("function");
  });
  test("computeStaggerDelay is exported", () => {
    expect(typeof MotionSubpath.computeStaggerDelay).toBe("function");
  });
  test("computeEasedStaggerDelay is exported", () => {
    expect(typeof MotionSubpath.computeEasedStaggerDelay).toBe("function");
  });
  test("all functions produce consistent results via subpath", () => {
    const scale = MotionSubpath.getDurationScale();
    expect(scale.normal).toBe(200);
    const curves = MotionSubpath.getEasingCurves();
    expect(curves.default).toEqual([0.2, 0, 0, 1]);
    const presets = MotionSubpath.getSpringPresets();
    expect(presets.default.stiffness).toBeGreaterThan(0);
  });
});
describe("integration: transition preset matches duration scale", () => {
  test("fade duration matches 'normal' in duration scale", () => {
    const { duration } = getTransitionPreset("fade");
    const { normal } = getDurationScale();
    expect(duration).toBe(normal);
  });
  test("slide-up duration matches 'moderate' in duration scale", () => {
    const { duration } = getTransitionPreset("slide-up");
    const { moderate } = getDurationScale();
    expect(duration).toBe(moderate);
  });
  test("exit presets use 'fast' duration per Spec 05 §6.1", () => {
    const { fast } = getDurationScale();
    expect(getTransitionPreset("slide-down").duration).toBe(fast);
    expect(getTransitionPreset("collapse").duration).toBe(fast);
  });
  test("all preset durations are named scale values", () => {
    const all = getAllTransitionPresets();
    const scale = getDurationScale();
    const validDurations = new Set(Object.values(scale));
    for (const [, preset] of Object.entries(all)) {
      expect(validDurations.has(preset.duration)).toBe(true);
    }
  });
});
describe("integration: easing curves used in transition presets", () => {
  test("slide-down uses ease-in curve (faster exit)", () => {
    const preset = getTransitionPreset("slide-down");
    const curves = getEasingCurves();
    const [ix1, iy1, ix2, iy2] = curves.in;
    expect(preset.css).toContain(`${ix1}`);
  });
  test("fade uses default ease-out curve", () => {
    const preset = getTransitionPreset("fade");
    const curves = getEasingCurves();
    const [dx1] = curves.default;
    expect(preset.css).toContain(`${dx1}`);
  });
});
