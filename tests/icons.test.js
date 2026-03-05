// @ts-check

/**
 * Repository module for icons.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  ICON_SIZES,
  ICON_STROKES,
  STROKE_PROFILES,
  DEFAULT_DARK_MODE_COMPENSATION,
  getIconSize,
  getIconStroke,
  getStrokeProfile,
  getStrokeForSize,
  computeCornerRadius,
  ICON_CATEGORIES,
  ICON_ALIASES,
  CORE_ICON_MANIFEST,
  resolveIconName,
  validateIconName,
  getIconCategory,
  ICONS_THAT_MIRROR,
  ICONS_THAT_DO_NOT_MIRROR,
  shouldMirrorInRTL,
  isFixedDirection,
  DEFAULT_ICON_CONFIG,
  resolveIconConfig,
  validateIconConfig,
  iconsToDTCG,
  themeToDTCG
} from "../src/index.js";
describe("icons/scale", () => {
  test("ICON_SIZES has 6 entries", () => {
    expect(Object.keys(ICON_SIZES)).toHaveLength(6);
  });
  test("ICON_SIZES default is 24px / 1.5rem", () => {
    expect(ICON_SIZES.default.px).toBe(24);
    expect(ICON_SIZES.default.rem).toBe(1.5);
    expect(ICON_SIZES.default.strokeWidth).toBe(1.5);
  });
  test("ICON_SIZES xs is 12px", () => {
    expect(ICON_SIZES.xs.px).toBe(12);
  });
  test("ICON_SIZES xl is 48px", () => {
    expect(ICON_SIZES.xl.px).toBe(48);
  });
  test("ICON_STROKES has 4 entries", () => {
    expect(Object.keys(ICON_STROKES)).toHaveLength(4);
  });
  test("ICON_STROKES default is 1.5 width", () => {
    expect(ICON_STROKES.default.width).toBe(1.5);
    expect(ICON_STROKES.default.cornerRadius).toBe(0.75);
  });
  test("ICON_STROKES bold is 2.5 width", () => {
    expect(ICON_STROKES.bold.width).toBe(2.5);
  });
  test("getIconSize returns correct definition", () => {
    const size = getIconSize("lg");
    expect(size.px).toBe(32);
    expect(size.rem).toBe(2);
  });
  test("getIconStroke returns correct definition", () => {
    const stroke = getIconStroke("thin");
    expect(stroke.width).toBe(1);
    expect(stroke.cornerRadius).toBe(0.5);
  });
  test("getStrokeProfile returns rounded config", () => {
    const profile = getStrokeProfile("rounded");
    expect(profile.linecap).toBe("round");
    expect(profile.linejoin).toBe("round");
  });
  test("getStrokeProfile returns geometric config", () => {
    const profile = getStrokeProfile("geometric");
    expect(profile.linecap).toBe("square");
    expect(profile.linejoin).toBe("miter");
  });
  test("getStrokeForSize returns recommended stroke", () => {
    expect(getStrokeForSize("xs")).toBe(1);
    expect(getStrokeForSize("default")).toBe(1.5);
    expect(getStrokeForSize("xl")).toBe(2.5);
  });
  test("computeCornerRadius returns width × 0.5", () => {
    expect(computeCornerRadius(2)).toBe(1);
    expect(computeCornerRadius(1.5)).toBe(0.75);
    expect(computeCornerRadius(0)).toBe(0);
  });
  test("DEFAULT_DARK_MODE_COMPENSATION has expected values", () => {
    expect(DEFAULT_DARK_MODE_COMPENSATION.outlinedOpacity).toBe(0.88);
    expect(DEFAULT_DARK_MODE_COMPENSATION.outlinedOpacityHiDPI).toBe(0.93);
    expect(DEFAULT_DARK_MODE_COMPENSATION.filledLightnessOffset).toBe(-0.03);
    expect(DEFAULT_DARK_MODE_COMPENSATION.filledLightnessOffsetHiDPI).toBe(-0.01);
  });
  test("STROKE_PROFILES has rounded and geometric", () => {
    expect(Object.keys(STROKE_PROFILES)).toEqual(["rounded", "geometric"]);
  });
});
describe("icons/naming", () => {
  test("ICON_CATEGORIES has 10 entries", () => {
    expect(ICON_CATEGORIES).toHaveLength(10);
  });
  test("ICON_CATEGORIES includes expected categories", () => {
    expect(ICON_CATEGORIES).toContain("navigation");
    expect(ICON_CATEGORIES).toContain("action");
    expect(ICON_CATEGORIES).toContain("status");
    expect(ICON_CATEGORIES).toContain("media");
    expect(ICON_CATEGORIES).toContain("editor");
  });
  test("ICON_ALIASES maps common names", () => {
    expect(ICON_ALIASES["trash"]).toBe("action-delete");
    expect(ICON_ALIASES["pencil"]).toBe("action-edit");
    expect(ICON_ALIASES["home"]).toBe("nav-home");
    expect(ICON_ALIASES["close"]).toBe("nav-close");
  });
  test("CORE_ICON_MANIFEST has entries", () => {
    expect(CORE_ICON_MANIFEST.length).toBeGreaterThan(40);
  });
  test("manifest entries have required fields", () => {
    for (const entry of CORE_ICON_MANIFEST) {
      expect(entry.name).toBeTruthy();
      expect(entry.category).toBeTruthy();
      expect(Array.isArray(entry.aliases)).toBe(true);
      expect(typeof entry.directional).toBe("boolean");
      expect(entry.description).toBeTruthy();
    }
  });
  test("resolveIconName resolves canonical names", () => {
    expect(resolveIconName("nav-home")).toBe("nav-home");
    expect(resolveIconName("action-delete")).toBe("action-delete");
  });
  test("resolveIconName resolves built-in aliases", () => {
    expect(resolveIconName("trash")).toBe("action-delete");
    expect(resolveIconName("pencil")).toBe("action-edit");
    expect(resolveIconName("home")).toBe("nav-home");
  });
  test("resolveIconName resolves custom aliases", () => {
    expect(resolveIconName("bin", { bin: "action-delete" })).toBe("action-delete");
  });
  test("resolveIconName returns undefined for unknown names", () => {
    expect(resolveIconName("nonexistent-icon")).toBeUndefined();
  });
  test("validateIconName returns true for valid names", () => {
    expect(validateIconName("nav-home")).toBe(true);
    expect(validateIconName("trash")).toBe(true);
  });
  test("validateIconName returns false for invalid names", () => {
    expect(validateIconName("not-an-icon")).toBe(false);
  });
  test("getIconCategory returns correct category", () => {
    expect(getIconCategory("nav-home")).toBe("navigation");
    expect(getIconCategory("action-delete")).toBe("action");
    expect(getIconCategory("status-success")).toBe("status");
    expect(getIconCategory("trash")).toBe("action");
  });
  test("getIconCategory returns undefined for unknown names", () => {
    expect(getIconCategory("nonexistent")).toBeUndefined();
  });
});
describe("icons/directional", () => {
  test("ICONS_THAT_MIRROR has entries", () => {
    expect(ICONS_THAT_MIRROR.length).toBeGreaterThanOrEqual(15);
  });
  test("ICONS_THAT_DO_NOT_MIRROR has entries", () => {
    expect(ICONS_THAT_DO_NOT_MIRROR.length).toBeGreaterThanOrEqual(15);
  });
  test("all mirror rules have mirror=true", () => {
    for (const rule of ICONS_THAT_MIRROR) {
      expect(rule.mirror).toBe(true);
    }
  });
  test("all fixed rules have mirror=false", () => {
    for (const rule of ICONS_THAT_DO_NOT_MIRROR) {
      expect(rule.mirror).toBe(false);
    }
  });
  test("shouldMirrorInRTL returns true for directional icons", () => {
    expect(shouldMirrorInRTL("nav-arrow-left")).toBe(true);
    expect(shouldMirrorInRTL("action-undo")).toBe(true);
    expect(shouldMirrorInRTL("editor-align-left")).toBe(true);
  });
  test("shouldMirrorInRTL returns false for fixed icons", () => {
    expect(shouldMirrorInRTL("status-success")).toBe(false);
    expect(shouldMirrorInRTL("media-play")).toBe(false);
  });
  test("isFixedDirection returns true for non-mirroring icons", () => {
    expect(isFixedDirection("status-success")).toBe(true);
    expect(isFixedDirection("media-play")).toBe(true);
    expect(isFixedDirection("nav-close")).toBe(true);
  });
  test("isFixedDirection returns false for mirroring icons", () => {
    expect(isFixedDirection("nav-arrow-left")).toBe(false);
  });
  test("no icon appears in both mirror and fixed lists", () => {
    const mirrorNames = new Set(ICONS_THAT_MIRROR.map((r) => r.icon));
    const fixedNames = new Set(ICONS_THAT_DO_NOT_MIRROR.map((r) => r.icon));
    for (const name of mirrorNames) {
      expect(fixedNames.has(name)).toBe(false);
    }
  });
});
describe("icons/config", () => {
  test("DEFAULT_ICON_CONFIG has expected shape", () => {
    expect(DEFAULT_ICON_CONFIG.strokeProfile).toBe("rounded");
    expect(DEFAULT_ICON_CONFIG.cornerRadiusRatio).toBe(0.5);
    expect(DEFAULT_ICON_CONFIG.delivery).toBe("inline-svg");
    expect(DEFAULT_ICON_CONFIG.verticalAlign).toBe(-0.125);
  });
  test("resolveIconConfig returns defaults with no input", () => {
    const config = resolveIconConfig();
    expect(config.sizes.default.px).toBe(24);
    expect(config.strokes.default.width).toBe(1.5);
    expect(config.strokeProfile).toBe("rounded");
  });
  test("resolveIconConfig merges partial overrides", () => {
    const config = resolveIconConfig({
      strokeProfile: "geometric",
      cornerRadiusRatio: 0.3
    });
    expect(config.strokeProfile).toBe("geometric");
    expect(config.cornerRadiusRatio).toBe(0.3);
    expect(config.sizes.default.px).toBe(24);
    expect(config.delivery).toBe("inline-svg");
  });
  test("resolveIconConfig merges dark mode overrides", () => {
    const config = resolveIconConfig({
      darkMode: { outlinedOpacity: 0.9 }
    });
    expect(config.darkMode.outlinedOpacity).toBe(0.9);
    expect(config.darkMode.outlinedOpacityHiDPI).toBe(0.93);
  });
  test("validateIconConfig returns no errors for defaults", () => {
    const errors = validateIconConfig(DEFAULT_ICON_CONFIG);
    expect(errors).toHaveLength(0);
  });
  test("validateIconConfig catches invalid opacity", () => {
    const config = resolveIconConfig({
      darkMode: { outlinedOpacity: 1.5 }
    });
    const errors = validateIconConfig(config);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.field.includes("outlinedOpacity"))).toBe(true);
  });
  test("validateIconConfig catches negative corner radius ratio", () => {
    const config = resolveIconConfig({
      cornerRadiusRatio: -0.1
    });
    const errors = validateIconConfig(config);
    expect(errors.some((e) => e.field === "cornerRadiusRatio")).toBe(true);
  });
});
describe("iconsToDTCG", () => {
  test("produces icon group with size, stroke, darkMode", () => {
    const result = iconsToDTCG();
    expect(result.icon).toBeDefined();
    expect(result.icon.size).toBeDefined();
    expect(result.icon.stroke).toBeDefined();
    expect(result.icon.darkMode).toBeDefined();
  });
  test("size group has $type dimension", () => {
    const result = iconsToDTCG();
    expect(result.icon.size.$type).toBe("dimension");
  });
  test("size tokens have correct default values", () => {
    const result = iconsToDTCG();
    expect(result.icon.size.default.$value).toBe("1.5rem");
    expect(result.icon.size.xs.$value).toBe("0.75rem");
    expect(result.icon.size.xl.$value).toBe("3rem");
  });
  test("stroke group has $type dimension", () => {
    const result = iconsToDTCG();
    expect(result.icon.stroke.$type).toBe("dimension");
  });
  test("stroke tokens have correct default values", () => {
    const result = iconsToDTCG();
    expect(result.icon.stroke.default.$value).toBe("1.5px");
    expect(result.icon.stroke.thin.$value).toBe("1px");
    expect(result.icon.stroke.bold.$value).toBe("2.5px");
  });
  test("darkMode group has $type number", () => {
    const result = iconsToDTCG();
    expect(result.icon.darkMode.$type).toBe("number");
  });
  test("darkMode tokens have expected values", () => {
    const result = iconsToDTCG();
    expect(result.icon.darkMode["outlined-opacity"].$value).toBe(0.88);
    expect(result.icon.darkMode["filled-l-offset"].$value).toBe(-0.03);
  });
  test("custom config overrides defaults", () => {
    const result = iconsToDTCG({
      sizes: { sm: "0.875rem", default: "1rem" },
      darkMode: { outlinedOpacity: 0.95 }
    });
    expect(result.icon.size.sm.$value).toBe("0.875rem");
    expect(result.icon.size.default.$value).toBe("1rem");
    expect(result.icon.darkMode["outlined-opacity"].$value).toBe(0.95);
  });
  test("themeToDTCG includes icons when present", () => {
    const result = themeToDTCG({ icons: {} });
    expect(result.icon).toBeDefined();
    expect(result.icon.size).toBeDefined();
  });
  test("themeToDTCG omits icons when absent", () => {
    const result = themeToDTCG({});
    expect(result.icon).toBeUndefined();
  });
});
