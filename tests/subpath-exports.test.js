// @ts-check

/**
 * Repository module for subpath exports.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
describe("sub-path exports", () => {
  test("@sig-ui/core/color exports", async () => {
    const mod = await import("../src/color.js");
    expect(mod.toOklch).toBeFunction();
    expect(mod.fromOklch).toBeFunction();
    expect(mod.parseHex).toBeFunction();
    expect(mod.toHex).toBeFunction();
    expect(mod.lighten).toBeFunction();
    expect(mod.darken).toBeFunction();
    expect(mod.saturate).toBeFunction();
    expect(mod.desaturate).toBeFunction();
    expect(mod.shiftHue).toBeFunction();
    expect(mod.isInGamut).toBeFunction();
    expect(mod.clampToGamut).toBeFunction();
    expect(mod.deltaEOK).toBeFunction();
  });
  test("@sig-ui/core/contrast exports", async () => {
    const mod = await import("../src/contrast.js");
    expect(mod.apcaContrast).toBeFunction();
    expect(mod.wcag2Contrast).toBeFunction();
    expect(mod.meetsWCAG_AA).toBeFunction();
    expect(mod.meetsWCAG_AAA).toBeFunction();
    expect(mod.bridgeLcToRatio).toBeFunction();
    expect(mod.bridgePcaContrast).toBeFunction();
    expect(mod.meetsBridgeAA).toBeFunction();
    expect(mod.meetsBridgeAAA).toBeFunction();
  });
  test("@sig-ui/core/palette exports", async () => {
    const mod = await import("../src/palette-export.js");
    expect(mod.generatePalette).toBeFunction();
    expect(mod.generateShadeRamp).toBeFunction();
  });
  test("@sig-ui/core/cvd exports", async () => {
    const mod = await import("../src/cvd-export.js");
    expect(mod.simulateCVD).toBeFunction();
    expect(mod.validateCvdPair).toBeFunction();
    expect(mod.validateCategoricalPalette).toBeFunction();
  });
  test("@sig-ui/core/interpolate exports", async () => {
    const mod = await import("../src/interpolate.js");
    expect(mod.interpolateColor).toBeFunction();
    expect(mod.gradientFill).toBeFunction();
    expect(mod.multiGradient).toBeFunction();
  });
  test("@sig-ui/core/tokens exports", async () => {
    const mod = await import("../src/tokens.js");
    expect(mod.rampToDTCG).toBeFunction();
    expect(mod.paletteToDTCG).toBeFunction();
    expect(mod.rolesToDTCG).toBeFunction();
    expect(mod.spacingToDTCG).toBeFunction();
    expect(mod.typographyToDTCG).toBeFunction();
    expect(mod.shadowsToDTCG).toBeFunction();
    expect(mod.motionToDTCG).toBeFunction();
    expect(mod.themeToDTCG).toBeFunction();
    expect(mod.iconsToDTCG).toBeFunction();
  });
  test("@sig-ui/core/icons exports", async () => {
    const mod = await import("../src/icons-export.js");
    expect(mod.ICON_SIZES).toBeDefined();
    expect(mod.ICON_STROKES).toBeDefined();
    expect(mod.ICON_CATEGORIES).toBeDefined();
    expect(mod.ICON_ALIASES).toBeDefined();
    expect(mod.CORE_ICON_MANIFEST).toBeDefined();
    expect(mod.ICONS_THAT_MIRROR).toBeDefined();
    expect(mod.ICONS_THAT_DO_NOT_MIRROR).toBeDefined();
    expect(mod.DEFAULT_ICON_CONFIG).toBeDefined();
    expect(mod.getIconSize).toBeFunction();
    expect(mod.getIconStroke).toBeFunction();
    expect(mod.getStrokeProfile).toBeFunction();
    expect(mod.getStrokeForSize).toBeFunction();
    expect(mod.computeCornerRadius).toBeFunction();
    expect(mod.resolveIconName).toBeFunction();
    expect(mod.validateIconName).toBeFunction();
    expect(mod.getIconCategory).toBeFunction();
    expect(mod.shouldMirrorInRTL).toBeFunction();
    expect(mod.isFixedDirection).toBeFunction();
    expect(mod.resolveIconConfig).toBeFunction();
    expect(mod.validateIconConfig).toBeFunction();
  });
  test("@sig-ui/core/accessibility exports", async () => {
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
