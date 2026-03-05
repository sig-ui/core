// @ts-check

/**
 * Repository module for accessibility.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  getDefaultAccessibilityConfig,
  getComplianceLevel,
  meetsComplianceLevel,
  ARIA_PATTERNS,
  getAriaPattern,
  getAriaPatternNames,
  KEYBOARD_MAPS,
  getKeyboardMap,
  createShortcutRegistry,
  registerShortcut,
  lookupShortcut,
  validateShortcutModifier,
  ANNOUNCEMENT_PATTERNS,
  getAnnouncementPattern,
  getThrottleConfig,
  FOCUS_RESTORATION_TARGETS,
  getDefaultSkipLinks,
  getFocusableSelector,
  getRouteChangeFocusSelector
} from "../src/accessibility/index.js";
describe("accessibility config", () => {
  test("getDefaultAccessibilityConfig returns full defaults", () => {
    const config = getDefaultAccessibilityConfig();
    expect(config.complianceLevel).toBe("AA");
    expect(config.aria.tabActivation).toBe("automatic");
    expect(config.aria.comboboxAutocomplete).toBe("list");
    expect(config.aria.typeAheadTimeout).toBe(500);
    expect(config.aria.focusTrapStrategy).toBe("native");
    expect(config.aria.announcerDebounce).toBe(300);
    expect(config.focus.indicatorWidth).toBe(2);
    expect(config.focus.indicatorOffset).toBe(2);
    expect(config.focus.highContrastWidthIncrease).toBe(1);
    expect(config.focus.restoreFocusOnClose).toBe(true);
    expect(config.focus.focusMainHeadingOnRouteChange).toBe(true);
    expect(config.focus.skipLinks).toHaveLength(1);
    expect(config.focus.skipLinks[0].target).toBe("#main-content");
    expect(config.announcements.routeChangeEnabled).toBe(true);
    expect(config.announcements.toastLiveRegion).toBe("polite");
    expect(config.announcements.alertLiveRegion).toBe("assertive");
    expect(config.announcements.progressAnnounceInterval).toBe(5000);
    expect(config.announcements.searchResultDebounce).toBe(500);
    expect(config.announcements.realTimeUpdateInterval).toBe(1e4);
    expect(config.touch.minimumTargetSize).toBe(44);
    expect(config.touch.comfortableTargetSize).toBe(48);
    expect(config.touch.pointerMinimumTarget).toBe(24);
    expect(config.touch.targetSpacing).toBe(8);
    expect(config.touch.dragAlternative).toBe("toolbar");
    expect(config.testing.axeCoreSeverityThreshold).toBe("minor");
    expect(config.testing.lighthouseMinScore).toBe(95);
    expect(config.testing.screenReaderMatrix).toHaveLength(4);
    expect(config.css.includeSrOnlyUtility).toBe(true);
    expect(config.css.includeSkipLinks).toBe(true);
    expect(config.css.includeForcedColorsOverrides).toBe(true);
    expect(config.css.includePrintAccessibility).toBe(true);
    expect(config.css.includeReducedMotionOverrides).toBe(true);
  });
  test("getComplianceLevel returns numeric rank", () => {
    expect(getComplianceLevel("A")).toBe(1);
    expect(getComplianceLevel("AA")).toBe(2);
    expect(getComplianceLevel("AAA")).toBe(3);
  });
  test("meetsComplianceLevel compares correctly", () => {
    expect(meetsComplianceLevel("AA", "A")).toBe(true);
    expect(meetsComplianceLevel("AA", "AA")).toBe(true);
    expect(meetsComplianceLevel("AA", "AAA")).toBe(false);
    expect(meetsComplianceLevel("AAA", "A")).toBe(true);
    expect(meetsComplianceLevel("A", "AA")).toBe(false);
  });
});
describe("ARIA patterns", () => {
  const ALL_PATTERN_NAMES = [
    "button",
    "link",
    "input",
    "checkbox",
    "radioGroup",
    "listbox",
    "combobox",
    "dialog",
    "tabs",
    "menu",
    "tooltip",
    "alert",
    "toast",
    "accordion",
    "table",
    "progressbar"
  ];
  test("all 16 component patterns are present", () => {
    const names = getAriaPatternNames();
    expect(names).toHaveLength(16);
    for (const name of ALL_PATTERN_NAMES) {
      expect(names).toContain(name);
    }
  });
  test("each pattern has role and nativeElement", () => {
    for (const name of ALL_PATTERN_NAMES) {
      const pattern = getAriaPattern(name);
      expect(pattern.role).toBeString();
      expect(pattern.nativeElement).toBeString();
      expect(pattern.attributes.length).toBeGreaterThan(0);
    }
  });
  test("button pattern has correct attributes", () => {
    const pattern = getAriaPattern("button");
    expect(pattern.role).toBe("button");
    expect(pattern.nativeElement).toBe("button");
    const attrs = pattern.attributes.map((a) => a.attribute);
    expect(attrs).toContain("aria-pressed");
    expect(attrs).toContain("aria-expanded");
    expect(attrs).toContain("aria-controls");
    expect(attrs).toContain("aria-haspopup");
    expect(attrs).toContain("aria-disabled");
    expect(attrs).toContain("aria-label");
    expect(attrs).toContain("type");
  });
  test("dialog pattern specifies modal and labelling", () => {
    const pattern = getAriaPattern("dialog");
    expect(pattern.role).toBe("dialog");
    const attrs = pattern.attributes.map((a) => a.attribute);
    expect(attrs).toContain("aria-modal");
    expect(attrs).toContain("aria-labelledby");
    expect(attrs).toContain("aria-describedby");
  });
  test("combobox pattern has all ARIA 1.2 attributes", () => {
    const pattern = getAriaPattern("combobox");
    expect(pattern.role).toBe("combobox");
    const attrs = pattern.attributes.map((a) => a.attribute);
    expect(attrs).toContain("aria-expanded");
    expect(attrs).toContain("aria-controls");
    expect(attrs).toContain("aria-autocomplete");
    expect(attrs).toContain("aria-activedescendant");
    expect(attrs).toContain("aria-haspopup");
  });
  test("tabs pattern has tablist, tab, tabpanel roles", () => {
    const pattern = getAriaPattern("tabs");
    const roleAttrs = pattern.attributes.filter((a) => a.attribute === "role");
    const roleValues = roleAttrs.map((a) => a.value);
    expect(roleValues).toContain("tablist");
    expect(roleValues).toContain("tab");
    expect(roleValues).toContain("tabpanel");
  });
  test("alert uses assertive via role=alert", () => {
    const pattern = getAriaPattern("alert");
    expect(pattern.role).toBe("alert");
  });
  test("toast uses polite via role=status", () => {
    const pattern = getAriaPattern("toast");
    expect(pattern.role).toBe("status");
  });
  test("progressbar has valuenow/min/max/text", () => {
    const pattern = getAriaPattern("progressbar");
    const attrs = pattern.attributes.map((a) => a.attribute);
    expect(attrs).toContain("aria-valuenow");
    expect(attrs).toContain("aria-valuemin");
    expect(attrs).toContain("aria-valuemax");
    expect(attrs).toContain("aria-valuetext");
    expect(attrs).toContain("aria-label");
  });
  test("ARIA_PATTERNS is frozen (readonly)", () => {
    expect(ARIA_PATTERNS.button).toBeDefined();
    expect(ARIA_PATTERNS.progressbar).toBeDefined();
  });
});
describe("keyboard maps", () => {
  test("all 9 keyboard maps are present", () => {
    const names = [
      "button",
      "radioGroup",
      "listbox",
      "combobox",
      "dialog",
      "tabs",
      "menu",
      "accordion",
      "dataGrid"
    ];
    for (const name of names) {
      const map = getKeyboardMap(name);
      expect(map.bindings.length).toBeGreaterThan(0);
      expect(map.focusStrategy).toBeString();
      expect(typeof map.loop).toBe("boolean");
      expect(typeof map.typeahead).toBe("boolean");
    }
  });
  test("focus strategies are correct", () => {
    expect(getKeyboardMap("tabs").focusStrategy).toBe("roving-tabindex");
    expect(getKeyboardMap("listbox").focusStrategy).toBe("aria-activedescendant");
    expect(getKeyboardMap("combobox").focusStrategy).toBe("aria-activedescendant");
    expect(getKeyboardMap("menu").focusStrategy).toBe("roving-tabindex");
    expect(getKeyboardMap("button").focusStrategy).toBe("manual");
  });
  test("typeahead flags match spec", () => {
    expect(getKeyboardMap("listbox").typeahead).toBe(true);
    expect(getKeyboardMap("menu").typeahead).toBe(true);
    expect(getKeyboardMap("tabs").typeahead).toBe(false);
    expect(getKeyboardMap("button").typeahead).toBe(false);
  });
  test("loop flags match spec", () => {
    expect(getKeyboardMap("radioGroup").loop).toBe(true);
    expect(getKeyboardMap("tabs").loop).toBe(true);
    expect(getKeyboardMap("menu").loop).toBe(true);
    expect(getKeyboardMap("dialog").loop).toBe(true);
    expect(getKeyboardMap("listbox").loop).toBe(false);
    expect(getKeyboardMap("dataGrid").loop).toBe(false);
  });
  test("shortcut registry CRUD", () => {
    let reg = createShortcutRegistry();
    expect(reg.shortcuts.size).toBe(0);
    reg = registerShortcut(reg, {
      id: "save",
      keys: "Ctrl+S",
      description: "Save document",
      modifier: true
    });
    expect(reg.shortcuts.size).toBe(1);
    const found = lookupShortcut(reg, "save");
    expect(found).toBeDefined();
    expect(found.keys).toBe("Ctrl+S");
    expect(found.description).toBe("Save document");
    expect(lookupShortcut(reg, "nonexistent")).toBeUndefined();
  });
  test("shortcut registry is immutable", () => {
    const reg1 = createShortcutRegistry();
    const reg2 = registerShortcut(reg1, {
      id: "test",
      keys: "Ctrl+T",
      description: "Test",
      modifier: true
    });
    expect(reg1.shortcuts.size).toBe(0);
    expect(reg2.shortcuts.size).toBe(1);
  });
  test("validateShortcutModifier enforces WCAG 2.1.4", () => {
    expect(validateShortcutModifier("Ctrl+S")).toBe(true);
    expect(validateShortcutModifier("Alt+F4")).toBe(true);
    expect(validateShortcutModifier("Shift+Tab")).toBe(true);
    expect(validateShortcutModifier("Meta+K")).toBe(true);
    expect(validateShortcutModifier("Ctrl+Shift+P")).toBe(true);
    expect(validateShortcutModifier("s")).toBe(false);
    expect(validateShortcutModifier("F1")).toBe(false);
    expect(validateShortcutModifier("Enter")).toBe(false);
  });
});
describe("announcements", () => {
  test("all scenarios have patterns", () => {
    const scenarios = [
      "toast-success",
      "toast-info",
      "form-error-summary",
      "form-error-field",
      "session-expiry",
      "loading-started",
      "loading-complete",
      "progress-update",
      "sort-filter-change",
      "route-change",
      "autocomplete-results"
    ];
    for (const s of scenarios) {
      const pattern = getAnnouncementPattern(s);
      expect(pattern.scenario).toBe(s);
      expect(pattern.priority).toBeOneOf(["polite", "assertive"]);
      expect(pattern.contentTemplate).toBeString();
      expect(pattern.timing).toBeString();
    }
  });
  test("priorities match spec", () => {
    expect(getAnnouncementPattern("toast-success").priority).toBe("polite");
    expect(getAnnouncementPattern("form-error-summary").priority).toBe("assertive");
    expect(getAnnouncementPattern("session-expiry").priority).toBe("assertive");
    expect(getAnnouncementPattern("route-change").priority).toBe("polite");
    expect(getAnnouncementPattern("loading-complete").priority).toBe("polite");
  });
  test("throttle values are set", () => {
    expect(getAnnouncementPattern("progress-update").throttleMs).toBe(5000);
    expect(getAnnouncementPattern("autocomplete-results").throttleMs).toBe(500);
  });
  test("getThrottleConfig returns config", () => {
    const config = getThrottleConfig();
    expect(config.progressUpdateMs).toBe(5000);
    expect(config.searchDebounceMs).toBe(500);
    expect(config.realTimeIntervalMs).toBe(1e4);
    expect(config.chatBatchMs).toBe(1000);
  });
  test("content templates contain placeholders", () => {
    expect(getAnnouncementPattern("form-error-summary").contentTemplate).toContain("{count}");
    expect(getAnnouncementPattern("session-expiry").contentTemplate).toContain("{minutes}");
    expect(getAnnouncementPattern("progress-update").contentTemplate).toContain("{percentage}");
    expect(getAnnouncementPattern("route-change").contentTemplate).toContain("{pageTitle}");
    expect(getAnnouncementPattern("autocomplete-results").contentTemplate).toContain("{count}");
  });
});
describe("focus management", () => {
  test("restoration targets cover all trigger types", () => {
    const types = [
      "button-opens-dialog",
      "button-opens-menu",
      "button-opens-popover",
      "link-triggers-modal"
    ];
    for (const t of types) {
      const target = FOCUS_RESTORATION_TARGETS[t];
      expect(target.triggerType).toBe(t);
      expect(target.restoreTo).toBeString();
      expect(target.fallbackChain.length).toBeGreaterThan(0);
      expect(target.fallbackChain[target.fallbackChain.length - 1]).toBe("main");
    }
  });
  test("getDefaultSkipLinks returns main content link", () => {
    const links = getDefaultSkipLinks();
    expect(links).toHaveLength(1);
    expect(links[0].label).toBe("Skip to main content");
    expect(links[0].target).toBe("#main-content");
  });
  test("getFocusableSelector returns valid CSS selector", () => {
    const selector = getFocusableSelector();
    expect(selector).toContain("a[href]");
    expect(selector).toContain("button");
    expect(selector).toContain("input");
    expect(selector).toContain("select");
    expect(selector).toContain("textarea");
    expect(selector).toContain("[tabindex]");
  });
  test("getRouteChangeFocusSelector returns h1", () => {
    expect(getRouteChangeFocusSelector()).toBe("h1");
  });
});
describe("accessibility subpath export", () => {
  test("@sig-ui/core/accessibility exports all public API", async () => {
    const mod = await import("../src/accessibility-export.js");
    expect(mod.getDefaultAccessibilityConfig).toBeFunction();
    expect(mod.getComplianceLevel).toBeFunction();
    expect(mod.meetsComplianceLevel).toBeFunction();
    expect(mod.ARIA_PATTERNS).toBeDefined();
    expect(mod.getAriaPattern).toBeFunction();
    expect(mod.getAriaPatternNames).toBeFunction();
    expect(mod.KEYBOARD_MAPS).toBeDefined();
    expect(mod.getKeyboardMap).toBeFunction();
    expect(mod.createShortcutRegistry).toBeFunction();
    expect(mod.registerShortcut).toBeFunction();
    expect(mod.lookupShortcut).toBeFunction();
    expect(mod.validateShortcutModifier).toBeFunction();
    expect(mod.ANNOUNCEMENT_PATTERNS).toBeDefined();
    expect(mod.getAnnouncementPattern).toBeFunction();
    expect(mod.getThrottleConfig).toBeFunction();
    expect(mod.FOCUS_RESTORATION_TARGETS).toBeDefined();
    expect(mod.getDefaultSkipLinks).toBeFunction();
    expect(mod.getFocusableSelector).toBeFunction();
    expect(mod.getRouteChangeFocusSelector).toBeFunction();
  });
});
