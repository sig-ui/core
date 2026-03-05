// @ts-check

/**
 * SigUI core gradient presets module for presets.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  mesh,
  aurora,
  glow,
  sweep,
  noise,
  definePreset,
  resolvePreset,
  fillToArity
} from "../index.js";
describe("fillToArity", () => {
  test("truncates when longer than arity", () => {
    expect(fillToArity(["a", "b", "c", "d"], 2)).toEqual(["a", "b"]);
  });
  test("fills by repeating last element when shorter", () => {
    expect(fillToArity(["a"], 3)).toEqual(["a", "a", "a"]);
  });
  test("fills with partial input", () => {
    expect(fillToArity(["a", "b"], 4)).toEqual(["a", "b", "b", "b"]);
  });
  test("returns exact length unchanged", () => {
    expect(fillToArity(["a", "b", "c"], 3)).toEqual(["a", "b", "c"]);
  });
});
describe("preset arity", () => {
  test("mesh has arity 3", () => {
    expect(mesh().arity).toBe(3);
  });
  test("aurora has arity 3", () => {
    expect(aurora().arity).toBe(3);
  });
  test("glow has arity 2", () => {
    expect(glow().arity).toBe(2);
  });
  test("sweep has arity 3", () => {
    expect(sweep().arity).toBe(3);
  });
  test("noise has arity 3", () => {
    expect(noise().arity).toBe(3);
  });
});
function makeCtx(overrides) {
  return {
    colors: ["var(--sg-color-primary)", "var(--sg-color-secondary)", "var(--sg-color-accent)"],
    intensity: 50,
    neutral: false,
    ...overrides
  };
}
describe("mesh preset", () => {
  test("renders a background string with radial-gradient", () => {
    const output = mesh().render(makeCtx());
    expect(output.background).toContain("radial-gradient");
  });
  test("renders animation keyframes", () => {
    const output = mesh().render(makeCtx());
    expect(output.animation).toBeDefined();
    expect(output.animation.keyframes.length).toBeGreaterThanOrEqual(2);
    expect(output.animation.duration).toBeGreaterThan(0);
  });
  test("includes backgroundSize in style", () => {
    const output = mesh().render(makeCtx());
    expect(output.style?.backgroundSize).toBe("200% 200%");
  });
  test("accepts custom positions", () => {
    const output = mesh({ positions: [{ x: 10, y: 10 }, { x: 90, y: 90 }, { x: 50, y: 50 }] }).render(makeCtx());
    expect(output.background).toContain("10%");
    expect(output.background).toContain("90%");
  });
});
describe("aurora preset", () => {
  test("renders linear-gradient layers", () => {
    const output = aurora().render(makeCtx());
    expect(output.background).toContain("linear-gradient");
  });
  test("applies blur filter", () => {
    const output = aurora().render(makeCtx());
    expect(output.filter).toContain("blur");
  });
  test("accepts custom direction", () => {
    const output = aurora({ direction: 45 }).render(makeCtx());
    expect(output.background).toContain("45deg");
  });
});
describe("glow preset", () => {
  test("renders radial-gradient layers", () => {
    const ctx = makeCtx({ colors: ["var(--sg-color-primary)", "var(--sg-color-secondary)"] });
    const output = glow().render(ctx);
    expect(output.background).toContain("radial-gradient");
  });
  test("accepts custom spread", () => {
    const ctx = makeCtx({ colors: ["var(--sg-color-primary)", "var(--sg-color-secondary)"] });
    const output = glow({ spread: 2 }).render(ctx);
    expect(output.background).toContain("140%");
  });
  test("accepts custom positions", () => {
    const ctx = makeCtx({ colors: ["var(--sg-color-primary)", "var(--sg-color-secondary)"] });
    const output = glow({ positions: [{ x: 10, y: 20 }, { x: 80, y: 90 }] }).render(ctx);
    expect(output.background).toContain("10% 20%");
    expect(output.background).toContain("80% 90%");
  });
});
describe("sweep preset", () => {
  test("renders conic-gradient", () => {
    const output = sweep().render(makeCtx());
    expect(output.background).toContain("conic-gradient");
  });
  test("applies blur filter", () => {
    const output = sweep().render(makeCtx());
    expect(output.filter).toContain("blur");
  });
  test("accepts custom origin and direction", () => {
    const output = sweep({ origin: { x: 50, y: 50 }, direction: 90 }).render(makeCtx());
    expect(output.background).toContain("50% 50%");
    expect(output.background).toContain("90deg");
  });
});
describe("noise preset", () => {
  test("renders linear-gradient layers", () => {
    const output = noise().render(makeCtx());
    expect(output.background).toContain("linear-gradient");
  });
  test("axis x constrains angles near horizontal", () => {
    const output = noise({ axis: "x" }).render(makeCtx());
    expect(output.background).toContain("0deg");
    expect(output.background).toContain("15deg");
  });
  test("axis y constrains angles near vertical", () => {
    const output = noise({ axis: "y" }).render(makeCtx());
    expect(output.background).toContain("90deg");
  });
});
describe("neutral-aware rendering", () => {
  test("mesh uses color-mix with white/black when neutral", () => {
    const ctx = makeCtx({
      colors: ["var(--sg-color-neutral)", "var(--sg-color-neutral)", "var(--sg-color-neutral)"],
      neutral: true
    });
    const output = mesh().render(ctx);
    expect(output.background).toMatch(/white|black/);
  });
  test("mesh does NOT use white/black when chromatic", () => {
    const ctx = makeCtx({ neutral: false });
    const output = mesh().render(ctx);
    expect(output.background).toContain("var(--sg-color-primary)");
  });
  test("all presets handle neutral mode without errors", () => {
    const neutralCtx = makeCtx({
      colors: ["var(--sg-color-neutral)", "var(--sg-color-neutral)", "var(--sg-color-neutral)"],
      neutral: true
    });
    expect(() => mesh().render(neutralCtx)).not.toThrow();
    expect(() => aurora().render(neutralCtx)).not.toThrow();
    expect(() => sweep().render(neutralCtx)).not.toThrow();
    expect(() => noise().render(neutralCtx)).not.toThrow();
    const neutralCtx2 = makeCtx({
      colors: ["var(--sg-color-neutral)", "var(--sg-color-neutral)"],
      neutral: true
    });
    expect(() => glow().render(neutralCtx2)).not.toThrow();
  });
});
describe("intensity", () => {
  test("higher intensity produces larger opacity values", () => {
    const low = mesh().render(makeCtx({ intensity: 10 }));
    const high = mesh().render(makeCtx({ intensity: 90 }));
    expect(low.background).toContain("10%");
    expect(high.background).toContain("90%");
  });
});
describe("resolvePreset", () => {
  test("resolves built-in string names", () => {
    const def = resolvePreset("mesh");
    expect(def.arity).toBe(3);
    expect(typeof def.render).toBe("function");
  });
  test("passes through PresetDefinition objects", () => {
    const custom = {
      arity: 4,
      render: () => ({ background: "red" })
    };
    expect(resolvePreset(custom)).toBe(custom);
  });
  test("throws for unknown preset name", () => {
    expect(() => resolvePreset("nonexistent")).toThrow("Unknown gradient preset");
  });
});
describe("definePreset", () => {
  test("returns the definition as-is", () => {
    const def = {
      arity: 2,
      render: (ctx) => ({
        background: `linear-gradient(${ctx.colors[0]}, ${ctx.colors[1]})`
      })
    };
    const result = definePreset(def);
    expect(result).toBe(def);
    expect(result.arity).toBe(2);
  });
  test("custom preset render works", () => {
    const custom = definePreset({
      arity: 1,
      render: ({ colors, intensity }) => ({
        background: `radial-gradient(${colors[0]} ${intensity}%, transparent)`
      })
    });
    const output = custom.render({
      colors: ["var(--sg-color-primary)"],
      intensity: 50,
      neutral: false
    });
    expect(output.background).toContain("var(--sg-color-primary)");
    expect(output.background).toContain("50%");
  });
});
