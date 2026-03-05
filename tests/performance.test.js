// @ts-check

/**
 * Repository module for performance.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  DEFAULT_VITALS,
  DEFAULT_ANIMATION_BUDGET,
  DEFAULT_DOM_BUDGET,
  DEFAULT_IMAGE_BUDGET,
  DEFAULT_FONT_BUDGET,
  DEFAULT_CSS_BUDGET,
  DEFAULT_JS_BUDGET,
  DEFAULT_CI_BUDGET,
  DEFAULT_MONITORING_BUDGET,
  DEFAULT_PERFORMANCE_BUDGETS,
  getPerformanceBudgets
} from "../src/performance/budgets.js";
import {
  classifyProperty,
  getPropertyClassification,
  isAnimationSafe,
  getCompositorProperties,
  getLayoutTriggeringProperties,
  getPaintTriggeringProperties
} from "../src/performance/properties.js";
import {
  getAspectRatios,
  getAspectRatio,
  getAspectRatioNames,
  getAspectRatioCSS
} from "../src/performance/aspect-ratios.js";
import {
  validateDOMDepth,
  validateComponentNodeCount,
  validatePageNodeCount,
  getListRenderingStrategy,
  estimateRecalcCost
} from "../src/performance/dom-budget.js";
import {
  getContainmentCSS,
  getDefaultContainment,
  getOverflowContainment,
  getContainmentLevels,
  getContentVisibilityCSS
} from "../src/performance/containment.js";
import {
  getImageLoadingConfig,
  validateLCPImage,
  getFormatCascade,
  getMandatoryImageAttributes
} from "../src/performance/image-loading.js";
import {
  getFontDisplay,
  validateFontSize,
  validateFontPayload,
  validatePreloadCount,
  getFontPreloadRules
} from "../src/performance/font-loading.js";
import {
  lintLayoutAnimations,
  lintNoImport,
  lintNoUniversalAnimation,
  lintSelectorSpecificity,
  estimateSpecificity,
  lintCSS
} from "../src/performance/css-lint.js";
import * as PerformanceSubpath from "../src/performance-export.js";
describe("DEFAULT_VITALS", () => {
  test("has correct Core Web Vitals thresholds (Spec 10 §2)", () => {
    expect(DEFAULT_VITALS.inp).toBe(200);
    expect(DEFAULT_VITALS.lcp).toBe(2500);
    expect(DEFAULT_VITALS.cls).toBe(0.1);
  });
});
describe("DEFAULT_ANIMATION_BUDGET", () => {
  test("has correct animation budget values (Spec 10 §3)", () => {
    expect(DEFAULT_ANIMATION_BUDGET.maxConcurrentAnimations).toBe(10);
    expect(DEFAULT_ANIMATION_BUDGET.rafBudgetMs).toBe(10);
    expect(DEFAULT_ANIMATION_BUDGET.eventHandlerBudgetMs).toBe(1);
    expect(DEFAULT_ANIMATION_BUDGET.compositorOnlyAbove).toBe(100);
  });
});
describe("DEFAULT_DOM_BUDGET", () => {
  test("has correct DOM complexity thresholds (Spec 10 §4.2)", () => {
    expect(DEFAULT_DOM_BUDGET.maxNestingDepth).toBe(8);
    expect(DEFAULT_DOM_BUDGET.maxNodesInteractive).toBe(1500);
    expect(DEFAULT_DOM_BUDGET.maxNodesContent).toBe(3000);
    expect(DEFAULT_DOM_BUDGET.maxNodesPerComponent).toBe(50);
    expect(DEFAULT_DOM_BUDGET.virtualScrollThreshold).toBe(100);
  });
});
describe("DEFAULT_IMAGE_BUDGET", () => {
  test("has correct image system defaults (Spec 10 §5)", () => {
    expect(DEFAULT_IMAGE_BUDGET.formats).toEqual(["avif", "webp", "jpeg"]);
    expect(DEFAULT_IMAGE_BUDGET.defaultAspectRatio).toBe("16/9");
    expect(DEFAULT_IMAGE_BUDGET.requireAvif).toBe(false);
    expect(DEFAULT_IMAGE_BUDGET.requireWebp).toBe(true);
    expect(DEFAULT_IMAGE_BUDGET.requireDimensions).toBe(true);
  });
});
describe("DEFAULT_FONT_BUDGET", () => {
  test("has correct font loading limits (Spec 10 §6)", () => {
    expect(DEFAULT_FONT_BUDGET.bodyDisplay).toBe("swap");
    expect(DEFAULT_FONT_BUDGET.headingDisplay).toBe("optional");
    expect(DEFAULT_FONT_BUDGET.maxPreloadFonts).toBe(2);
    expect(DEFAULT_FONT_BUDGET.maxLatinFontSize).toBe(102400);
    expect(DEFAULT_FONT_BUDGET.maxCjkSubsetSize).toBe(307200);
    expect(DEFAULT_FONT_BUDGET.maxInitialFontPayload).toBe(204800);
  });
});
describe("DEFAULT_CSS_BUDGET", () => {
  test("has correct CSS budget limits (Spec 10 §7)", () => {
    expect(DEFAULT_CSS_BUDGET.maxTotalGzipped).toBe(51200);
    expect(DEFAULT_CSS_BUDGET.maxCriticalInlined).toBe(42598);
    expect(DEFAULT_CSS_BUDGET.maxPerComponent).toBe(3072);
    expect(DEFAULT_CSS_BUDGET.maxSelectorSpecificity).toEqual([0, 2, 0]);
    expect(DEFAULT_CSS_BUDGET.forbidImport).toBe(true);
    expect(DEFAULT_CSS_BUDGET.requireContainment).toBe(true);
  });
});
describe("DEFAULT_JS_BUDGET", () => {
  test("has correct JavaScript budget limits (Spec 10 §8)", () => {
    expect(DEFAULT_JS_BUDGET.maxDomRuntimeGzipped).toBe(24576);
    expect(DEFAULT_JS_BUDGET.maxTokensGzipped).toBe(2048);
    expect(DEFAULT_JS_BUDGET.maxTotalInitialGzipped).toBe(24576);
    expect(DEFAULT_JS_BUDGET.themeInitBudgetMs).toBe(50);
    expect(DEFAULT_JS_BUDGET.eventHandlerBudgetMs).toBe(1);
  });
});
describe("DEFAULT_CI_BUDGET", () => {
  test("enables all CI checks by default (Spec 10 §9)", () => {
    expect(DEFAULT_CI_BUDGET.lighthouseEnabled).toBe(true);
    expect(DEFAULT_CI_BUDGET.bundleSizeEnabled).toBe(true);
    expect(DEFAULT_CI_BUDGET.cssLintEnabled).toBe(true);
    expect(DEFAULT_CI_BUDGET.imageValidationEnabled).toBe(true);
    expect(DEFAULT_CI_BUDGET.domDepthTestEnabled).toBe(true);
    expect(DEFAULT_CI_BUDGET.blockOnFailure).toBe(true);
  });
});
describe("DEFAULT_MONITORING_BUDGET", () => {
  test("has correct monitoring configuration (Spec 10 §10)", () => {
    expect(DEFAULT_MONITORING_BUDGET.rumEnabled).toBe(true);
    expect(DEFAULT_MONITORING_BUDGET.syntheticCadence).toBe("daily");
    expect(DEFAULT_MONITORING_BUDGET.alertThresholds.inp).toBe(250);
    expect(DEFAULT_MONITORING_BUDGET.alertThresholds.lcp).toBe(3000);
    expect(DEFAULT_MONITORING_BUDGET.alertThresholds.cls).toBe(0.15);
  });
});
describe("DEFAULT_PERFORMANCE_BUDGETS", () => {
  test("aggregates all sub-budgets", () => {
    expect(DEFAULT_PERFORMANCE_BUDGETS.vitals).toBe(DEFAULT_VITALS);
    expect(DEFAULT_PERFORMANCE_BUDGETS.animation).toBe(DEFAULT_ANIMATION_BUDGET);
    expect(DEFAULT_PERFORMANCE_BUDGETS.dom).toBe(DEFAULT_DOM_BUDGET);
    expect(DEFAULT_PERFORMANCE_BUDGETS.images).toBe(DEFAULT_IMAGE_BUDGET);
    expect(DEFAULT_PERFORMANCE_BUDGETS.fonts).toBe(DEFAULT_FONT_BUDGET);
    expect(DEFAULT_PERFORMANCE_BUDGETS.css).toBe(DEFAULT_CSS_BUDGET);
    expect(DEFAULT_PERFORMANCE_BUDGETS.javascript).toBe(DEFAULT_JS_BUDGET);
    expect(DEFAULT_PERFORMANCE_BUDGETS.ci).toBe(DEFAULT_CI_BUDGET);
    expect(DEFAULT_PERFORMANCE_BUDGETS.monitoring).toBe(DEFAULT_MONITORING_BUDGET);
  });
});
describe("getPerformanceBudgets", () => {
  test("returns defaults when called without overrides", () => {
    const result = getPerformanceBudgets();
    expect(result).toBe(DEFAULT_PERFORMANCE_BUDGETS);
  });
  test("merges partial overrides", () => {
    const result = getPerformanceBudgets({
      vitals: { inp: 150, lcp: 2000, cls: 0.05 },
      dom: { maxNestingDepth: 6 }
    });
    expect(result.vitals.inp).toBe(150);
    expect(result.vitals.lcp).toBe(2000);
    expect(result.dom.maxNestingDepth).toBe(6);
    expect(result.dom.maxNodesInteractive).toBe(1500);
  });
});
describe("classifyProperty", () => {
  test("classifies compositor properties", () => {
    expect(classifyProperty("transform")).toBe("compositor");
    expect(classifyProperty("opacity")).toBe("compositor");
    expect(classifyProperty("filter")).toBe("compositor");
    expect(classifyProperty("clip-path")).toBe("compositor");
    expect(classifyProperty("backdrop-filter")).toBe("compositor");
  });
  test("classifies paint-triggering properties", () => {
    expect(classifyProperty("background-color")).toBe("paint");
    expect(classifyProperty("border-color")).toBe("paint");
    expect(classifyProperty("color")).toBe("paint");
    expect(classifyProperty("box-shadow")).toBe("paint");
  });
  test("classifies layout-triggering properties", () => {
    expect(classifyProperty("width")).toBe("layout");
    expect(classifyProperty("height")).toBe("layout");
    expect(classifyProperty("top")).toBe("layout");
    expect(classifyProperty("left")).toBe("layout");
    expect(classifyProperty("margin")).toBe("layout");
    expect(classifyProperty("padding")).toBe("layout");
    expect(classifyProperty("font-size")).toBe("layout");
    expect(classifyProperty("line-height")).toBe("layout");
    expect(classifyProperty("display")).toBe("layout");
    expect(classifyProperty("flex-basis")).toBe("layout");
  });
  test("normalizes property names (case insensitive, trimmed)", () => {
    expect(classifyProperty("  Transform  ")).toBe("compositor");
    expect(classifyProperty("WIDTH")).toBe("layout");
  });
  test("returns paint for unknown properties (conservative default)", () => {
    expect(classifyProperty("unknown-property")).toBe("paint");
  });
});
describe("getPropertyClassification", () => {
  test("returns full details for compositor properties", () => {
    const result = getPropertyClassification("transform");
    expect(result.thread).toBe("compositor");
    expect(result.allowed).toBe(true);
    expect(result.alternative).toBeUndefined();
  });
  test("returns full details with alternative for layout properties", () => {
    const result = getPropertyClassification("width");
    expect(result.thread).toBe("layout");
    expect(result.allowed).toBe(false);
    expect(result.alternative).toBe("transform: scaleX()");
  });
  test("returns alternatives for common layout properties", () => {
    expect(getPropertyClassification("height").alternative).toBe("transform: scaleY()");
    expect(getPropertyClassification("top").alternative).toBe("transform: translateY()");
    expect(getPropertyClassification("left").alternative).toBe("transform: translateX()");
  });
});
describe("isAnimationSafe", () => {
  test("compositor properties are always safe", () => {
    expect(isAnimationSafe("transform", 500)).toBe(true);
    expect(isAnimationSafe("opacity", 1000)).toBe(true);
  });
  test("layout properties are never safe", () => {
    expect(isAnimationSafe("width", 10)).toBe(false);
    expect(isAnimationSafe("margin", 50)).toBe(false);
  });
  test("paint properties are safe at <=100ms", () => {
    expect(isAnimationSafe("background-color", 100)).toBe(true);
    expect(isAnimationSafe("background-color", 101)).toBe(false);
    expect(isAnimationSafe("background-color", 50)).toBe(true);
  });
});
describe("property list getters", () => {
  test("getCompositorProperties returns known compositor properties", () => {
    const props = getCompositorProperties();
    expect(props).toContain("transform");
    expect(props).toContain("opacity");
    expect(props).toContain("filter");
    expect(props.length).toBeGreaterThanOrEqual(5);
  });
  test("getLayoutTriggeringProperties returns known layout properties", () => {
    const props = getLayoutTriggeringProperties();
    expect(props).toContain("width");
    expect(props).toContain("height");
    expect(props).toContain("margin");
    expect(props).toContain("padding");
    expect(props.length).toBeGreaterThanOrEqual(20);
  });
  test("getPaintTriggeringProperties returns known paint properties", () => {
    const props = getPaintTriggeringProperties();
    expect(props).toContain("background-color");
    expect(props).toContain("color");
    expect(props.length).toBeGreaterThanOrEqual(5);
  });
  test("no overlap between compositor and layout lists", () => {
    const compositor = new Set(getCompositorProperties());
    const layout = getLayoutTriggeringProperties();
    for (const prop of layout) {
      expect(compositor.has(prop)).toBe(false);
    }
  });
});
describe("getAspectRatios", () => {
  test("returns all six aspect ratio tokens (Spec 10 §5.1)", () => {
    const ratios = getAspectRatios();
    expect(ratios).toHaveLength(6);
  });
  test("each ratio has name, ratio, cssValue, and useCase", () => {
    for (const r of getAspectRatios()) {
      expect(r.name).toBeTruthy();
      expect(r.ratio).toBeTruthy();
      expect(r.cssValue).toBeTruthy();
      expect(r.useCase).toBeTruthy();
    }
  });
});
describe("getAspectRatio", () => {
  test("returns specific ratio by name", () => {
    const video = getAspectRatio("video");
    expect(video.ratio).toBe("16/9");
    expect(video.cssValue).toBe("16 / 9");
  });
  test("returns square ratio", () => {
    expect(getAspectRatio("square").cssValue).toBe("1 / 1");
  });
  test("returns golden ratio", () => {
    expect(getAspectRatio("golden").cssValue).toBe("1.618 / 1");
  });
  test("throws for unknown token", () => {
    expect(() => getAspectRatio("unknown")).toThrow();
  });
});
describe("getAspectRatioNames", () => {
  test("returns all token names", () => {
    const names = getAspectRatioNames();
    expect(names).toContain("video");
    expect(names).toContain("photo");
    expect(names).toContain("square");
    expect(names).toContain("portrait");
    expect(names).toContain("wide");
    expect(names).toContain("golden");
  });
});
describe("getAspectRatioCSS", () => {
  test("returns CSS custom property map", () => {
    const css = getAspectRatioCSS();
    expect(css["--aspect-video"]).toBe("16 / 9");
    expect(css["--aspect-photo"]).toBe("4 / 3");
    expect(css["--aspect-square"]).toBe("1 / 1");
    expect(css["--aspect-portrait"]).toBe("3 / 4");
    expect(css["--aspect-wide"]).toBe("21 / 9");
    expect(css["--aspect-golden"]).toBe("1.618 / 1");
  });
});
describe("validateDOMDepth", () => {
  test("passes for depth within budget", () => {
    const result = validateDOMDepth(5);
    expect(result.withinBudget).toBe(true);
    expect(result.budget).toBe(8);
    expect(result.depth).toBe(5);
  });
  test("passes for depth exactly at budget", () => {
    expect(validateDOMDepth(8).withinBudget).toBe(true);
  });
  test("fails for depth exceeding budget", () => {
    expect(validateDOMDepth(9).withinBudget).toBe(false);
  });
  test("accepts custom budget override", () => {
    expect(validateDOMDepth(10, { maxNestingDepth: 12 }).withinBudget).toBe(true);
    expect(validateDOMDepth(10, { maxNestingDepth: 6 }).withinBudget).toBe(false);
  });
});
describe("validateComponentNodeCount", () => {
  test("passes for node count within budget", () => {
    expect(validateComponentNodeCount(30)).toBe(true);
  });
  test("fails for node count exceeding budget", () => {
    expect(validateComponentNodeCount(51)).toBe(false);
  });
  test("passes at exactly 50 nodes (boundary)", () => {
    expect(validateComponentNodeCount(50)).toBe(true);
  });
});
describe("validatePageNodeCount", () => {
  test("validates interactive page threshold", () => {
    expect(validatePageNodeCount(1200, "interactive")).toBe(true);
    expect(validatePageNodeCount(1600, "interactive")).toBe(false);
  });
  test("validates content page threshold", () => {
    expect(validatePageNodeCount(2500, "content")).toBe(true);
    expect(validatePageNodeCount(3100, "content")).toBe(false);
  });
});
describe("getListRenderingStrategy", () => {
  test("returns 'full' for <=50 items", () => {
    expect(getListRenderingStrategy(1)).toBe("full");
    expect(getListRenderingStrategy(50)).toBe("full");
  });
  test("returns 'content-visibility' for 51–100 items", () => {
    expect(getListRenderingStrategy(51)).toBe("content-visibility");
    expect(getListRenderingStrategy(100)).toBe("content-visibility");
  });
  test("returns 'virtual' for 101–1000 items", () => {
    expect(getListRenderingStrategy(101)).toBe("virtual");
    expect(getListRenderingStrategy(1000)).toBe("virtual");
  });
  test("returns 'virtual-paginated' for >1000 items", () => {
    expect(getListRenderingStrategy(1001)).toBe("virtual-paginated");
  });
});
describe("estimateRecalcCost", () => {
  test("returns 1x for shallow trees (depth 1-4)", () => {
    expect(estimateRecalcCost(1)).toBe(1);
    expect(estimateRecalcCost(4)).toBe(1);
  });
  test("returns 1.5-2x for medium trees (depth 5-8)", () => {
    expect(estimateRecalcCost(5)).toBeGreaterThanOrEqual(1.5);
    expect(estimateRecalcCost(8)).toBeLessThanOrEqual(2);
  });
  test("returns 2.5-4x for deep trees (depth 9-12)", () => {
    expect(estimateRecalcCost(9)).toBeGreaterThanOrEqual(2.5);
    expect(estimateRecalcCost(12)).toBeLessThanOrEqual(4);
  });
  test("returns 5x+ for very deep trees (depth 13+)", () => {
    expect(estimateRecalcCost(13)).toBeGreaterThanOrEqual(5);
    expect(estimateRecalcCost(20)).toBeGreaterThan(5);
  });
  test("cost increases monotonically with depth", () => {
    for (let d = 1;d < 20; d++) {
      expect(estimateRecalcCost(d + 1)).toBeGreaterThanOrEqual(estimateRecalcCost(d));
    }
  });
});
describe("getContainmentCSS", () => {
  test("returns single containment level", () => {
    expect(getContainmentCSS(["layout"])).toBe("layout");
    expect(getContainmentCSS(["strict"])).toBe("strict");
  });
  test("returns combined levels", () => {
    expect(getContainmentCSS(["layout", "style"])).toBe("layout style");
    expect(getContainmentCSS(["layout", "style", "paint"])).toBe("layout style paint");
  });
  test("returns none for empty array", () => {
    expect(getContainmentCSS([])).toBe("none");
  });
});
describe("getDefaultContainment", () => {
  test("returns 'layout style' (Spec 10 §4.6 recommended default)", () => {
    expect(getDefaultContainment()).toBe("layout style");
  });
});
describe("getOverflowContainment", () => {
  test("returns 'layout style paint' for overflow components", () => {
    expect(getOverflowContainment()).toBe("layout style paint");
  });
});
describe("getContainmentLevels", () => {
  test("returns all containment level definitions", () => {
    const levels = getContainmentLevels();
    expect(levels.layout).toBe("layout");
    expect(levels.style).toBe("style");
    expect(levels.paint).toBe("paint");
    expect(levels.size).toBe("size");
    expect(levels.strict).toBe("strict");
    expect(levels.content).toBe("content");
  });
});
describe("getContentVisibilityCSS", () => {
  test("returns correct CSS with default height", () => {
    const result = getContentVisibilityCSS();
    expect(result.contentVisibility).toBe("auto");
    expect(result.containIntrinsicSize).toBe("auto 500px");
  });
  test("accepts custom estimated height", () => {
    const result = getContentVisibilityCSS(800);
    expect(result.containIntrinsicSize).toBe("auto 800px");
  });
});
describe("getImageLoadingConfig", () => {
  test("LCP images get eager loading and high priority", () => {
    const config = getImageLoadingConfig("lcp");
    expect(config.loading).toBe("eager");
    expect(config.fetchpriority).toBe("high");
    expect(config.decoding).toBe("auto");
  });
  test("lazy images get lazy loading and async decoding", () => {
    const config = getImageLoadingConfig("lazy");
    expect(config.loading).toBe("lazy");
    expect(config.fetchpriority).toBe("auto");
    expect(config.decoding).toBe("async");
  });
  test("eager images get eager loading with auto priority", () => {
    const config = getImageLoadingConfig("eager");
    expect(config.loading).toBe("eager");
    expect(config.fetchpriority).toBe("auto");
  });
});
describe("validateLCPImage", () => {
  test("rejects LCP image with lazy loading", () => {
    expect(validateLCPImage(true, "lazy")).toBe(false);
  });
  test("accepts LCP image with eager loading", () => {
    expect(validateLCPImage(true, "eager")).toBe(true);
  });
  test("accepts non-LCP image with lazy loading", () => {
    expect(validateLCPImage(false, "lazy")).toBe(true);
  });
});
describe("getFormatCascade", () => {
  test("returns AVIF > WebP > JPEG (Spec 10 §5.0)", () => {
    expect(getFormatCascade()).toEqual(["avif", "webp", "jpeg"]);
  });
});
describe("getMandatoryImageAttributes", () => {
  test("includes all required attributes (Spec 10 §5.2)", () => {
    const attrs = getMandatoryImageAttributes();
    expect(attrs).toContain("alt");
    expect(attrs).toContain("width");
    expect(attrs).toContain("height");
    expect(attrs).toContain("loading");
    expect(attrs).toContain("decoding");
  });
});
describe("getFontDisplay", () => {
  test("body uses swap (Spec 10 §6.1)", () => {
    expect(getFontDisplay("body")).toBe("swap");
  });
  test("heading uses optional", () => {
    expect(getFontDisplay("heading")).toBe("optional");
  });
  test("monospace uses swap", () => {
    expect(getFontDisplay("monospace")).toBe("swap");
  });
  test("icon uses block", () => {
    expect(getFontDisplay("icon")).toBe("block");
  });
});
describe("validateFontSize", () => {
  test("passes for Latin font within 100KB budget", () => {
    expect(validateFontSize(80000, "latin")).toBe(true);
  });
  test("fails for Latin font exceeding 100KB budget", () => {
    expect(validateFontSize(110000, "latin")).toBe(false);
  });
  test("passes for CJK font within 300KB budget", () => {
    expect(validateFontSize(250000, "cjk")).toBe(true);
  });
  test("fails for CJK font exceeding 300KB budget", () => {
    expect(validateFontSize(350000, "cjk")).toBe(false);
  });
});
describe("validateFontPayload", () => {
  test("passes for total payload within 200KB", () => {
    expect(validateFontPayload(180000)).toBe(true);
  });
  test("fails for total payload exceeding 200KB", () => {
    expect(validateFontPayload(210000)).toBe(false);
  });
});
describe("validatePreloadCount", () => {
  test("passes for <=2 preloaded fonts", () => {
    expect(validatePreloadCount(1)).toBe(true);
    expect(validatePreloadCount(2)).toBe(true);
  });
  test("fails for >2 preloaded fonts", () => {
    expect(validatePreloadCount(3)).toBe(false);
  });
});
describe("getFontPreloadRules", () => {
  test("returns font preloading rules", () => {
    const rules = getFontPreloadRules();
    expect(rules.length).toBeGreaterThanOrEqual(4);
    expect(rules.some((r) => r.includes("2 font files"))).toBe(true);
    expect(rules.some((r) => r.includes("crossorigin"))).toBe(true);
    expect(rules.some((r) => r.includes("WOFF2"))).toBe(true);
  });
});
describe("lintLayoutAnimations", () => {
  test("detects layout-triggering transition properties", () => {
    const css = `.el { transition: width 300ms ease; }`;
    const results = lintLayoutAnimations(css);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].rule).toBe("no-layout-animation");
    expect(results[0].severity).toBe("error");
    expect(results[0].message).toContain("width");
  });
  test("detects height animation", () => {
    const css = `.el { transition: height 200ms; }`;
    const results = lintLayoutAnimations(css);
    expect(results.length).toBe(1);
    expect(results[0].message).toContain("height");
  });
  test("detects margin animation", () => {
    const css = `.el { transition: margin 100ms; }`;
    const results = lintLayoutAnimations(css);
    expect(results.length).toBe(1);
  });
  test("allows compositor-friendly transitions", () => {
    const css = `.el { transition: transform 300ms ease; }`;
    const results = lintLayoutAnimations(css);
    expect(results).toHaveLength(0);
  });
  test("allows opacity transitions", () => {
    const css = `.el { transition: opacity 200ms ease; }`;
    const results = lintLayoutAnimations(css);
    expect(results).toHaveLength(0);
  });
  test("detects multi-property transition with layout property", () => {
    const css = `.el { transition: opacity 200ms, width 300ms; }`;
    const results = lintLayoutAnimations(css);
    expect(results.length).toBe(1);
    expect(results[0].message).toContain("width");
  });
});
describe("lintNoImport", () => {
  test("detects @import usage", () => {
    const css = `@import url('reset.css');
.el { color: red; }`;
    const results = lintNoImport(css);
    expect(results.length).toBe(1);
    expect(results[0].rule).toBe("no-import");
    expect(results[0].severity).toBe("error");
    expect(results[0].line).toBe(1);
  });
  test("passes CSS without @import", () => {
    const css = `.el { color: red; }`;
    const results = lintNoImport(css);
    expect(results).toHaveLength(0);
  });
  test("does not flag @import-like strings in values", () => {
    const css = `.el { content: "@import test"; }`;
    const results = lintNoImport(css);
    expect(results).toHaveLength(0);
  });
});
describe("lintNoUniversalAnimation", () => {
  test("detects transition on universal selector", () => {
    const css = `* {
  transition: opacity 200ms;
}`;
    const results = lintNoUniversalAnimation(css);
    expect(results.length).toBe(1);
    expect(results[0].rule).toBe("no-universal-animation");
    expect(results[0].severity).toBe("error");
  });
  test("passes normal selector with transition", () => {
    const css = `.el {
  transition: opacity 200ms;
}`;
    const results = lintNoUniversalAnimation(css);
    expect(results).toHaveLength(0);
  });
});
describe("estimateSpecificity", () => {
  test("estimates class selector", () => {
    expect(estimateSpecificity(".foo")).toEqual([0, 1, 0]);
  });
  test("estimates ID selector", () => {
    expect(estimateSpecificity("#bar")).toEqual([1, 0, 0]);
  });
  test("estimates element selector", () => {
    const [id, cls, el] = estimateSpecificity("div");
    expect(id).toBe(0);
    expect(el).toBeGreaterThanOrEqual(1);
  });
  test("estimates combined selectors", () => {
    const [id, cls, el] = estimateSpecificity(".foo.bar");
    expect(id).toBe(0);
    expect(cls).toBe(2);
  });
  test("estimates ID + class combination", () => {
    const [id, cls, el] = estimateSpecificity("#app .main");
    expect(id).toBe(1);
    expect(cls).toBeGreaterThanOrEqual(1);
  });
});
describe("lintSelectorSpecificity", () => {
  test("warns for selectors exceeding max specificity", () => {
    const css = `#id .class1 .class2 .class3 { color: red; }`;
    const results = lintSelectorSpecificity(css);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].severity).toBe("warning");
  });
  test("passes for selectors within budget", () => {
    const css = `.foo .bar { color: red; }`;
    const results = lintSelectorSpecificity(css);
    expect(results).toHaveLength(0);
  });
});
describe("lintCSS (combined)", () => {
  test("runs all lint rules", () => {
    const css = [
      "@import url('reset.css');",
      ".el { transition: width 300ms; }",
      "* { transition: all 200ms; }"
    ].join(`
`);
    const results = lintCSS(css);
    expect(results.length).toBeGreaterThanOrEqual(3);
    const rules = results.map((r) => r.rule);
    expect(rules).toContain("no-import");
    expect(rules).toContain("no-layout-animation");
    expect(rules).toContain("no-universal-animation");
  });
  test("passes clean CSS", () => {
    const css = `.sg-button { transition: opacity 200ms ease; }`;
    const results = lintCSS(css);
    expect(results).toHaveLength(0);
  });
});
describe("@sig-ui/core/performance subpath export", () => {
  test("exports budget constants", () => {
    expect(PerformanceSubpath.DEFAULT_PERFORMANCE_BUDGETS).toBeDefined();
    expect(PerformanceSubpath.getPerformanceBudgets).toBeInstanceOf(Function);
  });
  test("exports property classification", () => {
    expect(PerformanceSubpath.classifyProperty).toBeInstanceOf(Function);
    expect(PerformanceSubpath.isAnimationSafe).toBeInstanceOf(Function);
  });
  test("exports aspect ratio functions", () => {
    expect(PerformanceSubpath.getAspectRatios).toBeInstanceOf(Function);
    expect(PerformanceSubpath.getAspectRatioCSS).toBeInstanceOf(Function);
  });
  test("exports DOM budget functions", () => {
    expect(PerformanceSubpath.validateDOMDepth).toBeInstanceOf(Function);
    expect(PerformanceSubpath.validateComponentNodeCount).toBeInstanceOf(Function);
    expect(PerformanceSubpath.getListRenderingStrategy).toBeInstanceOf(Function);
  });
  test("exports containment functions", () => {
    expect(PerformanceSubpath.getDefaultContainment).toBeInstanceOf(Function);
    expect(PerformanceSubpath.getOverflowContainment).toBeInstanceOf(Function);
  });
  test("exports image loading functions", () => {
    expect(PerformanceSubpath.getImageLoadingConfig).toBeInstanceOf(Function);
    expect(PerformanceSubpath.validateLCPImage).toBeInstanceOf(Function);
  });
  test("exports font loading functions", () => {
    expect(PerformanceSubpath.getFontDisplay).toBeInstanceOf(Function);
    expect(PerformanceSubpath.validateFontSize).toBeInstanceOf(Function);
  });
  test("exports CSS linting functions", () => {
    expect(PerformanceSubpath.lintCSS).toBeInstanceOf(Function);
    expect(PerformanceSubpath.lintLayoutAnimations).toBeInstanceOf(Function);
  });
});
