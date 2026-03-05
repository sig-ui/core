// @ts-check

/**
 * Repository module for interactive.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  getFocusRingConfig,
  getFocusRingCSS,
  getForcedColorsFocusCSS,
  getScrollPaddingConfig,
  computeScrollPadding
} from "../src/interactive/focus.js";
import {
  getStateLayerConfig,
  getStateLayerOpacity,
  getStateLayerColor,
  getStatePriority,
  getStatePriorityRank,
  resolveDominantState
} from "../src/interactive/state-layer.js";
import {
  getCursorTokens,
  getCursorValue,
  resolveStateCursor
} from "../src/interactive/cursor.js";
import {
  getValidationVisual,
  getValidationTokens,
  needsErrorSummary
} from "../src/interactive/validation.js";
import {
  getLoadingThresholds,
  selectLoadingStrategy,
  getSkeletonConfig,
  getButtonSpinnerConfig
} from "../src/interactive/loading.js";
import {
  getPopoverTransitionConfig,
  getPopoverMode
} from "../src/interactive/popover.js";
import {
  getAIConfig,
  getAIPromptInputConfig,
  getMessageVisual,
  getAIInputState,
  getConfidenceLevel,
  getConfidenceColor
} from "../src/interactive/ai.js";
import * as InteractiveSubpath from "../src/interactive-export.js";
describe("getFocusRingConfig", () => {
  test("returns color referencing semantic focus token", () => {
    const config = getFocusRingConfig();
    expect(config.color).toContain("sg-color-border-focus");
  });
  test("width is 2px (meets WCAG 2.4.13 minimum)", () => {
    expect(getFocusRingConfig().width).toBe(2);
  });
  test("offset is 2px (creates contrast gap)", () => {
    expect(getFocusRingConfig().offset).toBe(2);
  });
});
describe("getFocusRingCSS", () => {
  test("generates valid outline declaration", () => {
    const css = getFocusRingCSS();
    expect(css.outline).toMatch(/^2px solid/);
    expect(css.outline).toContain("sg-color-border-focus");
  });
  test("generates valid outline-offset declaration", () => {
    const css = getFocusRingCSS();
    expect(css.outlineOffset).toBe("2px");
  });
  test("accepts custom overrides", () => {
    const css = getFocusRingCSS({ width: 3, color: "red" });
    expect(css.outline).toMatch(/^3px solid red$/);
  });
  test("partial overrides preserve defaults", () => {
    const css = getFocusRingCSS({ width: 4 });
    expect(css.outline).toMatch(/^4px solid/);
    expect(css.outline).toContain("sg-color-border-focus");
    expect(css.outlineOffset).toBe("2px");
  });
});
describe("getForcedColorsFocusCSS", () => {
  test("uses CanvasText system color", () => {
    const css = getForcedColorsFocusCSS();
    expect(css.outline).toContain("CanvasText");
  });
  test("preserves width and offset from default config", () => {
    const css = getForcedColorsFocusCSS();
    expect(css.outline).toMatch(/^2px solid/);
    expect(css.outlineOffset).toBe("2px");
  });
});
describe("getScrollPaddingConfig", () => {
  test("default header height is 64px", () => {
    expect(getScrollPaddingConfig().headerHeight).toBe(64);
  });
  test("default footer height is 0px", () => {
    expect(getScrollPaddingConfig().footerHeight).toBe(0);
  });
  test("buffer is 16px (space-4)", () => {
    expect(getScrollPaddingConfig().buffer).toBe(16);
  });
});
describe("computeScrollPadding", () => {
  test("top = headerHeight + buffer", () => {
    const result = computeScrollPadding();
    expect(result.top).toBe(64 + 16);
  });
  test("bottom = footerHeight + buffer", () => {
    const result = computeScrollPadding();
    expect(result.bottom).toBe(0 + 16);
  });
  test("respects custom header height", () => {
    const result = computeScrollPadding({ headerHeight: 80 });
    expect(result.top).toBe(80 + 16);
  });
  test("respects custom footer height", () => {
    const result = computeScrollPadding({ footerHeight: 48 });
    expect(result.bottom).toBe(48 + 16);
  });
  test("respects custom buffer", () => {
    const result = computeScrollPadding({ buffer: 24 });
    expect(result.top).toBe(64 + 24);
    expect(result.bottom).toBe(0 + 24);
  });
});
describe("getStateLayerConfig", () => {
  test("hover opacity is 0.08 (MD3-aligned)", () => {
    expect(getStateLayerConfig().hover).toBe(0.08);
  });
  test("focus opacity is 0.12", () => {
    expect(getStateLayerConfig().focus).toBe(0.12);
  });
  test("active opacity is 0.12", () => {
    expect(getStateLayerConfig().active).toBe(0.12);
  });
  test("dragged opacity is 0.16", () => {
    expect(getStateLayerConfig().dragged).toBe(0.16);
  });
  test("disabled content opacity is 0.38", () => {
    expect(getStateLayerConfig().disabledContent).toBe(0.38);
  });
  test("disabled container opacity is 0.12", () => {
    expect(getStateLayerConfig().disabledContainer).toBe(0.12);
  });
  test("opacities increase: hover < focus = active < dragged", () => {
    const c = getStateLayerConfig();
    expect(c.hover).toBeLessThan(c.focus);
    expect(c.focus).toBe(c.active);
    expect(c.active).toBeLessThan(c.dragged);
  });
});
describe("getStateLayerOpacity", () => {
  test("rest returns 0", () => {
    expect(getStateLayerOpacity("rest")).toBe(0);
  });
  test("hover returns 0.08", () => {
    expect(getStateLayerOpacity("hover")).toBe(0.08);
  });
  test("focus returns 0.12", () => {
    expect(getStateLayerOpacity("focus")).toBe(0.12);
  });
  test("active returns 0.12", () => {
    expect(getStateLayerOpacity("active")).toBe(0.12);
  });
  test("dragged returns 0.16", () => {
    expect(getStateLayerOpacity("dragged")).toBe(0.16);
  });
});
describe("getStateLayerColor", () => {
  test("rest returns transparent", () => {
    expect(getStateLayerColor("rest", "light")).toBe("transparent");
    expect(getStateLayerColor("rest", "dark")).toBe("transparent");
  });
  test("light mode hover uses black overlay", () => {
    const color = getStateLayerColor("hover", "light");
    expect(color).toMatch(/oklch\(0\s/);
    expect(color).toContain("0.08");
  });
  test("dark mode hover uses white overlay", () => {
    const color = getStateLayerColor("hover", "dark");
    expect(color).toMatch(/oklch\(1\s/);
    expect(color).toContain("0.08");
  });
  test("focus state has higher opacity than hover", () => {
    const hover = getStateLayerColor("hover", "light");
    const focus = getStateLayerColor("focus", "light");
    const hoverOpacity = parseFloat(hover.split("/")[1]);
    const focusOpacity = parseFloat(focus.split("/")[1]);
    expect(focusOpacity).toBeGreaterThan(hoverOpacity);
  });
});
describe("getStatePriority", () => {
  test("returns 7 states in priority order", () => {
    const priority = getStatePriority();
    expect(priority).toHaveLength(7);
  });
  test("disabled is highest priority (index 0)", () => {
    expect(getStatePriority()[0]).toBe("disabled");
  });
  test("hover is lowest priority (last)", () => {
    const priority = getStatePriority();
    expect(priority[priority.length - 1]).toBe("hover");
  });
  test("focus comes before active (accessibility)", () => {
    const priority = getStatePriority();
    const focusIdx = priority.indexOf("focus");
    const activeIdx = priority.indexOf("active");
    expect(focusIdx).toBeLessThan(activeIdx);
  });
  test("invalid comes before focus (errors must be visible)", () => {
    const priority = getStatePriority();
    const invalidIdx = priority.indexOf("invalid");
    const focusIdx = priority.indexOf("focus");
    expect(invalidIdx).toBeLessThan(focusIdx);
  });
  test("loading comes before invalid", () => {
    const priority = getStatePriority();
    const loadingIdx = priority.indexOf("loading");
    const invalidIdx = priority.indexOf("invalid");
    expect(loadingIdx).toBeLessThan(invalidIdx);
  });
});
describe("getStatePriorityRank", () => {
  test("disabled has rank 0", () => {
    expect(getStatePriorityRank("disabled")).toBe(0);
  });
  test("hover has rank 6", () => {
    expect(getStatePriorityRank("hover")).toBe(6);
  });
  test("rest returns -1 (not in priority list)", () => {
    expect(getStatePriorityRank("rest")).toBe(-1);
  });
  test("enabled returns -1 (not in priority list)", () => {
    expect(getStatePriorityRank("enabled")).toBe(-1);
  });
});
describe("resolveDominantState", () => {
  test("hover + focus resolves to focus", () => {
    expect(resolveDominantState(["hover", "focus"])).toBe("focus");
  });
  test("selected + disabled resolves to disabled", () => {
    expect(resolveDominantState(["selected", "disabled"])).toBe("disabled");
  });
  test("hover + invalid resolves to invalid", () => {
    expect(resolveDominantState(["hover", "invalid"])).toBe("invalid");
  });
  test("empty array returns null", () => {
    expect(resolveDominantState([])).toBeNull();
  });
  test("single state returns that state", () => {
    expect(resolveDominantState(["hover"])).toBe("hover");
  });
  test("non-priority states return null", () => {
    expect(resolveDominantState(["rest", "enabled"])).toBeNull();
  });
  test("all states resolves to disabled (highest)", () => {
    expect(resolveDominantState([
      "hover",
      "focus",
      "active",
      "selected",
      "invalid",
      "loading",
      "disabled"
    ])).toBe("disabled");
  });
});
describe("getCursorTokens", () => {
  test("returns all 9 cursor tokens", () => {
    const tokens = getCursorTokens();
    expect(Object.keys(tokens)).toHaveLength(9);
  });
  test("cursor-pointer maps to 'pointer'", () => {
    expect(getCursorTokens()["cursor-pointer"]).toBe("pointer");
  });
  test("cursor-not-allowed maps to 'not-allowed'", () => {
    expect(getCursorTokens()["cursor-not-allowed"]).toBe("not-allowed");
  });
  test("cursor-move maps to 'grab'", () => {
    expect(getCursorTokens()["cursor-move"]).toBe("grab");
  });
  test("all values are non-empty strings", () => {
    const tokens = getCursorTokens();
    for (const [, value] of Object.entries(tokens)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
describe("getCursorValue", () => {
  test("returns the CSS value for a token", () => {
    expect(getCursorValue("cursor-pointer")).toBe("pointer");
    expect(getCursorValue("cursor-text")).toBe("text");
    expect(getCursorValue("cursor-wait")).toBe("wait");
  });
});
describe("resolveStateCursor", () => {
  test("disabled overrides to not-allowed", () => {
    expect(resolveStateCursor("cursor-pointer", { disabled: true })).toBe("cursor-not-allowed");
  });
  test("loading overrides to progress", () => {
    expect(resolveStateCursor("cursor-pointer", { loading: true })).toBe("cursor-progress");
  });
  test("disabled takes precedence over loading", () => {
    expect(resolveStateCursor("cursor-pointer", { disabled: true, loading: true })).toBe("cursor-not-allowed");
  });
  test("no state flags returns base cursor", () => {
    expect(resolveStateCursor("cursor-text", {})).toBe("cursor-text");
  });
});
describe("getValidationVisual", () => {
  test("neutral has no icon or text color", () => {
    const v = getValidationVisual("neutral");
    expect(v.icon).toBeNull();
    expect(v.textColor).toBeNull();
    expect(v.background).toBeNull();
  });
  test("valid uses success tokens", () => {
    const v = getValidationVisual("valid");
    expect(v.borderColor).toContain("success");
    expect(v.icon).toBe("checkmark");
  });
  test("invalid uses danger tokens", () => {
    const v = getValidationVisual("invalid");
    expect(v.borderColor).toContain("danger");
    expect(v.icon).toBe("exclamation");
    expect(v.textColor).toContain("danger");
  });
  test("all states return a borderColor", () => {
    for (const state of ["neutral", "valid", "invalid"]) {
      const v = getValidationVisual(state);
      expect(typeof v.borderColor).toBe("string");
      expect(v.borderColor.length).toBeGreaterThan(0);
    }
  });
});
describe("getValidationTokens", () => {
  test("returns valid and invalid border tokens", () => {
    const tokens = getValidationTokens();
    expect(tokens.validBorder).toContain("success");
    expect(tokens.invalidBorder).toContain("danger");
  });
  test("returns valid and invalid background tokens", () => {
    const tokens = getValidationTokens();
    expect(tokens.validBg).toContain("success");
    expect(tokens.invalidBg).toContain("danger");
  });
});
describe("needsErrorSummary", () => {
  test("1 error: no summary needed", () => {
    expect(needsErrorSummary(1)).toBe(false);
  });
  test("3 errors: no summary needed (inline preferred)", () => {
    expect(needsErrorSummary(3)).toBe(false);
  });
  test("4 errors: summary needed", () => {
    expect(needsErrorSummary(4)).toBe(true);
  });
  test("0 errors: no summary needed", () => {
    expect(needsErrorSummary(0)).toBe(false);
  });
});
describe("getLoadingThresholds", () => {
  test("imperceptible threshold is 100ms", () => {
    expect(getLoadingThresholds().imperceptible).toBe(100);
  });
  test("spinner threshold is 1000ms", () => {
    expect(getLoadingThresholds().spinner).toBe(1000);
  });
  test("skeleton threshold is 10000ms", () => {
    expect(getLoadingThresholds().skeleton).toBe(1e4);
  });
  test("thresholds are monotonically increasing", () => {
    const t = getLoadingThresholds();
    expect(t.imperceptible).toBeLessThan(t.spinner);
    expect(t.spinner).toBeLessThan(t.skeleton);
  });
});
describe("selectLoadingStrategy", () => {
  test("50ms → none (below perception)", () => {
    expect(selectLoadingStrategy(50)).toBe("none");
  });
  test("99ms → none (just below threshold)", () => {
    expect(selectLoadingStrategy(99)).toBe("none");
  });
  test("100ms → spinner", () => {
    expect(selectLoadingStrategy(100)).toBe("spinner");
  });
  test("500ms → spinner", () => {
    expect(selectLoadingStrategy(500)).toBe("spinner");
  });
  test("1000ms → skeleton", () => {
    expect(selectLoadingStrategy(1000)).toBe("skeleton");
  });
  test("5000ms → skeleton", () => {
    expect(selectLoadingStrategy(5000)).toBe("skeleton");
  });
  test("10000ms → progress", () => {
    expect(selectLoadingStrategy(1e4)).toBe("progress");
  });
  test("30000ms → progress", () => {
    expect(selectLoadingStrategy(30000)).toBe("progress");
  });
  test("0ms → none", () => {
    expect(selectLoadingStrategy(0)).toBe("none");
  });
});
describe("getSkeletonConfig", () => {
  test("shimmer duration is 1500ms (1.5s cycle)", () => {
    expect(getSkeletonConfig().shimmerDuration).toBe(1500);
  });
  test("shimmer easing is ease-in-out", () => {
    expect(getSkeletonConfig().shimmerEasing).toBe("ease-in-out");
  });
  test("appear delay is 300ms", () => {
    expect(getSkeletonConfig().appearDelay).toBe(300);
  });
  test("transition duration is 200ms", () => {
    expect(getSkeletonConfig().transitionDuration).toBe(200);
  });
});
describe("getButtonSpinnerConfig", () => {
  test("size is 1em (scales with font)", () => {
    expect(getButtonSpinnerConfig().size).toBe("1em");
  });
  test("border width is 2px", () => {
    expect(getButtonSpinnerConfig().borderWidth).toBe("2px");
  });
  test("animation duration is 600ms", () => {
    expect(getButtonSpinnerConfig().animationDuration).toBe(600);
  });
});
describe("getPopoverTransitionConfig", () => {
  test("duration is 200ms", () => {
    expect(getPopoverTransitionConfig().duration).toBe(200);
  });
  test("easing is ease-default", () => {
    expect(getPopoverTransitionConfig().easing).toBe("ease-default");
  });
  test("translateY references space-1", () => {
    expect(getPopoverTransitionConfig().translateY).toContain("space-1");
  });
});
describe("getPopoverMode", () => {
  test("menu → auto", () => {
    expect(getPopoverMode("menu")).toBe("auto");
  });
  test("dropdown → auto", () => {
    expect(getPopoverMode("dropdown")).toBe("auto");
  });
  test("action-sheet → auto", () => {
    expect(getPopoverMode("action-sheet")).toBe("auto");
  });
  test("tooltip → hint", () => {
    expect(getPopoverMode("tooltip")).toBe("hint");
  });
  test("hover-card → hint", () => {
    expect(getPopoverMode("hover-card")).toBe("hint");
  });
  test("toast → manual", () => {
    expect(getPopoverMode("toast")).toBe("manual");
  });
  test("notification → manual", () => {
    expect(getPopoverMode("notification")).toBe("manual");
  });
});
describe("getAIConfig", () => {
  test("streaming throttle is 50ms (20fps batch rendering)", () => {
    expect(getAIConfig().streamingThrottleMs).toBe(50);
  });
  test("streaming cursor blink is 500ms", () => {
    expect(getAIConfig().streamingCursorBlink).toBe(500);
  });
  test("auto retry delay is 2000ms", () => {
    expect(getAIConfig().autoRetryDelay).toBe(2000);
  });
  test("submitted shimmer delay is 300ms", () => {
    expect(getAIConfig().submittedShimmerDelay).toBe(300);
  });
  test("tool approval required by default", () => {
    expect(getAIConfig().toolApprovalRequired).toBe(true);
  });
  test("reasoning default state is collapsed", () => {
    expect(getAIConfig().reasoningDefaultState).toBe("collapsed");
  });
  test("message branching enabled by default", () => {
    expect(getAIConfig().messageBranching).toBe(true);
  });
  test("confidence indicators disabled by default", () => {
    expect(getAIConfig().confidenceIndicators).toBe(false);
  });
  test("model selector enabled by default", () => {
    expect(getAIConfig().modelSelector).toBe(true);
  });
  test("prompt input config is included", () => {
    const config = getAIConfig();
    expect(config.promptInput).toBeDefined();
    expect(config.promptInput.autoResize).toBe(true);
  });
});
describe("getAIPromptInputConfig", () => {
  test("auto-resize enabled", () => {
    expect(getAIPromptInputConfig().autoResize).toBe(true);
  });
  test("max height is 12em", () => {
    expect(getAIPromptInputConfig().maxHeight).toBe("12em");
  });
  test("submit on Enter enabled", () => {
    expect(getAIPromptInputConfig().submitOnEnter).toBe(true);
  });
  test("token count hidden by default", () => {
    expect(getAIPromptInputConfig().showTokenCount).toBe(false);
  });
  test("attachments enabled", () => {
    expect(getAIPromptInputConfig().attachments).toBe(true);
  });
});
describe("getMessageVisual", () => {
  test("user messages have primary-subtle background", () => {
    const v = getMessageVisual("user");
    expect(v.background).toContain("primary-subtle");
  });
  test("assistant messages have no background and full width", () => {
    const v = getMessageVisual("assistant");
    expect(v.background).toBeNull();
    expect(v.fullWidth).toBe(true);
  });
  test("system messages are collapsible", () => {
    expect(getMessageVisual("system").collapsible).toBe(true);
  });
  test("tool messages are collapsible", () => {
    expect(getMessageVisual("tool").collapsible).toBe(true);
  });
  test("user messages are not collapsible", () => {
    expect(getMessageVisual("user").collapsible).toBe(false);
  });
});
describe("getAIInputState", () => {
  test("ready: input enabled, submit visible, stop hidden", () => {
    const s = getAIInputState("ready");
    expect(s.inputEnabled).toBe(true);
    expect(s.submitVisible).toBe(true);
    expect(s.stopVisible).toBe(false);
    expect(s.toolApprovalVisible).toBe(false);
  });
  test("submitted: input disabled, stop visible", () => {
    const s = getAIInputState("submitted");
    expect(s.inputEnabled).toBe(false);
    expect(s.submitVisible).toBe(false);
    expect(s.stopVisible).toBe(true);
  });
  test("streaming: same as submitted", () => {
    const s = getAIInputState("streaming");
    expect(s.inputEnabled).toBe(false);
    expect(s.stopVisible).toBe(true);
  });
  test("tool-calling: tool approval visible", () => {
    const s = getAIInputState("tool-calling");
    expect(s.toolApprovalVisible).toBe(true);
    expect(s.inputEnabled).toBe(false);
    expect(s.stopVisible).toBe(true);
  });
  test("error: input enabled, submit shows 'Retry'", () => {
    const s = getAIInputState("error");
    expect(s.inputEnabled).toBe(true);
    expect(s.submitVisible).toBe(true);
    expect(s.submitLabel).toBe("Retry");
    expect(s.stopVisible).toBe(false);
  });
  test("cancelled: input enabled, submit visible", () => {
    const s = getAIInputState("cancelled");
    expect(s.inputEnabled).toBe(true);
    expect(s.submitVisible).toBe(true);
    expect(s.stopVisible).toBe(false);
    expect(s.submitLabel).toBeNull();
  });
});
describe("getConfidenceLevel", () => {
  test("0.9 → high", () => {
    expect(getConfidenceLevel(0.9)).toBe("high");
  });
  test("0.8 → high (threshold inclusive)", () => {
    expect(getConfidenceLevel(0.8)).toBe("high");
  });
  test("0.79 → medium", () => {
    expect(getConfidenceLevel(0.79)).toBe("medium");
  });
  test("0.5 → medium (threshold inclusive)", () => {
    expect(getConfidenceLevel(0.5)).toBe("medium");
  });
  test("0.49 → low", () => {
    expect(getConfidenceLevel(0.49)).toBe("low");
  });
  test("0 → low", () => {
    expect(getConfidenceLevel(0)).toBe("low");
  });
  test("1.0 → high", () => {
    expect(getConfidenceLevel(1)).toBe("high");
  });
});
describe("getConfidenceColor", () => {
  test("high → success-500", () => {
    expect(getConfidenceColor("high")).toContain("success-500");
  });
  test("medium → warning-500", () => {
    expect(getConfidenceColor("medium")).toContain("warning-500");
  });
  test("low → danger-500", () => {
    expect(getConfidenceColor("low")).toContain("danger-500");
  });
});
describe("@sig-ui/core/interactive subpath export", () => {
  test("getFocusRingConfig is exported", () => {
    expect(typeof InteractiveSubpath.getFocusRingConfig).toBe("function");
  });
  test("getFocusRingCSS is exported", () => {
    expect(typeof InteractiveSubpath.getFocusRingCSS).toBe("function");
  });
  test("getForcedColorsFocusCSS is exported", () => {
    expect(typeof InteractiveSubpath.getForcedColorsFocusCSS).toBe("function");
  });
  test("getScrollPaddingConfig is exported", () => {
    expect(typeof InteractiveSubpath.getScrollPaddingConfig).toBe("function");
  });
  test("computeScrollPadding is exported", () => {
    expect(typeof InteractiveSubpath.computeScrollPadding).toBe("function");
  });
  test("getStateLayerConfig is exported", () => {
    expect(typeof InteractiveSubpath.getStateLayerConfig).toBe("function");
  });
  test("getStateLayerOpacity is exported", () => {
    expect(typeof InteractiveSubpath.getStateLayerOpacity).toBe("function");
  });
  test("getStateLayerColor is exported", () => {
    expect(typeof InteractiveSubpath.getStateLayerColor).toBe("function");
  });
  test("getStatePriority is exported", () => {
    expect(typeof InteractiveSubpath.getStatePriority).toBe("function");
  });
  test("resolveDominantState is exported", () => {
    expect(typeof InteractiveSubpath.resolveDominantState).toBe("function");
  });
  test("getCursorTokens is exported", () => {
    expect(typeof InteractiveSubpath.getCursorTokens).toBe("function");
  });
  test("resolveStateCursor is exported", () => {
    expect(typeof InteractiveSubpath.resolveStateCursor).toBe("function");
  });
  test("getValidationVisual is exported", () => {
    expect(typeof InteractiveSubpath.getValidationVisual).toBe("function");
  });
  test("needsErrorSummary is exported", () => {
    expect(typeof InteractiveSubpath.needsErrorSummary).toBe("function");
  });
  test("selectLoadingStrategy is exported", () => {
    expect(typeof InteractiveSubpath.selectLoadingStrategy).toBe("function");
  });
  test("getSkeletonConfig is exported", () => {
    expect(typeof InteractiveSubpath.getSkeletonConfig).toBe("function");
  });
  test("getPopoverTransitionConfig is exported", () => {
    expect(typeof InteractiveSubpath.getPopoverTransitionConfig).toBe("function");
  });
  test("getPopoverMode is exported", () => {
    expect(typeof InteractiveSubpath.getPopoverMode).toBe("function");
  });
  test("getAIConfig is exported", () => {
    expect(typeof InteractiveSubpath.getAIConfig).toBe("function");
  });
  test("getAIInputState is exported", () => {
    expect(typeof InteractiveSubpath.getAIInputState).toBe("function");
  });
  test("getMessageVisual is exported", () => {
    expect(typeof InteractiveSubpath.getMessageVisual).toBe("function");
  });
  test("getConfidenceLevel is exported", () => {
    expect(typeof InteractiveSubpath.getConfidenceLevel).toBe("function");
  });
  test("getConfidenceColor is exported", () => {
    expect(typeof InteractiveSubpath.getConfidenceColor).toBe("function");
  });
  test("all functions produce consistent results via subpath", () => {
    const focus = InteractiveSubpath.getFocusRingConfig();
    expect(focus.width).toBe(2);
    const layers = InteractiveSubpath.getStateLayerConfig();
    expect(layers.hover).toBe(0.08);
    const skeleton = InteractiveSubpath.getSkeletonConfig();
    expect(skeleton.shimmerDuration).toBe(1500);
    const ai = InteractiveSubpath.getAIConfig();
    expect(ai.streamingThrottleMs).toBe(50);
  });
});
describe("integration: state layer colors match config opacities", () => {
  test("hover color contains the hover opacity value", () => {
    const config = getStateLayerConfig();
    const color = getStateLayerColor("hover", "light");
    expect(color).toContain(String(config.hover));
  });
  test("focus color contains the focus opacity value", () => {
    const config = getStateLayerConfig();
    const color = getStateLayerColor("focus", "dark");
    expect(color).toContain(String(config.focus));
  });
});
describe("integration: loading strategy uses correct thresholds", () => {
  test("strategy boundary at imperceptible threshold", () => {
    const t = getLoadingThresholds();
    expect(selectLoadingStrategy(t.imperceptible - 1)).toBe("none");
    expect(selectLoadingStrategy(t.imperceptible)).toBe("spinner");
  });
  test("strategy boundary at spinner threshold", () => {
    const t = getLoadingThresholds();
    expect(selectLoadingStrategy(t.spinner - 1)).toBe("spinner");
    expect(selectLoadingStrategy(t.spinner)).toBe("skeleton");
  });
  test("strategy boundary at skeleton threshold", () => {
    const t = getLoadingThresholds();
    expect(selectLoadingStrategy(t.skeleton - 1)).toBe("skeleton");
    expect(selectLoadingStrategy(t.skeleton)).toBe("progress");
  });
});
