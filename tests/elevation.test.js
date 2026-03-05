// @ts-check

/**
 * Repository module for elevation.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  generateShadow,
  generateShadowScale,
  adaptShadowForDarkMode,
  generateDarkModeShadow,
  getZIndexScale,
  getZIndex,
  getBorderScale,
  getBorderRadiusScale,
  nestedRadius,
  getSurfaceMaterial,
  getEdgeHighlight,
  getEdgeHighlightDeclaration
} from "../src/elevation/index.js";
function extractOpacity(color) {
  const m = /\/\s*([\d.]+)\s*\)/.exec(color);
  if (m === null || m[1] === undefined) {
    throw new Error(`Cannot parse opacity from: ${color}`);
  }
  return parseFloat(m[1]);
}
const ALL_LEVELS = [0, 1, 2, 3, 4, 5];
const NAMED_LEVELS = [1, 2, 3, 4, 5];
describe("generateShadow - level 0 (none)", () => {
  test("returns empty layers array", () => {
    const shadow = generateShadow(0);
    expect(shadow.layers).toHaveLength(0);
  });
  test("returns css === 'none'", () => {
    const shadow = generateShadow(0);
    expect(shadow.css).toBe("none");
  });
  test("level and name fields are correct", () => {
    const shadow = generateShadow(0);
    expect(shadow.level).toBe(0);
    expect(shadow.name).toBe("none");
  });
});
describe("generateShadow - levels 1–5 structure", () => {
  test("each level produces exactly 2 layers (key + ambient)", () => {
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      expect(shadow.layers).toHaveLength(2);
    }
  });
  test("level and name fields match the scale", () => {
    const names = ["xs", "sm", "md", "lg", "xl"];
    for (let i = 0;i < NAMED_LEVELS.length; i++) {
      const level = NAMED_LEVELS[i];
      const shadow = generateShadow(level);
      expect(shadow.level).toBe(level);
      expect(shadow.name).toBe(names[i]);
    }
  });
  test("key layer (index 0) has positive offsetY and positive blur", () => {
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      const key = shadow.layers[0];
      expect(key.offsetY).toBeGreaterThan(0);
      expect(key.blur).toBeGreaterThan(0);
    }
  });
  test("key layer has negative spread (inward)", () => {
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      const key = shadow.layers[0];
      expect(key.spread).toBeLessThan(0);
    }
  });
  test("ambient layer (index 1) has zero offsetX, offsetY, and spread", () => {
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      const ambient = shadow.layers[1];
      expect(ambient.offsetX).toBe(0);
      expect(ambient.offsetY).toBe(0);
      expect(ambient.spread).toBe(0);
    }
  });
  test("ambient layer has positive blur", () => {
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      const ambient = shadow.layers[1];
      expect(ambient.blur).toBeGreaterThan(0);
    }
  });
  test("key and ambient offsetX are both 0 (light-from-above model)", () => {
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      expect(shadow.layers[0].offsetX).toBe(0);
      expect(shadow.layers[1].offsetX).toBe(0);
    }
  });
  test("shadow colors are valid OKLCH strings with alpha", () => {
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      for (const layer of shadow.layers) {
        expect(layer.color).toMatch(/^oklch\(0 0 0 \/ [\d.]+\)$/);
      }
    }
  });
  test("css string is not empty for levels 1–5", () => {
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      expect(shadow.css).not.toBe("none");
      expect(shadow.css.length).toBeGreaterThan(0);
    }
  });
  test("css string contains exactly one comma (two shadow layers)", () => {
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      const commas = (shadow.css.match(/,/g) ?? []).length;
      expect(commas).toBe(1);
    }
  });
});
describe("generateShadow - monotonic scaling across levels", () => {
  test("key shadow offsetY increases monotonically with level", () => {
    let prev = -1 / 0;
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      const y = shadow.layers[0].offsetY;
      expect(y).toBeGreaterThan(prev);
      prev = y;
    }
  });
  test("key shadow blur increases monotonically with level", () => {
    let prev = -1 / 0;
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      const blur = shadow.layers[0].blur;
      expect(blur).toBeGreaterThan(prev);
      prev = blur;
    }
  });
  test("ambient shadow blur increases monotonically with level", () => {
    let prev = -1 / 0;
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      const blur = shadow.layers[1].blur;
      expect(blur).toBeGreaterThan(prev);
      prev = blur;
    }
  });
  test("key spread becomes more negative (more inward) with level", () => {
    let prev = 1 / 0;
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      const spread = shadow.layers[0].spread;
      expect(spread).toBeLessThan(prev);
      prev = spread;
    }
  });
});
describe("generateShadow - Spec 04 Appendix A exact values", () => {
  test("level 1 (xs): offsetY=0.5, keyBlur=1, spread=-0.25, ambientBlur=2", () => {
    const shadow = generateShadow(1);
    const key = shadow.layers[0];
    const ambient = shadow.layers[1];
    expect(key.offsetY).toBe(0.5);
    expect(key.blur).toBe(1);
    expect(key.spread).toBe(-0.25);
    expect(ambient.blur).toBe(2);
  });
  test("level 2 (sm): offsetY=1, keyBlur=2, spread=-0.5, ambientBlur=4", () => {
    const shadow = generateShadow(2);
    const key = shadow.layers[0];
    const ambient = shadow.layers[1];
    expect(key.offsetY).toBe(1);
    expect(key.blur).toBe(2);
    expect(key.spread).toBe(-0.5);
    expect(ambient.blur).toBe(4);
  });
  test("level 3 (md): offsetY=1.5, keyBlur=3, spread=-0.75, ambientBlur=6", () => {
    const shadow = generateShadow(3);
    const key = shadow.layers[0];
    const ambient = shadow.layers[1];
    expect(key.offsetY).toBe(1.5);
    expect(key.blur).toBe(3);
    expect(key.spread).toBe(-0.75);
    expect(ambient.blur).toBe(6);
  });
  test("level 4 (lg): offsetY=2, keyBlur=4, spread=-1, ambientBlur=8", () => {
    const shadow = generateShadow(4);
    const key = shadow.layers[0];
    const ambient = shadow.layers[1];
    expect(key.offsetY).toBe(2);
    expect(key.blur).toBe(4);
    expect(key.spread).toBe(-1);
    expect(ambient.blur).toBe(8);
  });
  test("level 5 (xl): offsetY=2.5, keyBlur=5, spread=-1.25, ambientBlur=10", () => {
    const shadow = generateShadow(5);
    const key = shadow.layers[0];
    const ambient = shadow.layers[1];
    expect(key.offsetY).toBe(2.5);
    expect(key.blur).toBe(5);
    expect(key.spread).toBe(-1.25);
    expect(ambient.blur).toBe(10);
  });
  test("light-mode key opacity is 0.08 for all levels 1–5", () => {
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      const opacity = extractOpacity(shadow.layers[0].color);
      expect(opacity).toBeCloseTo(0.08, 4);
    }
  });
  test("light-mode ambient opacity is 0.06 for all levels 1–5", () => {
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      const opacity = extractOpacity(shadow.layers[1].color);
      expect(opacity).toBeCloseTo(0.06, 4);
    }
  });
});
describe("generateShadow - opacity overrides via ShadowOptions", () => {
  test("custom keyOpacity is applied", () => {
    const shadow = generateShadow(2, { keyOpacity: 0.15 });
    const opacity = extractOpacity(shadow.layers[0].color);
    expect(opacity).toBeCloseTo(0.15, 4);
  });
  test("custom ambientOpacity is applied", () => {
    const shadow = generateShadow(2, { ambientOpacity: 0.12 });
    const opacity = extractOpacity(shadow.layers[1].color);
    expect(opacity).toBeCloseTo(0.12, 4);
  });
  test("level 0 ignores opacity overrides (still returns no shadow)", () => {
    const shadow = generateShadow(0, { keyOpacity: 0.5 });
    expect(shadow.layers).toHaveLength(0);
    expect(shadow.css).toBe("none");
  });
});
describe("generateShadowScale", () => {
  test("returns an array of 6 shadows (levels 0–5)", () => {
    const scale = generateShadowScale();
    expect(scale).toHaveLength(6);
  });
  test("levels in the array are 0, 1, 2, 3, 4, 5 in order", () => {
    const scale = generateShadowScale();
    for (let i = 0;i < 6; i++) {
      expect(scale[i].level).toBe(i);
    }
  });
  test("first entry is the none shadow", () => {
    const scale = generateShadowScale();
    expect(scale[0].css).toBe("none");
  });
});
describe("adaptShadowForDarkMode", () => {
  test("level-0 shadow is returned unchanged (no layers)", () => {
    const none = generateShadow(0);
    const adapted = adaptShadowForDarkMode(none);
    expect(adapted.css).toBe("none");
    expect(adapted.layers).toHaveLength(0);
  });
  test("dark-mode key opacity is higher than light-mode key opacity", () => {
    for (const level of NAMED_LEVELS) {
      const light = generateShadow(level);
      const dark = adaptShadowForDarkMode(light);
      const lightOp = extractOpacity(light.layers[0].color);
      const darkOp = extractOpacity(dark.layers[0].color);
      expect(darkOp).toBeGreaterThan(lightOp);
    }
  });
  test("dark-mode ambient opacity is higher than light-mode ambient opacity", () => {
    for (const level of NAMED_LEVELS) {
      const light = generateShadow(level);
      const dark = adaptShadowForDarkMode(light);
      const lightOp = extractOpacity(light.layers[1].color);
      const darkOp = extractOpacity(dark.layers[1].color);
      expect(darkOp).toBeGreaterThan(lightOp);
    }
  });
  test("default multiplier produces key opacity ≈ 0.30 from 0.08 baseline", () => {
    const light = generateShadow(3);
    const dark = adaptShadowForDarkMode(light);
    const opacity = extractOpacity(dark.layers[0].color);
    expect(opacity).toBeCloseTo(0.08 * 3.75, 2);
  });
  test("default multiplier produces ambient opacity ≈ 0.20 from 0.06 baseline", () => {
    const light = generateShadow(3);
    const dark = adaptShadowForDarkMode(light);
    const opacity = extractOpacity(dark.layers[1].color);
    expect(opacity).toBeCloseTo(0.06 * 3.33, 2);
  });
  test("blur is reduced by default blurReductionFactor (0.1 = 10%)", () => {
    const light = generateShadow(3);
    const dark = adaptShadowForDarkMode(light);
    const lightBlur = light.layers[0].blur;
    const darkBlur = dark.layers[0].blur;
    expect(darkBlur).toBeCloseTo(lightBlur * 0.9, 5);
  });
  test("custom multipliers are honoured", () => {
    const light = generateShadow(2);
    const dark = adaptShadowForDarkMode(light, {
      keyOpacityMultiplier: 2,
      ambientOpacityMultiplier: 2
    });
    const keyOp = extractOpacity(dark.layers[0].color);
    const ambOp = extractOpacity(dark.layers[1].color);
    expect(keyOp).toBeCloseTo(0.08 * 2, 4);
    expect(ambOp).toBeCloseTo(0.06 * 2, 4);
  });
  test("maxOpacity cap is respected", () => {
    const light = generateShadow(5);
    const dark = adaptShadowForDarkMode(light, {
      keyOpacityMultiplier: 100,
      maxOpacity: 0.5
    });
    const keyOp = extractOpacity(dark.layers[0].color);
    expect(keyOp).toBeLessThanOrEqual(0.5);
  });
  test("adapted shadow preserves level and name", () => {
    const light = generateShadow(4);
    const dark = adaptShadowForDarkMode(light);
    expect(dark.level).toBe(4);
    expect(dark.name).toBe("lg");
  });
  test("css string on adapted shadow is non-empty", () => {
    const light = generateShadow(2);
    const dark = adaptShadowForDarkMode(light);
    expect(dark.css.length).toBeGreaterThan(0);
    expect(dark.css).not.toBe("none");
  });
});
describe("generateDarkModeShadow", () => {
  test("level-0 returns none shadow", () => {
    const shadow = generateDarkModeShadow(0);
    expect(shadow.css).toBe("none");
  });
  test("produces same result as adaptShadowForDarkMode(generateShadow(level))", () => {
    for (const level of NAMED_LEVELS) {
      const direct = generateDarkModeShadow(level);
      const composed = adaptShadowForDarkMode(generateShadow(level));
      expect(direct.css).toBe(composed.css);
    }
  });
});
describe("getZIndexScale", () => {
  test("returns an object with all required layer keys", () => {
    const scale = getZIndexScale();
    const requiredKeys = [
      "base",
      "raised",
      "dropdown",
      "sticky",
      "overlay",
      "modal",
      "popover",
      "toast",
      "max"
    ];
    for (const key of requiredKeys) {
      expect(scale[key]).toBeDefined();
    }
  });
  test("base is 0", () => {
    expect(getZIndexScale().base).toBe(0);
  });
  test("layers increase or stay equal monotonically (base → max)", () => {
    const scale = getZIndexScale();
    const ordered = [
      "base",
      "raised",
      "dropdown",
      "sticky",
      "overlay",
      "modal",
      "popover",
      "toast",
      "max"
    ];
    for (let i = 1;i < ordered.length; i++) {
      const prev = scale[ordered[i - 1]];
      const curr = scale[ordered[i]];
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });
  test("modal is above overlay (backdrop)", () => {
    const scale = getZIndexScale();
    expect(scale.modal).toBeGreaterThan(scale.overlay);
  });
  test("popover is above modal", () => {
    const scale = getZIndexScale();
    expect(scale.popover).toBeGreaterThan(scale.modal);
  });
  test("toast is above popover", () => {
    const scale = getZIndexScale();
    expect(scale.toast).toBeGreaterThan(scale.popover);
  });
  test("max is the largest value", () => {
    const scale = getZIndexScale();
    const values = Object.values(scale);
    expect(scale.max).toBe(Math.max(...values));
  });
  test("returned object is a shallow copy (mutation does not affect future calls)", () => {
    const a = getZIndexScale();
    a["base"] = 9999;
    const b = getZIndexScale();
    expect(b.base).toBe(0);
  });
});
describe("getZIndex", () => {
  test("returns the correct value for each layer", () => {
    const scale = getZIndexScale();
    const layers = [
      "base",
      "raised",
      "dropdown",
      "sticky",
      "overlay",
      "modal",
      "popover",
      "tooltip",
      "toast",
      "max"
    ];
    for (const layer of layers) {
      expect(getZIndex(layer)).toBe(scale[layer]);
    }
  });
});
describe("getBorderScale", () => {
  test("none is 0", () => {
    expect(getBorderScale().none).toBe(0);
  });
  test("thin is 1", () => {
    expect(getBorderScale().thin).toBe(1);
  });
  test("default is 1 (same as thin)", () => {
    expect(getBorderScale().default).toBe(1);
  });
  test("medium is 2", () => {
    expect(getBorderScale().medium).toBe(2);
  });
  test("thick is 4 (no 3px step per spec)", () => {
    expect(getBorderScale().thick).toBe(4);
  });
  test("widths are non-decreasing: none ≤ thin ≤ medium ≤ thick", () => {
    const s = getBorderScale();
    expect(s.none).toBeLessThanOrEqual(s.thin);
    expect(s.thin).toBeLessThanOrEqual(s.medium);
    expect(s.medium).toBeLessThanOrEqual(s.thick);
  });
});
describe("getBorderRadiusScale", () => {
  test("none is 0", () => {
    expect(getBorderRadiusScale().none).toBe(0);
  });
  test("sm is 4", () => {
    expect(getBorderRadiusScale().sm).toBe(4);
  });
  test("md is 8", () => {
    expect(getBorderRadiusScale().md).toBe(8);
  });
  test("lg is 12", () => {
    expect(getBorderRadiusScale().lg).toBe(12);
  });
  test("xl is 16", () => {
    expect(getBorderRadiusScale().xl).toBe(16);
  });
  test("2xl is 24", () => {
    expect(getBorderRadiusScale()["2xl"]).toBe(24);
  });
  test("full is 9999", () => {
    expect(getBorderRadiusScale().full).toBe(9999);
  });
  test("scale is strictly increasing: none < sm < md < lg < xl < 2xl < full", () => {
    const s = getBorderRadiusScale();
    expect(s.none).toBeLessThan(s.sm);
    expect(s.sm).toBeLessThan(s.md);
    expect(s.md).toBeLessThan(s.lg);
    expect(s.lg).toBeLessThan(s.xl);
    expect(s.xl).toBeLessThan(s["2xl"]);
    expect(s["2xl"]).toBeLessThan(s.full);
  });
});
describe("nestedRadius", () => {
  test("returns outerRadius - padding when result is positive", () => {
    expect(nestedRadius(12, 8)).toBe(4);
  });
  test("returns 0 when outerRadius <= padding", () => {
    expect(nestedRadius(12, 24)).toBe(0);
  });
  test("returns 0 when outerRadius equals padding", () => {
    expect(nestedRadius(8, 8)).toBe(0);
  });
  test("returns 0 when padding is 0 and outerRadius is 0", () => {
    expect(nestedRadius(0, 0)).toBe(0);
  });
  test("returns full outer radius when padding is 0", () => {
    expect(nestedRadius(16, 0)).toBe(16);
  });
  test("never returns a negative value", () => {
    expect(nestedRadius(4, 100)).toBeGreaterThanOrEqual(0);
  });
});
describe("getSurfaceMaterial - flat", () => {
  test("returns a background property", () => {
    const mat = getSurfaceMaterial("flat");
    expect(mat.background).toBeDefined();
    expect(mat.background.length).toBeGreaterThan(0);
  });
  test("does not have backdropFilter", () => {
    const mat = getSurfaceMaterial("flat");
    expect(mat.backdropFilter).toBeUndefined();
  });
  test("has a border (border-defined depth)", () => {
    const mat = getSurfaceMaterial("flat");
    expect(mat.border).toBeDefined();
    expect(mat.border.length).toBeGreaterThan(0);
  });
});
describe("getSurfaceMaterial - elevated", () => {
  test("returns a background property", () => {
    const mat = getSurfaceMaterial("elevated");
    expect(mat.background).toBeDefined();
    expect(mat.background.length).toBeGreaterThan(0);
  });
  test("does not have backdropFilter", () => {
    const mat = getSurfaceMaterial("elevated");
    expect(mat.backdropFilter).toBeUndefined();
  });
  test("does not have a border", () => {
    const mat = getSurfaceMaterial("elevated");
    expect(mat.border).toBeUndefined();
  });
});
describe("getSurfaceMaterial - matte", () => {
  test("returns a background property", () => {
    const mat = getSurfaceMaterial("matte");
    expect(mat.background).toBeDefined();
    expect(mat.background.length).toBeGreaterThan(0);
  });
  test("does not have backdropFilter", () => {
    const mat = getSurfaceMaterial("matte");
    expect(mat.backdropFilter).toBeUndefined();
  });
});
describe("getSurfaceMaterial - glass (light mode)", () => {
  test("background contains oklch relative color syntax with opacity 0.7", () => {
    const mat = getSurfaceMaterial("glass");
    expect(mat.background).toContain("0.7");
    expect(mat.background).toContain("oklch");
  });
  test("backdropFilter contains blur(12px)", () => {
    const mat = getSurfaceMaterial("glass");
    expect(mat.backdropFilter).toBe("blur(12px)");
  });
  test("border is defined and semi-transparent (0.2 opacity)", () => {
    const mat = getSurfaceMaterial("glass");
    expect(mat.border).toBeDefined();
    expect(mat.border).toContain("0.2");
  });
});
describe("getSurfaceMaterial - glass (dark mode)", () => {
  test("background contains lower opacity (0.5) in dark mode", () => {
    const mat = getSurfaceMaterial("glass", { darkMode: true });
    expect(mat.background).toContain("0.5");
    expect(mat.background).not.toContain("0.7");
  });
  test("backdropFilter contains larger blur (16px) in dark mode", () => {
    const mat = getSurfaceMaterial("glass", { darkMode: true });
    expect(mat.backdropFilter).toBe("blur(16px)");
  });
  test("border is still present in dark mode", () => {
    const mat = getSurfaceMaterial("glass", { darkMode: true });
    expect(mat.border).toBeDefined();
  });
});
describe("getEdgeHighlight", () => {
  test("returns the exact spec value", () => {
    expect(getEdgeHighlight()).toBe("inset 0 1px 0 0 oklch(1 0 0 / 0.06)");
  });
  test("starts with 'inset'", () => {
    expect(getEdgeHighlight()).toMatch(/^inset/);
  });
});
describe("getEdgeHighlightDeclaration", () => {
  test("is a CSS custom property declaration", () => {
    const decl = getEdgeHighlightDeclaration();
    expect(decl).toMatch(/^--shadow-edge-highlight:\s*/);
    expect(decl).toMatch(/;$/);
  });
  test("contains the highlight value", () => {
    expect(getEdgeHighlightDeclaration()).toContain(getEdgeHighlight());
  });
});
describe("CSS string format", () => {
  function validateBoxShadowFragment(fragment) {
    const trimmed = fragment.trim();
    return /^[\d.-]+px\s+[\d.-]+px\s+[\d.-]+px\s+[\d.-]+px\s+oklch\(/.test(trimmed);
  }
  test("each fragment of the css string is a valid box-shadow layer", () => {
    for (const level of NAMED_LEVELS) {
      const shadow = generateShadow(level);
      const fragments = shadow.css.split(",");
      expect(fragments).toHaveLength(2);
      for (const fragment of fragments) {
        expect(validateBoxShadowFragment(fragment)).toBe(true);
      }
    }
  });
  test("dark-mode css string fragments are also valid box-shadow layers", () => {
    for (const level of NAMED_LEVELS) {
      const shadow = generateDarkModeShadow(level);
      const fragments = shadow.css.split(",");
      for (const fragment of fragments) {
        expect(validateBoxShadowFragment(fragment)).toBe(true);
      }
    }
  });
});
describe("sub-path export: @sig-ui/core/elevation", () => {
  test("all public functions are exported", async () => {
    const mod = await import("../src/elevation-export.js");
    expect(mod.generateShadow).toBeFunction();
    expect(mod.generateShadowScale).toBeFunction();
    expect(mod.adaptShadowForDarkMode).toBeFunction();
    expect(mod.generateDarkModeShadow).toBeFunction();
    expect(mod.getZIndexScale).toBeFunction();
    expect(mod.getZIndex).toBeFunction();
    expect(mod.getBorderScale).toBeFunction();
    expect(mod.getBorderRadiusScale).toBeFunction();
    expect(mod.nestedRadius).toBeFunction();
    expect(mod.getSurfaceMaterial).toBeFunction();
    expect(mod.getEdgeHighlight).toBeFunction();
    expect(mod.getEdgeHighlightDeclaration).toBeFunction();
  });
});
