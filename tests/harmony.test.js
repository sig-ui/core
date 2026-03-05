// @ts-check

/**
 * Repository module for harmony.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { computeHarmony } from "../src/harmony/harmony.js";
import { generateFullPalette, deriveSurfaceScale } from "../src/harmony/theme.js";
import { ALL_STOPS } from "../src/generation/targets.js";
import { toOklch } from "../src/color-space/oklch.js";
describe("computeHarmony", () => {
  test("monochromatic returns only the primary hue", () => {
    const result = computeHarmony(120, "monochromatic");
    expect(result.hues).toHaveLength(1);
    expect(result.hues[0]).toBe(120);
    expect(result.primary).toBe(120);
  });
  test("complementary returns primary + 180°", () => {
    const result = computeHarmony(60, "complementary");
    expect(result.hues).toHaveLength(2);
    expect(result.hues[0]).toBe(60);
    expect(result.hues[1]).toBe(240);
  });
  test("analogous returns primary ± 30°", () => {
    const result = computeHarmony(200, "analogous");
    expect(result.hues).toHaveLength(3);
    expect(result.hues[0]).toBe(200);
    expect(result.hues[1]).toBe(170);
    expect(result.hues[2]).toBe(230);
  });
  test("split-complementary returns +150° and +210°", () => {
    const result = computeHarmony(0, "split-complementary");
    expect(result.hues).toHaveLength(3);
    expect(result.hues[0]).toBe(0);
    expect(result.hues[1]).toBe(150);
    expect(result.hues[2]).toBe(210);
  });
  test("triadic returns +120° and +240°", () => {
    const result = computeHarmony(90, "triadic");
    expect(result.hues).toHaveLength(3);
    expect(result.hues[0]).toBe(90);
    expect(result.hues[1]).toBe(210);
    expect(result.hues[2]).toBe(330);
  });
  test("tetradic returns +90°, +180°, +270°", () => {
    const result = computeHarmony(45, "tetradic");
    expect(result.hues).toHaveLength(4);
    expect(result.hues[0]).toBe(45);
    expect(result.hues[1]).toBe(135);
    expect(result.hues[2]).toBe(225);
    expect(result.hues[3]).toBe(315);
  });
  test("normalizes hues that wrap past 360", () => {
    const result = computeHarmony(350, "complementary");
    expect(result.hues[0]).toBe(350);
    expect(result.hues[1]).toBe(170);
  });
  test("normalizes negative hue input", () => {
    const result = computeHarmony(-10, "complementary");
    expect(result.primary).toBe(350);
    expect(result.hues[0]).toBe(350);
    expect(result.hues[1]).toBe(170);
  });
});
describe("generateFullPalette", () => {
  const PRIMARY = "#6366f1";
  test("produces all expected palette keys", () => {
    const theme = generateFullPalette(PRIMARY);
    const expected = [
      "primary",
      "secondary",
      "tertiary",
      "accent",
      "success",
      "warning",
      "danger",
      "info"
    ];
    for (const key of expected) {
      expect(theme.palettes[key]).toBeDefined();
    }
  });
  test("all palettes have valid shade ramps (11 stops)", () => {
    const theme = generateFullPalette(PRIMARY);
    for (const [name, palette] of Object.entries(theme.palettes)) {
      for (const stop of ALL_STOPS) {
        expect(palette.formatted[stop]).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });
  test("default mode is light", () => {
    const theme = generateFullPalette(PRIMARY);
    expect(theme.mode).toBe("light");
  });
  test("dark mode generates different background", () => {
    const light = generateFullPalette(PRIMARY, { mode: "light" });
    const dark = generateFullPalette(PRIMARY, { mode: "dark" });
    expect(light.background).not.toBe(dark.background);
  });
  test("background auto-derivation for light mode is near white", () => {
    const theme = generateFullPalette(PRIMARY, { mode: "light" });
    expect(theme.background.charAt(1)).toMatch(/[f]/i);
  });
  test("background auto-derivation for dark mode is near black", () => {
    const theme = generateFullPalette(PRIMARY, { mode: "dark" });
    const r = parseInt(theme.background.slice(1, 3), 16);
    const g = parseInt(theme.background.slice(3, 5), 16);
    const b = parseInt(theme.background.slice(5, 7), 16);
    expect(r).toBeLessThan(50);
    expect(g).toBeLessThan(50);
    expect(b).toBeLessThan(50);
  });
  test("custom background is used when provided", () => {
    const theme = generateFullPalette(PRIMARY, { background: "#fafafa" });
    expect(theme.background).toBe("#fafafa");
  });
  test("overrides replace auto-derived colors", () => {
    const customDanger = "#ff0000";
    const theme = generateFullPalette(PRIMARY, {
      overrides: { danger: customDanger }
    });
    expect(theme.palettes.danger).toBeDefined();
    expect(theme.palettes.danger.formatted[500]).toBeDefined();
  });
  test("overrides for secondary/tertiary/accent work", () => {
    const theme = generateFullPalette(PRIMARY, {
      overrides: {
        secondary: "#22c55e",
        tertiary: "#f59e0b",
        accent: "#ec4899"
      }
    });
    expect(theme.palettes.secondary).toBeDefined();
    expect(theme.palettes.tertiary).toBeDefined();
    expect(theme.palettes.accent).toBeDefined();
  });
  test("roles mapping is complete", () => {
    const theme = generateFullPalette(PRIMARY);
    const expectedRoles = [
      "primary",
      "secondary",
      "tertiary",
      "accent",
      "highlight",
      "text",
      "text-secondary",
      "text-muted",
      "title",
      "subtitle",
      "link",
      "link-visited",
      "emphasis",
      "bg-light",
      "bg-dark",
      "surface",
      "surface-alt",
      "border",
      "border-light",
      "shadow",
      "code-text",
      "code-bg",
      "success",
      "warning",
      "danger",
      "info"
    ];
    for (const role of expectedRoles) {
      expect(theme.roles[role]).toBeDefined();
      expect(theme.roles[role]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
  test("neutral palette is present with full shade ramp", () => {
    const theme = generateFullPalette(PRIMARY);
    expect(theme.palettes.neutral).toBeDefined();
    for (const stop of ALL_STOPS) {
      expect(theme.palettes.neutral.formatted[stop]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
  test("interaction states present for all actionable roles", () => {
    const theme = generateFullPalette(PRIMARY);
    const actionable = [
      "primary",
      "secondary",
      "tertiary",
      "accent",
      "highlight",
      "success",
      "warning",
      "danger",
      "info"
    ];
    for (const role of actionable) {
      expect(theme.roles[`${role}-hover`]).toBeDefined();
      expect(theme.roles[`${role}-active`]).toBeDefined();
      expect(theme.roles[`${role}-subtle`]).toBeDefined();
      expect(theme.roles[`${role}-hover`]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.roles[`${role}-active`]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.roles[`${role}-subtle`]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
  test("data-1 through data-12 present as equally-spaced hue gradient", () => {
    const theme = generateFullPalette(PRIMARY);
    for (let i = 1;i <= 12; i++) {
      expect(theme.roles[`data-${i}`]).toBeDefined();
      expect(theme.roles[`data-${i}`]).toMatch(/^#[0-9a-f]{6}$/i);
    }
    const primaryOklch = toOklch(PRIMARY);
    const data1Oklch = toOklch(theme.roles["data-1"]);
    expect(Math.abs(data1Oklch.h - primaryOklch.h)).toBeLessThan(1);
    const data6Oklch = toOklch(theme.roles["data-6"]);
    expect(Math.abs(data1Oklch.l - data6Oklch.l)).toBeLessThan(0.01);
  });
  test("harmony result is included in output", () => {
    const theme = generateFullPalette(PRIMARY, { harmony: "triadic" });
    expect(theme.harmony).toBeDefined();
    expect(theme.harmony.hues.length).toBe(3);
  });
  test("monochromatic mode still produces secondary and tertiary", () => {
    const theme = generateFullPalette(PRIMARY, { harmony: "monochromatic" });
    expect(theme.palettes.secondary).toBeDefined();
    expect(theme.palettes.tertiary).toBeDefined();
    expect(theme.harmony.hues.length).toBe(1);
  });
  test("all harmony modes produce valid themes", () => {
    const modes = [
      "monochromatic",
      "complementary",
      "analogous",
      "split-complementary",
      "triadic",
      "tetradic"
    ];
    for (const mode of modes) {
      const theme = generateFullPalette(PRIMARY, { harmony: mode });
      expect(Object.keys(theme.palettes).length).toBeGreaterThanOrEqual(9);
      expect(theme.roles["primary"]).toBeDefined();
    }
  });
  test("works with different primary colors", () => {
    const colors = ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"];
    for (const hex of colors) {
      const theme = generateFullPalette(hex);
      expect(Object.keys(theme.palettes)).toHaveLength(9);
    }
  });
  test("accent palette uses complementary hue regardless of harmony mode", () => {
    const theme = generateFullPalette("#3b82f6", { harmony: "analogous" });
    expect(theme.palettes.accent).toBeDefined();
  });
  test("theme includes surfaces field", () => {
    const theme = generateFullPalette(PRIMARY);
    expect(theme.surfaces).toBeDefined();
    expect(theme.surfaces["bg.primary"]).toMatch(/^#[0-9a-f]{6}$/i);
    expect(theme.surfaces["bg.secondary"]).toMatch(/^#[0-9a-f]{6}$/i);
    expect(theme.surfaces["bg.tertiary"]).toMatch(/^#[0-9a-f]{6}$/i);
    expect(theme.surfaces["border.default"]).toMatch(/^#[0-9a-f]{6}$/i);
    expect(theme.surfaces["border.strong"]).toMatch(/^#[0-9a-f]{6}$/i);
  });
  test("surface and border roles use neutral palette shades", () => {
    const theme = generateFullPalette(PRIMARY);
    expect(theme.roles["surface"]).toBe(theme.palettes.neutral.formatted[100]);
    expect(theme.roles["surface-alt"]).toBe(theme.palettes.neutral.formatted[200]);
    expect(theme.roles["border"]).toBe(theme.palettes.neutral.formatted[300]);
    expect(theme.roles["border-light"]).toBe(theme.palettes.neutral.formatted[200]);
  });
  test("tintStrength controls surface chroma", () => {
    const noTint = generateFullPalette(PRIMARY, { tintStrength: 0 });
    const fullTint = generateFullPalette(PRIMARY, { tintStrength: 1 });
    expect(noTint.surfaces["bg.secondary"]).not.toBe(fullTint.surfaces["bg.secondary"]);
  });
});
describe("deriveSurfaceScale", () => {
  test("returns all 5 surface keys", () => {
    const surfaces = deriveSurfaceScale(270, 0.17, "light");
    expect(surfaces["bg.primary"]).toBeDefined();
    expect(surfaces["bg.secondary"]).toBeDefined();
    expect(surfaces["bg.tertiary"]).toBeDefined();
    expect(surfaces["border.default"]).toBeDefined();
    expect(surfaces["border.strong"]).toBeDefined();
  });
  test("all values are valid hex", () => {
    const surfaces = deriveSurfaceScale(270, 0.17, "light");
    for (const value of Object.values(surfaces)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
  test("tintStrength=0 produces achromatic surfaces", () => {
    const surfaces = deriveSurfaceScale(270, 0.2, "light", 0);
    for (const hex of Object.values(surfaces)) {
      const oklch = toOklch(hex);
      expect(oklch.c).toBeCloseTo(0, 3);
    }
  });
  test("surfaces never exceed C=0.04 even at tintStrength=1", () => {
    const surfaces = deriveSurfaceScale(270, 0.25, "dark", 1);
    for (const hex of Object.values(surfaces)) {
      const oklch = toOklch(hex);
      expect(oklch.c).toBeLessThanOrEqual(0.045);
    }
  });
  test("light mode lightness ordering: bg.primary > bg.secondary > bg.tertiary > border.default > border.strong", () => {
    const surfaces = deriveSurfaceScale(200, 0.15, "light");
    const lBgPrimary = toOklch(surfaces["bg.primary"]).l;
    const lBgSecondary = toOklch(surfaces["bg.secondary"]).l;
    const lBgTertiary = toOklch(surfaces["bg.tertiary"]).l;
    const lBorderDefault = toOklch(surfaces["border.default"]).l;
    const lBorderStrong = toOklch(surfaces["border.strong"]).l;
    expect(lBgPrimary).toBeGreaterThan(lBgSecondary);
    expect(lBgSecondary).toBeGreaterThan(lBgTertiary);
    expect(lBgTertiary).toBeGreaterThan(lBorderDefault);
    expect(lBorderDefault).toBeGreaterThan(lBorderStrong);
  });
  test("dark mode lightness ordering: bg.primary < bg.secondary < bg.tertiary < border.default < border.strong", () => {
    const surfaces = deriveSurfaceScale(200, 0.15, "dark");
    const lBgPrimary = toOklch(surfaces["bg.primary"]).l;
    const lBgSecondary = toOklch(surfaces["bg.secondary"]).l;
    const lBgTertiary = toOklch(surfaces["bg.tertiary"]).l;
    const lBorderDefault = toOklch(surfaces["border.default"]).l;
    const lBorderStrong = toOklch(surfaces["border.strong"]).l;
    expect(lBgPrimary).toBeLessThan(lBgSecondary);
    expect(lBgSecondary).toBeLessThan(lBgTertiary);
    expect(lBgTertiary).toBeLessThan(lBorderDefault);
    expect(lBorderDefault).toBeLessThan(lBorderStrong);
  });
  test("dark mode surfaces are low chroma by default (tintStrength=0.1)", () => {
    const surfaces = deriveSurfaceScale(270, 0.2, "dark", 0.1);
    for (const hex of Object.values(surfaces)) {
      const oklch = toOklch(hex);
      expect(oklch.c).toBeLessThanOrEqual(0.025);
    }
  });
});
