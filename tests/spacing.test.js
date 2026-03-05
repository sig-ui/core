// @ts-check

/**
 * Repository module for spacing.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  generateSpacingScale,
  getSpacingValue,
  SEMANTIC_SPACING_TOKENS
} from "../src/spacing/scale.js";
import {
  getMinTouchTarget,
  getTouchTargetSpec,
  computeFittsTime,
  fittsIndexOfDifficulty,
  meetsWCAGTouchTarget,
  computeHitAreaExpansion,
  TOUCH_TARGET_SIZES
} from "../src/spacing/touch-targets.js";
import {
  getDensityMultiplier,
  applyDensity,
  applyDensityClamped,
  composeSpacingScales,
  getContextScaleFactor,
  DENSITY_MULTIPLIERS,
  DENSITY_CSS_VALUES,
  DENSITY_EXEMPT_COMPONENTS,
  CONTEXT_SCALE_FACTORS
} from "../src/spacing/density.js";
import {
  getBreakpoints,
  getBreakpoint,
  getBreakpointQuery,
  getBreakpointRangeQuery,
  resolveBreakpoint,
  BREAKPOINT_VALUES,
  BREAKPOINT_ORDER
} from "../src/spacing/breakpoints.js";
import {
  getGridConfig,
  getAllGridConfigs,
  computeColumnWidth,
  computeSpanWidth,
  validateGridConfig
} from "../src/spacing/grid.js";
import {
  getRelationshipSpacing,
  getAllRelationshipSpacings,
  getDefaultSpacing,
  validateProximityHierarchy,
  spacingRelationship,
  relationshipForDepth,
  isInRelationshipRange
} from "../src/spacing/relationship.js";
describe("generateSpacingScale", () => {
  test("generates core spec values at default 4px base unit", () => {
    const scale = generateSpacingScale();
    const expected = [
      ["0", 0],
      ["px", 1],
      ["0.5", 2],
      ["1", 4],
      ["1.5", 6],
      ["2", 8],
      ["3", 12],
      ["4", 16],
      ["5", 20],
      ["6", 24],
      ["8", 32],
      ["10", 40],
      ["12", 48],
      ["16", 64],
      ["20", 80],
      ["24", 96]
    ];
    for (const [name, px] of expected) {
      const entry = scale.get(name);
      expect(entry, `Token "${name}" must exist`).toBeDefined();
      expect(entry.px).toBe(px);
    }
  });
  test("converts px to rem correctly (divide by 16)", () => {
    const scale = generateSpacingScale();
    expect(scale.get("0").rem).toBe("0");
    expect(scale.get("px").rem).toBe("0.0625rem");
    expect(scale.get("0.5").rem).toBe("0.125rem");
    expect(scale.get("1").rem).toBe("0.25rem");
    expect(scale.get("1.5").rem).toBe("0.375rem");
    expect(scale.get("2").rem).toBe("0.5rem");
    expect(scale.get("4").rem).toBe("1rem");
    expect(scale.get("6").rem).toBe("1.5rem");
    expect(scale.get("8").rem).toBe("2rem");
    expect(scale.get("12").rem).toBe("3rem");
    expect(scale.get("16").rem).toBe("4rem");
    expect(scale.get("24").rem).toBe("6rem");
  });
  test("applies custom base unit proportionally", () => {
    const scale = generateSpacingScale({ baseUnit: 8 });
    expect(scale.get("4").px).toBe(32);
    expect(scale.get("2").px).toBe(16);
    expect(scale.get("px").px).toBe(1);
    expect(scale.get("0").px).toBe(0);
  });
  test("scale is ordered by px value ascending", () => {
    const scale = generateSpacingScale();
    const values = [...scale.values()].map((e) => e.px);
    for (let i = 1;i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });
  test("includes extended tokens when requested", () => {
    const scale = generateSpacingScale({ includeExtended: true });
    expect(scale.get("2.5")).toBeDefined();
    expect(scale.get("2.5").px).toBe(10);
    expect(scale.get("3.5")).toBeDefined();
    expect(scale.get("3.5").px).toBe(14);
    expect(scale.get("96")).toBeDefined();
    expect(scale.get("96").px).toBe(384);
  });
  test("does not include extended tokens by default", () => {
    const scale = generateSpacingScale();
    expect(scale.get("2.5")).toBeUndefined();
    expect(scale.get("96")).toBeUndefined();
  });
  test("getSpacingValue returns correct rem string", () => {
    const scale = generateSpacingScale();
    expect(getSpacingValue(scale, "4")).toBe("1rem");
    expect(getSpacingValue(scale, "12")).toBe("3rem");
    expect(getSpacingValue(scale, "0")).toBe("0");
  });
  test("getSpacingValue returns correct px string when unit=px", () => {
    const scale = generateSpacingScale();
    expect(getSpacingValue(scale, "4", "px")).toBe("16px");
    expect(getSpacingValue(scale, "0", "px")).toBe("0");
    expect(getSpacingValue(scale, "px", "px")).toBe("1px");
  });
  test("getSpacingValue returns undefined for unknown token", () => {
    const scale = generateSpacingScale();
    expect(getSpacingValue(scale, "999")).toBeUndefined();
  });
  test("adjacent steps exceed Weber JND (>20% ratio) for scale tokens above space-2", () => {
    const scale = generateSpacingScale();
    const coreTokens = ["2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24"];
    const values = coreTokens.map((t) => scale.get(t).px);
    for (let i = 1;i < values.length; i++) {
      const ratio = values[i] / values[i - 1];
      expect(ratio, `Ratio between adjacent steps must exceed JND`).toBeGreaterThanOrEqual(1.15);
    }
  });
  test("semantic spacing tokens reference valid scale entries", () => {
    const scale = generateSpacingScale();
    for (const [semanticName, scaleToken] of Object.entries(SEMANTIC_SPACING_TOKENS)) {
      expect(scale.get(scaleToken), `Semantic token "${semanticName}" references invalid scale token "${scaleToken}"`).toBeDefined();
    }
  });
});
describe("getMinTouchTarget", () => {
  test("default touch target meets WCAG 2.2 minimum (44px)", () => {
    const size = getMinTouchTarget("touch");
    expect(size).toBeGreaterThanOrEqual(TOUCH_TARGET_SIZES.WCAG_MIN);
    expect(size).toBe(44);
  });
  test("comfortable touch target is 48px (Material Design)", () => {
    expect(getMinTouchTarget("touch", "comfortable")).toBe(48);
  });
  test("compact visual touch target is 36px (hit area still expands to 44px)", () => {
    expect(getMinTouchTarget("touch", "compact")).toBe(36);
  });
  test("pointer minimum is 24px", () => {
    expect(getMinTouchTarget("pointer")).toBe(24);
    expect(getMinTouchTarget("pointer", "compact")).toBe(24);
    expect(getMinTouchTarget("pointer", "spacious")).toBe(24);
  });
  test("meetsWCAGTouchTarget validates correctly", () => {
    expect(meetsWCAGTouchTarget(44, "touch")).toBe(true);
    expect(meetsWCAGTouchTarget(43, "touch")).toBe(false);
    expect(meetsWCAGTouchTarget(48, "touch")).toBe(true);
    expect(meetsWCAGTouchTarget(24, "pointer")).toBe(true);
    expect(meetsWCAGTouchTarget(23, "pointer")).toBe(false);
  });
  test("computeHitAreaExpansion returns 0 for already-large elements", () => {
    expect(computeHitAreaExpansion(44, "touch")).toBe(0);
    expect(computeHitAreaExpansion(48, "touch")).toBe(0);
  });
  test("computeHitAreaExpansion returns correct padding for small elements", () => {
    expect(computeHitAreaExpansion(36, "touch")).toBe(4);
    expect(computeHitAreaExpansion(20, "touch")).toBe(12);
  });
  test("getTouchTargetSpec returns full specification", () => {
    const spec = getTouchTargetSpec("touch", "comfortable");
    expect(spec.minSize).toBe(48);
    expect(spec.comfortableSize).toBe(48);
    expect(spec.minGap).toBe(8);
    expect(spec.pointerType).toBe("touch");
  });
});
describe("computeFittsTime", () => {
  test("returns finite positive value for positive inputs", () => {
    const mt = computeFittsTime(200, 44);
    expect(mt).toBeGreaterThan(0);
    expect(isFinite(mt)).toBe(true);
  });
  test("larger target reduces movement time (for same distance)", () => {
    const mtSmall = computeFittsTime(200, 24);
    const mtLarge = computeFittsTime(200, 44);
    expect(mtLarge).toBeLessThan(mtSmall);
  });
  test("farther target increases movement time (for same size)", () => {
    const mtClose = computeFittsTime(100, 44);
    const mtFar = computeFittsTime(400, 44);
    expect(mtFar).toBeGreaterThan(mtClose);
  });
  test("custom constants are applied", () => {
    const mt = computeFittsTime(100, 44, { a: 50, b: 200 });
    const id = Math.log2(2 * 100 / 44);
    expect(mt).toBeCloseTo(50 + 200 * id, 5);
  });
  test("fittsIndexOfDifficulty: larger target has lower ID", () => {
    const idSmall = fittsIndexOfDifficulty(200, 24);
    const idLarge = fittsIndexOfDifficulty(200, 44);
    expect(idLarge).toBeLessThan(idSmall);
  });
  test("WCAG 44px target has ID below 4 bits at 200px distance", () => {
    const id = fittsIndexOfDifficulty(200, 44);
    expect(id).toBeLessThan(4);
  });
});
describe("getDensityMultiplier", () => {
  test("compact is 0.75", () => {
    expect(getDensityMultiplier("compact")).toBe(0.75);
  });
  test("comfortable is 1.0", () => {
    expect(getDensityMultiplier("comfortable")).toBe(1);
  });
  test("spacious is 1.5", () => {
    expect(getDensityMultiplier("spacious")).toBe(1.5);
  });
  test("DENSITY_MULTIPLIERS constant matches function values", () => {
    expect(DENSITY_MULTIPLIERS.compact).toBe(getDensityMultiplier("compact"));
    expect(DENSITY_MULTIPLIERS.comfortable).toBe(getDensityMultiplier("comfortable"));
    expect(DENSITY_MULTIPLIERS.spacious).toBe(getDensityMultiplier("spacious"));
  });
  test("DENSITY_CSS_VALUES provides string representations", () => {
    expect(DENSITY_CSS_VALUES.compact).toBe("0.75");
    expect(DENSITY_CSS_VALUES.comfortable).toBe("1");
    expect(DENSITY_CSS_VALUES.spacious).toBe("1.5");
  });
});
describe("applyDensity", () => {
  test("compact scales by 0.75", () => {
    expect(applyDensity(16, "compact")).toBe(12);
    expect(applyDensity(24, "compact")).toBe(18);
  });
  test("comfortable leaves value unchanged", () => {
    expect(applyDensity(16, "comfortable")).toBe(16);
    expect(applyDensity(48, "comfortable")).toBe(48);
  });
  test("spacious scales by 1.5", () => {
    expect(applyDensity(16, "spacious")).toBe(24);
    expect(applyDensity(8, "spacious")).toBe(12);
  });
  test("result is never negative", () => {
    expect(applyDensity(0, "compact")).toBe(0);
  });
  test("applyDensityClamped never reduces touch targets below WCAG minimum", () => {
    const scaled = applyDensity(44, "compact");
    expect(scaled).toBeLessThan(44);
    const clamped = applyDensityClamped(44, "compact", true);
    expect(clamped).toBeGreaterThanOrEqual(TOUCH_TARGET_SIZES.WCAG_MIN);
  });
});
describe("composeSpacingScales", () => {
  test("multiplies spacing by context and density factors", () => {
    const result = composeSpacingScales(16, 0.69, "compact");
    expect(result).toBeCloseTo(8.28, 1);
  });
  test("base context + comfortable = unchanged", () => {
    expect(composeSpacingScales(16, 1, "comfortable")).toBe(16);
  });
  test("result is never negative", () => {
    expect(composeSpacingScales(0, 0.69, "compact")).toBe(0);
  });
});
describe("getContextScaleFactor", () => {
  test("returns correct factors for named sizes", () => {
    expect(getContextScaleFactor("xs")).toBe(0.69);
    expect(getContextScaleFactor("sm")).toBe(0.81);
    expect(getContextScaleFactor("base")).toBe(1);
    expect(getContextScaleFactor("lg")).toBe(1.19);
    expect(getContextScaleFactor("xl")).toBe(1.44);
  });
  test("returns 1.0 for unknown size", () => {
    expect(getContextScaleFactor("unknown")).toBe(1);
  });
  test("CONTEXT_SCALE_FACTORS contains expected values", () => {
    expect(CONTEXT_SCALE_FACTORS["base"]).toBe(1);
    expect(CONTEXT_SCALE_FACTORS["xs"]).toBeLessThan(1);
    expect(CONTEXT_SCALE_FACTORS["xl"]).toBeGreaterThan(1);
  });
  test("density exempt components list includes critical components", () => {
    expect(DENSITY_EXEMPT_COMPONENTS).toContain("alert");
    expect(DENSITY_EXEMPT_COMPONENTS).toContain("help-panel");
    expect(DENSITY_EXEMPT_COMPONENTS).toContain("form-validation");
    expect(DENSITY_EXEMPT_COMPONENTS).toContain("legal-notice");
  });
});
describe("getBreakpoints", () => {
  test("returns all 5 named breakpoints", () => {
    const bps = getBreakpoints();
    expect(bps).toHaveLength(5);
  });
  test("breakpoints are ordered ascending by minWidth", () => {
    const bps = getBreakpoints();
    for (let i = 1;i < bps.length; i++) {
      expect(bps[i].minWidth).toBeGreaterThan(bps[i - 1].minWidth);
    }
  });
  test("breakpoint values match spec (sm=640, md=768, lg=1024, xl=1280, 2xl=1536)", () => {
    const bps = getBreakpoints();
    expect(bps[0]).toEqual({ name: "sm", minWidth: 640 });
    expect(bps[1]).toEqual({ name: "md", minWidth: 768 });
    expect(bps[2]).toEqual({ name: "lg", minWidth: 1024 });
    expect(bps[3]).toEqual({ name: "xl", minWidth: 1280 });
    expect(bps[4]).toEqual({ name: "2xl", minWidth: 1536 });
  });
  test("BREAKPOINT_ORDER is sm, md, lg, xl, 2xl", () => {
    expect(BREAKPOINT_ORDER).toEqual(["sm", "md", "lg", "xl", "2xl"]);
  });
  test("BREAKPOINT_VALUES match spec", () => {
    expect(BREAKPOINT_VALUES.sm).toBe(640);
    expect(BREAKPOINT_VALUES.md).toBe(768);
    expect(BREAKPOINT_VALUES.lg).toBe(1024);
    expect(BREAKPOINT_VALUES.xl).toBe(1280);
    expect(BREAKPOINT_VALUES["2xl"]).toBe(1536);
  });
});
describe("getBreakpointQuery", () => {
  test("generates min-width queries by default (mobile-first)", () => {
    expect(getBreakpointQuery("sm")).toBe("@media (min-width: 640px)");
    expect(getBreakpointQuery("md")).toBe("@media (min-width: 768px)");
    expect(getBreakpointQuery("lg")).toBe("@media (min-width: 1024px)");
    expect(getBreakpointQuery("xl")).toBe("@media (min-width: 1280px)");
    expect(getBreakpointQuery("2xl")).toBe("@media (min-width: 1536px)");
  });
  test("generates max-width queries offset by 0.02px (no overlap)", () => {
    expect(getBreakpointQuery("md", "max")).toBe("@media (max-width: 767.98px)");
    expect(getBreakpointQuery("lg", "max")).toBe("@media (max-width: 1023.98px)");
    expect(getBreakpointQuery("xl", "max")).toBe("@media (max-width: 1279.98px)");
  });
  test("getBreakpointRangeQuery generates a range query", () => {
    const query = getBreakpointRangeQuery("md", "lg");
    expect(query).toBe("@media (min-width: 768px) and (max-width: 1023.98px)");
  });
  test("getBreakpoint returns correct breakpoint object", () => {
    expect(getBreakpoint("lg")).toEqual({ name: "lg", minWidth: 1024 });
  });
});
describe("resolveBreakpoint", () => {
  test("returns null for width below smallest breakpoint", () => {
    expect(resolveBreakpoint(320)).toBeNull();
    expect(resolveBreakpoint(639)).toBeNull();
  });
  test("returns correct breakpoint at exact thresholds", () => {
    expect(resolveBreakpoint(640)).toBe("sm");
    expect(resolveBreakpoint(768)).toBe("md");
    expect(resolveBreakpoint(1024)).toBe("lg");
    expect(resolveBreakpoint(1280)).toBe("xl");
    expect(resolveBreakpoint(1536)).toBe("2xl");
  });
  test("returns largest matching breakpoint for wide viewports", () => {
    expect(resolveBreakpoint(1920)).toBe("2xl");
    expect(resolveBreakpoint(900)).toBe("md");
    expect(resolveBreakpoint(1100)).toBe("lg");
  });
});
describe("getGridConfig", () => {
  test("default (mobile) is 4 columns, 16px gutter", () => {
    const config = getGridConfig();
    expect(config.columns).toBe(4);
    expect(config.gutter).toBe(16);
    expect(config.margin).toBe(16);
  });
  test("md breakpoint is 8 columns, 24px gutter", () => {
    const config = getGridConfig("md");
    expect(config.columns).toBe(8);
    expect(config.gutter).toBe(24);
    expect(config.margin).toBe(24);
  });
  test("lg breakpoint is 12 columns, 24px gutter", () => {
    const config = getGridConfig("lg");
    expect(config.columns).toBe(12);
    expect(config.gutter).toBe(24);
    expect(config.margin).toBe(24);
  });
  test("xl breakpoint is 12 columns, 32px gutter", () => {
    const config = getGridConfig("xl");
    expect(config.columns).toBe(12);
    expect(config.gutter).toBe(32);
    expect(config.margin).toBe(32);
    expect(config.maxWidth).toBe(1280);
  });
  test("all configurations have valid column counts (>=1)", () => {
    const configs = getAllGridConfigs();
    for (const [key, config] of Object.entries(configs)) {
      expect(config.columns, `${key} must have >= 1 column`).toBeGreaterThanOrEqual(1);
    }
  });
  test("all configurations have non-negative gutters and margins", () => {
    const configs = getAllGridConfigs();
    for (const [key, config] of Object.entries(configs)) {
      expect(config.gutter, `${key} gutter must be >= 0`).toBeGreaterThanOrEqual(0);
      expect(config.margin, `${key} margin must be >= 0`).toBeGreaterThanOrEqual(0);
    }
  });
  test("validateGridConfig returns no errors for valid configs", () => {
    const config = getGridConfig("lg");
    const errors = validateGridConfig(config, 1440);
    expect(errors).toHaveLength(0);
  });
  test("validateGridConfig catches too-narrow container", () => {
    const config = getGridConfig("lg");
    const errors = validateGridConfig(config, 100);
    expect(errors.length).toBeGreaterThan(0);
  });
});
describe("computeColumnWidth", () => {
  test("computes correct column width for lg grid at 1440px", () => {
    const width = computeColumnWidth(1440, 12, 24, 24);
    expect(width).toBeCloseTo(94, 0);
  });
  test("computes 4-column grid at 375px", () => {
    const width = computeColumnWidth(375, 4, 16, 16);
    expect(width).toBeCloseTo(73.75, 1);
  });
  test("returns 0 for invalid column count", () => {
    expect(computeColumnWidth(1280, 0, 32, 32)).toBe(0);
  });
  test("returns 0 when container is too narrow", () => {
    expect(computeColumnWidth(10, 12, 32, 32)).toBe(0);
  });
});
describe("computeSpanWidth", () => {
  test("spans correct width for 4 columns", () => {
    expect(computeSpanWidth(4, 72, 32)).toBe(384);
  });
  test("single column span equals column width", () => {
    expect(computeSpanWidth(1, 80, 24)).toBe(80);
  });
  test("full 12-column span", () => {
    expect(computeSpanWidth(12, 80, 24)).toBe(1224);
  });
  test("returns 0 for 0 span", () => {
    expect(computeSpanWidth(0, 80, 24)).toBe(0);
  });
});
describe("getRelationshipSpacing", () => {
  test("related tier (Immediate) covers 4–8px range", () => {
    const spec = getRelationshipSpacing("related");
    expect(spec.min).toBe(4);
    expect(spec.max).toBe(8);
    expect(spec.tokens).toContain("1");
    expect(spec.tokens).toContain("2");
  });
  test("grouped tier (Related) covers 12–16px range", () => {
    const spec = getRelationshipSpacing("grouped");
    expect(spec.min).toBe(12);
    expect(spec.max).toBe(16);
    expect(spec.tokens).toContain("3");
    expect(spec.tokens).toContain("4");
  });
  test("separated tier (Distinct) covers 24–32px range", () => {
    const spec = getRelationshipSpacing("separated");
    expect(spec.min).toBe(24);
    expect(spec.max).toBe(32);
    expect(spec.tokens).toContain("6");
    expect(spec.tokens).toContain("8");
  });
  test("distinct tier (Disconnected) covers 48–64px range", () => {
    const spec = getRelationshipSpacing("distinct");
    expect(spec.min).toBe(48);
    expect(spec.max).toBe(64);
    expect(spec.tokens).toContain("12");
    expect(spec.tokens).toContain("16");
  });
  test("Gestalt hierarchy: each tier min is greater than the previous tier max", () => {
    const all = getAllRelationshipSpacings();
    for (let i = 1;i < all.length; i++) {
      const prev = all[i - 1];
      const curr = all[i];
      expect(curr.min, `${curr.relationship}.min must be > ${prev.relationship}.max`).toBeGreaterThan(prev.max);
    }
  });
  test("getAllRelationshipSpacings returns 4 tiers in proximity order", () => {
    const all = getAllRelationshipSpacings();
    expect(all).toHaveLength(4);
    expect(all[0].relationship).toBe("related");
    expect(all[1].relationship).toBe("grouped");
    expect(all[2].relationship).toBe("separated");
    expect(all[3].relationship).toBe("distinct");
  });
  test("default spacing increases monotonically (related < grouped < separated < distinct)", () => {
    const related = getDefaultSpacing("related");
    const grouped = getDefaultSpacing("grouped");
    const separated = getDefaultSpacing("separated");
    const distinct = getDefaultSpacing("distinct");
    expect(grouped).toBeGreaterThan(related);
    expect(separated).toBeGreaterThan(grouped);
    expect(distinct).toBeGreaterThan(separated);
  });
});
describe("validateProximityHierarchy", () => {
  test("returns true when outer spacing exceeds inner", () => {
    expect(validateProximityHierarchy(16, 24)).toBe(true);
    expect(validateProximityHierarchy(8, 48)).toBe(true);
  });
  test("returns false when outer spacing is less than or equal to inner", () => {
    expect(validateProximityHierarchy(24, 16)).toBe(false);
    expect(validateProximityHierarchy(16, 16)).toBe(false);
  });
  test("enforces Gestalt law: related < separated (real scenario)", () => {
    const withinGroup = getDefaultSpacing("grouped");
    const betweenGroups = getDefaultSpacing("separated");
    expect(validateProximityHierarchy(withinGroup, betweenGroups)).toBe(true);
  });
});
describe("spacingRelationship", () => {
  test("returns zero energy for healthy grouped-to-separated spacing", () => {
    const result = spacingRelationship(16, 24);
    expect(result.valid).toBe(true);
    expect(result.energy).toBe(0);
    expect(result.ratio).toBeGreaterThanOrEqual(result.minRatio);
  });
  test("penalizes insufficient between-group spacing", () => {
    const result = spacingRelationship(12, 12);
    expect(result.valid).toBe(false);
    expect(result.betweenPenalty).toBeGreaterThan(0);
    expect(result.energy).toBeGreaterThan(0);
  });
  test("penalizes excessive within-group spacing", () => {
    const result = spacingRelationship(24, 48);
    expect(result.valid).toBe(false);
    expect(result.withinPenalty).toBeGreaterThan(0);
  });
  test("respects custom thresholds", () => {
    const result = spacingRelationship(20, 28, {
      withinThresholdPx: 24,
      betweenThresholdPx: 24,
      minRatio: 1.2
    });
    expect(result.valid).toBe(true);
    expect(result.energy).toBe(0);
  });
});
describe("relationshipForDepth", () => {
  test("maps depth tiers from coarse to tight spacing", () => {
    expect(relationshipForDepth(0)).toBe("distinct");
    expect(relationshipForDepth(1)).toBe("separated");
    expect(relationshipForDepth(2)).toBe("grouped");
    expect(relationshipForDepth(3)).toBe("related");
    expect(relationshipForDepth(8)).toBe("related");
  });
});
describe("isInRelationshipRange", () => {
  test("values within range return true", () => {
    expect(isInRelationshipRange(4, "related")).toBe(true);
    expect(isInRelationshipRange(8, "related")).toBe(true);
    expect(isInRelationshipRange(12, "grouped")).toBe(true);
    expect(isInRelationshipRange(16, "grouped")).toBe(true);
    expect(isInRelationshipRange(24, "separated")).toBe(true);
    expect(isInRelationshipRange(32, "separated")).toBe(true);
    expect(isInRelationshipRange(48, "distinct")).toBe(true);
    expect(isInRelationshipRange(64, "distinct")).toBe(true);
  });
  test("values outside range return false", () => {
    expect(isInRelationshipRange(12, "related")).toBe(false);
    expect(isInRelationshipRange(3, "related")).toBe(false);
    expect(isInRelationshipRange(24, "grouped")).toBe(false);
    expect(isInRelationshipRange(48, "separated")).toBe(false);
  });
});
describe("@sig-ui/core/spacing subpath export", () => {
  test("exports all expected functions", async () => {
    const mod = await import("../src/spacing-export.js");
    expect(mod.generateSpacingScale).toBeFunction();
    expect(mod.getSpacingValue).toBeFunction();
    expect(mod.SEMANTIC_SPACING_TOKENS).toBeDefined();
    expect(mod.getMinTouchTarget).toBeFunction();
    expect(mod.getTouchTargetSpec).toBeFunction();
    expect(mod.computeFittsTime).toBeFunction();
    expect(mod.fittsIndexOfDifficulty).toBeFunction();
    expect(mod.meetsWCAGTouchTarget).toBeFunction();
    expect(mod.computeHitAreaExpansion).toBeFunction();
    expect(mod.TOUCH_TARGET_SIZES).toBeDefined();
    expect(mod.getDensityMultiplier).toBeFunction();
    expect(mod.applyDensity).toBeFunction();
    expect(mod.applyDensityClamped).toBeFunction();
    expect(mod.composeSpacingScales).toBeFunction();
    expect(mod.getContextScaleFactor).toBeFunction();
    expect(mod.DENSITY_MULTIPLIERS).toBeDefined();
    expect(mod.DENSITY_CSS_VALUES).toBeDefined();
    expect(mod.DENSITY_EXEMPT_COMPONENTS).toBeDefined();
    expect(mod.CONTEXT_SCALE_FACTORS).toBeDefined();
    expect(mod.getBreakpoints).toBeFunction();
    expect(mod.getBreakpoint).toBeFunction();
    expect(mod.getBreakpointQuery).toBeFunction();
    expect(mod.getBreakpointRangeQuery).toBeFunction();
    expect(mod.resolveBreakpoint).toBeFunction();
    expect(mod.BREAKPOINT_VALUES).toBeDefined();
    expect(mod.BREAKPOINT_ORDER).toBeDefined();
    expect(mod.getGridConfig).toBeFunction();
    expect(mod.getAllGridConfigs).toBeFunction();
    expect(mod.computeColumnWidth).toBeFunction();
    expect(mod.computeSpanWidth).toBeFunction();
    expect(mod.validateGridConfig).toBeFunction();
    expect(mod.getRelationshipSpacing).toBeFunction();
    expect(mod.getAllRelationshipSpacings).toBeFunction();
    expect(mod.getDefaultSpacing).toBeFunction();
    expect(mod.validateProximityHierarchy).toBeFunction();
    expect(mod.spacingRelationship).toBeFunction();
    expect(mod.relationshipForDepth).toBeFunction();
    expect(mod.isInRelationshipRange).toBeFunction();
  });
});
