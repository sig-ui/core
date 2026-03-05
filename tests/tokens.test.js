// @ts-check

/**
 * Repository module for tokens.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  rampToDTCG,
  paletteToDTCG,
  rolesToDTCG,
  spacingToDTCG,
  typographyToDTCG,
  shadowsToDTCG,
  motionToDTCG,
  themeToDTCG
} from "../src/tokens.js";
import { generateShadeRamp } from "../src/generation/shade.js";
import { toOklch } from "../src/color-space/oklch.js";
import { ALL_STOPS } from "../src/generation/targets.js";
const bgLight = toOklch("#f8fafc");
function makeRamp(hex) {
  return generateShadeRamp(toOklch(hex), {
    mode: "light",
    background: bgLight
  });
}
describe("rampToDTCG", () => {
  test("all stops produce tokens with oklch $value", () => {
    const ramp = makeRamp("#6366f1");
    const group = rampToDTCG("brand", ramp);
    const brand = group.brand;
    for (const stop of ALL_STOPS) {
      const token = brand[String(stop)];
      expect(token).toBeDefined();
      expect(token.$value).toContain("oklch(");
    }
  });
  test("group-level $type inheritance - group has $type, tokens do not", () => {
    const ramp = makeRamp("#6366f1");
    const group = rampToDTCG("brand", ramp);
    const brand = group.brand;
    expect(brand.$type).toBe("color");
    for (const stop of ALL_STOPS) {
      const token = brand[String(stop)];
      expect(token.$type).toBeUndefined();
    }
  });
  test("includes $extensions with gamut info when requested", () => {
    const ramp = generateShadeRamp(toOklch("#22c55e"), {
      mode: "light",
      background: bgLight,
      gamut: "p3"
    });
    const group = rampToDTCG("vivid", ramp, { includeGamutInfo: true });
    const vivid = group.vivid;
    for (const stop of ALL_STOPS) {
      const token = vivid[String(stop)];
      expect(token.$extensions).toBeDefined();
      const sigui = token.$extensions["com.sigui"];
      expect(sigui.gamut).toBeOneOf(["srgb", "p3"]);
    }
  });
  test("out-of-sRGB tokens include srgbFallback", () => {
    const ramp = generateShadeRamp(toOklch("#22c55e"), {
      mode: "light",
      background: bgLight,
      gamut: "p3"
    });
    const group = rampToDTCG("vivid", ramp, { includeGamutInfo: true });
    const vivid = group.vivid;
    for (const stop of ALL_STOPS) {
      const token = vivid[String(stop)];
      const sigui = token.$extensions?.["com.sigui"];
      if (sigui?.gamut === "p3") {
        expect(sigui.srgbFallback).toBeDefined();
        expect(sigui.srgbFallback).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });
  test("includes APCA Lc metadata when requested with background", () => {
    const ramp = makeRamp("#6366f1");
    const group = rampToDTCG("brand", ramp, {
      includeAPCAMetadata: true,
      background: bgLight,
      mode: "light"
    });
    const brand = group.brand;
    for (const stop of ALL_STOPS) {
      const token = brand[String(stop)];
      expect(token.$extensions).toBeDefined();
      const sigui = token.$extensions["com.sigui"];
      expect(sigui.apcaLc).toBeNumber();
      expect(sigui.apcaLc).toBeGreaterThanOrEqual(0);
    }
  });
  test("out-of-sRGB tokens have description", () => {
    const ramp = generateShadeRamp(toOklch("#22c55e"), {
      mode: "light",
      background: bgLight,
      gamut: "p3"
    });
    const group = rampToDTCG("vivid", ramp, { includeGamutInfo: true });
    const vivid = group.vivid;
    for (const stop of ALL_STOPS) {
      const token = vivid[String(stop)];
      const sigui = token.$extensions?.["com.sigui"];
      if (sigui?.gamut === "p3") {
        expect(token.$description).toBe("Out of sRGB gamut (Display P3)");
      }
    }
  });
});
describe("paletteToDTCG", () => {
  test("wraps multiple ramps into nested tree", () => {
    const ramps = {
      brand: makeRamp("#6366f1"),
      slate: makeRamp("#64748b")
    };
    const tree = paletteToDTCG(ramps);
    expect(tree.brand).toBeDefined();
    expect(tree.slate).toBeDefined();
    const brand = tree.brand;
    expect(brand.$type).toBe("color");
    expect(brand["500"].$value).toContain("oklch(");
  });
  test("passes options through to ramp generation", () => {
    const ramps = { brand: makeRamp("#6366f1") };
    const tree = paletteToDTCG(ramps, {
      includeAPCAMetadata: true,
      background: bgLight
    });
    const brand = tree.brand;
    expect(brand["500"].$extensions?.["com.sigui"]?.apcaLc).toBeNumber();
  });
});
describe("rolesToDTCG", () => {
  test("creates alias tokens with {palette.stop} syntax", () => {
    const roles = {
      primary: "brand@500",
      text: "slate@800",
      surface: "slate@100"
    };
    const group = rolesToDTCG(roles);
    expect(group.primary.$value).toBe("{brand.500}");
    expect(group.primary.$type).toBe("color");
    expect(group.text.$value).toBe("{slate.800}");
    expect(group.surface.$value).toBe("{slate.100}");
  });
  test("supports dotted paths for nested group structure", () => {
    const roles = {
      "text-secondary": "slate@600",
      "text-muted": "slate@400",
      primary: "brand@500"
    };
    const group = rolesToDTCG(roles);
    expect(group["text-secondary"].$value).toBe("{slate.600}");
    expect(group["text-muted"].$value).toBe("{slate.400}");
    expect(group.primary.$value).toBe("{brand.500}");
  });
  test("ignores roles that don't match palette@stop pattern", () => {
    const roles = {
      primary: "brand@500",
      custom: "not-a-valid-reference"
    };
    const group = rolesToDTCG(roles);
    expect(group.primary).toBeDefined();
    expect(group.custom).toBeUndefined();
  });
});
describe("spacingToDTCG", () => {
  test("produces dimension tokens under space group", () => {
    const scale = { "1": "0.25rem", "2": "0.5rem", "4": "1rem" };
    const tree = spacingToDTCG(scale);
    const space = tree.space;
    expect(space).toBeDefined();
    expect(space.$type).toBe("dimension");
    expect(space["1"].$value).toBe("0.25rem");
    expect(space["2"].$value).toBe("0.5rem");
    expect(space["4"].$value).toBe("1rem");
  });
  test("individual tokens inherit $type from group", () => {
    const scale = { "1": "0.25rem" };
    const tree = spacingToDTCG(scale);
    const space = tree.space;
    expect(space["1"].$type).toBeUndefined();
  });
});
describe("typographyToDTCG", () => {
  test("produces fontFamily tokens", () => {
    const tree = typographyToDTCG({
      fontFamilies: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    });
    const ff = tree.fontFamily;
    expect(ff.$type).toBe("fontFamily");
    expect(ff.sans.$value).toEqual(["Inter", "system-ui", "sans-serif"]);
    expect(ff.mono.$value).toEqual(["JetBrains Mono", "monospace"]);
  });
  test("produces fontSize tokens as dimension type", () => {
    const tree = typographyToDTCG({
      fontSizes: { xs: "0.6875rem", base: "1rem", "5xl": "3rem" }
    });
    const fs = tree.fontSize;
    expect(fs.$type).toBe("dimension");
    expect(fs.base.$value).toBe("1rem");
  });
  test("produces fontWeight tokens", () => {
    const tree = typographyToDTCG({
      fontWeights: { light: 300, normal: 400, bold: 700 }
    });
    const fw = tree.fontWeight;
    expect(fw.$type).toBe("fontWeight");
    expect(fw.normal.$value).toBe(400);
  });
  test("produces lineHeight tokens as number type", () => {
    const tree = typographyToDTCG({
      lineHeights: { xs: 1.71, base: 1.55, "5xl": 1.32 }
    });
    const lh = tree.lineHeight;
    expect(lh.$type).toBe("number");
    expect(lh.base.$value).toBe(1.55);
  });
  test("produces letterSpacing tokens as dimension type", () => {
    const tree = typographyToDTCG({
      letterSpacings: { xs: "0.02em", base: "0em", "5xl": "-0.02em" }
    });
    const ls = tree.letterSpacing;
    expect(ls.$type).toBe("dimension");
    expect(ls.xs.$value).toBe("0.02em");
  });
  test("produces composite typography tokens", () => {
    const tree = typographyToDTCG({
      composites: {
        body: {
          fontFamily: ["Inter", "system-ui", "sans-serif"],
          fontSize: "1rem",
          fontWeight: 400,
          lineHeight: 1.55,
          letterSpacing: "0em"
        }
      }
    });
    const typo = tree.typography;
    expect(typo.$type).toBe("typography");
    const body = typo.body.$value;
    expect(body.fontFamily).toEqual(["Inter", "system-ui", "sans-serif"]);
    expect(body.fontSize).toBe("1rem");
    expect(body.fontWeight).toBe(400);
    expect(body.lineHeight).toBe(1.55);
    expect(body.letterSpacing).toBe("0em");
  });
  test("only includes provided categories", () => {
    const tree = typographyToDTCG({ fontWeights: { bold: 700 } });
    expect(tree.fontWeight).toBeDefined();
    expect(tree.fontSize).toBeUndefined();
    expect(tree.fontFamily).toBeUndefined();
    expect(tree.lineHeight).toBeUndefined();
    expect(tree.letterSpacing).toBeUndefined();
    expect(tree.typography).toBeUndefined();
  });
});
describe("shadowsToDTCG", () => {
  test("produces shadow tokens with composite values", () => {
    const tree = shadowsToDTCG({
      xs: {
        offsetX: "0px",
        offsetY: "1px",
        blur: "2px",
        spread: "0px",
        color: "oklch(0 0 0 / 0.05)"
      }
    });
    const shadow = tree.shadow;
    expect(shadow.$type).toBe("shadow");
    const xs = shadow.xs.$value;
    expect(xs.offsetX).toBe("0px");
    expect(xs.offsetY).toBe("1px");
    expect(xs.blur).toBe("2px");
    expect(xs.color).toBe("oklch(0 0 0 / 0.05)");
  });
  test("supports multi-layer shadows (array)", () => {
    const tree = shadowsToDTCG({
      md: [
        {
          offsetX: "0px",
          offsetY: "4px",
          blur: "6px",
          spread: "-1px",
          color: "oklch(0 0 0 / 0.1)"
        },
        {
          offsetX: "0px",
          offsetY: "2px",
          blur: "4px",
          spread: "-2px",
          color: "oklch(0 0 0 / 0.1)"
        }
      ]
    });
    const shadow = tree.shadow;
    const md = shadow.md.$value;
    expect(Array.isArray(md)).toBe(true);
    expect(md).toHaveLength(2);
    expect(md[0].offsetY).toBe("4px");
    expect(md[1].offsetY).toBe("2px");
  });
});
describe("motionToDTCG", () => {
  test("produces duration tokens", () => {
    const tree = motionToDTCG({
      durations: { fast: "100ms", normal: "200ms", slow: "400ms" }
    });
    const dur = tree.duration;
    expect(dur.$type).toBe("duration");
    expect(dur.fast.$value).toBe("100ms");
    expect(dur.normal.$value).toBe("200ms");
  });
  test("produces cubicBezier easing tokens", () => {
    const tree = motionToDTCG({
      easings: {
        default: [0.2, 0, 0, 1],
        in: [0.4, 0, 1, 0.6]
      }
    });
    const easing = tree.easing;
    expect(easing.$type).toBe("cubicBezier");
    expect(easing.default.$value).toEqual([0.2, 0, 0, 1]);
    expect(easing.in.$value).toEqual([0.4, 0, 1, 0.6]);
  });
  test("only includes provided categories", () => {
    const tree = motionToDTCG({ durations: { fast: "100ms" } });
    expect(tree.duration).toBeDefined();
    expect(tree.easing).toBeUndefined();
  });
});
describe("themeToDTCG", () => {
  test("produces complete DTCG file with all token categories", () => {
    const theme = {
      palette: {
        brand: makeRamp("#6366f1"),
        slate: makeRamp("#64748b")
      },
      roles: {
        primary: "brand@500",
        text: "slate@800"
      },
      spacing: { "1": "0.25rem", "2": "0.5rem", "4": "1rem" },
      typography: {
        fontWeights: { normal: 400, bold: 700 },
        fontSizes: { base: "1rem" }
      },
      shadows: {
        xs: {
          offsetX: "0px",
          offsetY: "1px",
          blur: "2px",
          spread: "0px",
          color: "oklch(0 0 0 / 0.05)"
        }
      },
      motion: {
        durations: { fast: "100ms", normal: "200ms" },
        easings: { default: [0.2, 0, 0, 1] }
      }
    };
    const dtcg = themeToDTCG(theme);
    const color = dtcg.color;
    expect(color).toBeDefined();
    expect(color.brand).toBeDefined();
    expect(color.slate).toBeDefined();
    expect(color.brand.$type).toBe("color");
    expect(color.semantic).toBeDefined();
    expect(color.semantic.primary.$value).toBe("{brand.500}");
    expect(color.semantic.text.$value).toBe("{slate.800}");
    const space = dtcg.space;
    expect(space.$type).toBe("dimension");
    expect(space["4"].$value).toBe("1rem");
    expect(dtcg.fontWeight).toBeDefined();
    expect(dtcg.fontSize).toBeDefined();
    const shadow = dtcg.shadow;
    expect(shadow.$type).toBe("shadow");
    expect(dtcg.duration).toBeDefined();
    expect(dtcg.easing).toBeDefined();
  });
  test("passes gamut and APCA options to color tokens", () => {
    const theme = {
      palette: { brand: makeRamp("#6366f1") }
    };
    const dtcg = themeToDTCG(theme, {
      includeGamutInfo: true,
      includeAPCAMetadata: true,
      backgroundLight: bgLight
    });
    const color = dtcg.color;
    const brand = color.brand;
    const token500 = brand["500"];
    expect(token500.$extensions?.["com.sigui"]).toBeDefined();
  });
  test("works with subset of theme categories", () => {
    const dtcg = themeToDTCG({
      spacing: { "4": "1rem" },
      motion: { durations: { fast: "100ms" } }
    });
    expect(dtcg.space).toBeDefined();
    expect(dtcg.duration).toBeDefined();
    expect(dtcg.color).toBeUndefined();
    expect(dtcg.shadow).toBeUndefined();
  });
  test("output is valid JSON (serializable)", () => {
    const theme = {
      palette: { brand: makeRamp("#6366f1") },
      spacing: { "1": "0.25rem" },
      motion: { easings: { default: [0.2, 0, 0, 1] } }
    };
    const dtcg = themeToDTCG(theme);
    const json = JSON.stringify(dtcg, null, 2);
    const parsed = JSON.parse(json);
    expect(parsed.color.brand).toBeDefined();
    expect(parsed.space["1"].$value).toBe("0.25rem");
  });
});
