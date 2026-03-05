// @ts-check

/**
 * Repository module for device context.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  classifyDevice,
  deriveCommittedInputMode,
  estimateViewingDistance,
  estimateScreenPpi,
  getDeviceParameters,
  classifyRefreshRate,
  getMinAnimationDuration,
  REFRESH_TIER_MIN_DURATION,
  inferDisplayType,
  getDarkModeWeightOffset,
  resolveGamut,
  DEFAULT_DEVICE_CONTEXT
} from "../src/device/index.js";
describe("classifyDevice", () => {
  test("watch: screenWidth < 300", () => {
    const signals = {
      screenWidth: 250,
      pointerCoarse: true,
      pointerFine: false,
      maxTouchPoints: 1
    };
    expect(classifyDevice(signals)).toBe("watch");
  });
  test("phone: coarse-only + narrow width", () => {
    const signals = {
      screenWidth: 390,
      pointerCoarse: true,
      pointerFine: false,
      maxTouchPoints: 5
    };
    expect(classifyDevice(signals)).toBe("phone");
  });
  test("phone: coarse-only + mobile UA hint", () => {
    const signals = {
      screenWidth: 500,
      pointerCoarse: true,
      pointerFine: false,
      maxTouchPoints: 5,
      mobile: true
    };
    expect(classifyDevice(signals)).toBe("phone");
  });
  test("tablet: coarse-only + medium width", () => {
    const signals = {
      screenWidth: 768,
      pointerCoarse: true,
      pointerFine: false,
      maxTouchPoints: 5
    };
    expect(classifyDevice(signals)).toBe("tablet");
  });
  test("tv: coarse-only + very wide + no touch", () => {
    const signals = {
      screenWidth: 1920,
      pointerCoarse: true,
      pointerFine: false,
      maxTouchPoints: 0
    };
    expect(classifyDevice(signals)).toBe("tv");
  });
  test("desktop: fine-only + wide screen", () => {
    const signals = {
      screenWidth: 2560,
      pointerCoarse: false,
      pointerFine: true,
      maxTouchPoints: 0
    };
    expect(classifyDevice(signals)).toBe("desktop");
  });
  test("laptop: fine-only + narrow-ish screen", () => {
    const signals = {
      screenWidth: 1366,
      pointerCoarse: false,
      pointerFine: true,
      maxTouchPoints: 0
    };
    expect(classifyDevice(signals)).toBe("laptop");
  });
  test("laptop: hybrid (fine + coarse) + wide screen", () => {
    const signals = {
      screenWidth: 1440,
      pointerCoarse: true,
      pointerFine: true,
      maxTouchPoints: 10
    };
    expect(classifyDevice(signals)).toBe("laptop");
  });
  test("tablet: hybrid (fine + coarse) + narrow screen", () => {
    const signals = {
      screenWidth: 800,
      pointerCoarse: true,
      pointerFine: true,
      maxTouchPoints: 10
    };
    expect(classifyDevice(signals)).toBe("tablet");
  });
  test("fallback: touch + narrow → phone", () => {
    const signals = {
      screenWidth: 400,
      pointerCoarse: false,
      pointerFine: false,
      maxTouchPoints: 5
    };
    expect(classifyDevice(signals)).toBe("phone");
  });
  test("fallback: no touch + no pointer → desktop", () => {
    const signals = {
      screenWidth: 1920,
      pointerCoarse: false,
      pointerFine: false,
      maxTouchPoints: 0
    };
    expect(classifyDevice(signals)).toBe("desktop");
  });
  test("Tier 2: formFactor=watch", () => {
    const signals = {
      screenWidth: 400,
      pointerCoarse: true,
      pointerFine: false,
      maxTouchPoints: 1,
      formFactor: "watch"
    };
    expect(classifyDevice(signals)).toBe("watch");
  });
  test("Tier 2: formFactor=tv", () => {
    const signals = {
      screenWidth: 1920,
      pointerCoarse: false,
      pointerFine: false,
      maxTouchPoints: 0,
      formFactor: "TV"
    };
    expect(classifyDevice(signals)).toBe("tv");
  });
  test("Tier 2: formFactor=tablet", () => {
    const signals = {
      screenWidth: 1024,
      pointerCoarse: true,
      pointerFine: true,
      maxTouchPoints: 10,
      formFactor: "tablet"
    };
    expect(classifyDevice(signals)).toBe("tablet");
  });
});
describe("deriveCommittedInputMode", () => {
  test("fine-only → pointer", () => {
    expect(deriveCommittedInputMode(true, false)).toBe("pointer");
  });
  test("coarse-only → touch", () => {
    expect(deriveCommittedInputMode(false, true)).toBe("touch");
  });
  test("both → hybrid", () => {
    expect(deriveCommittedInputMode(true, true)).toBe("hybrid");
  });
  test("neither → touch (defensive default)", () => {
    expect(deriveCommittedInputMode(false, false)).toBe("touch");
  });
});
describe("estimateViewingDistance", () => {
  test("returns positive values for all device classes", () => {
    const classes = ["watch", "phone", "tablet", "laptop", "desktop", "tv", "kiosk"];
    for (const cls of classes) {
      expect(estimateViewingDistance(cls)).toBeGreaterThan(0);
    }
  });
  test("phone distance is 37cm (corrected)", () => {
    expect(estimateViewingDistance("phone")).toBe(37);
  });
  test("desktop distance is 71cm", () => {
    expect(estimateViewingDistance("desktop")).toBe(71);
  });
  test("tv has the longest viewing distance", () => {
    const classes = ["watch", "phone", "tablet", "laptop", "desktop", "tv", "kiosk"];
    const tvDist = estimateViewingDistance("tv");
    for (const cls of classes) {
      expect(tvDist).toBeGreaterThanOrEqual(estimateViewingDistance(cls));
    }
  });
});
describe("estimateScreenPpi", () => {
  test("returns positive values for all device classes", () => {
    const classes = ["watch", "phone", "tablet", "laptop", "desktop", "tv", "kiosk"];
    for (const cls of classes) {
      expect(estimateScreenPpi(cls)).toBeGreaterThan(0);
    }
  });
  test("watch has highest PPI (Retina)", () => {
    expect(estimateScreenPpi("watch")).toBe(326);
  });
  test("TV has lowest PPI (large panel, low density)", () => {
    expect(estimateScreenPpi("tv")).toBe(40);
  });
});
describe("getDeviceParameters", () => {
  test("returns params for all device classes", () => {
    const classes = ["watch", "phone", "tablet", "laptop", "desktop", "tv", "kiosk"];
    for (const cls of classes) {
      const params = getDeviceParameters(cls);
      expect(params.baseFontSize).toBeGreaterThan(0);
      expect(params.spacingBaseUnit).toBeGreaterThan(0);
      expect(params.minInteractiveTarget).toBeGreaterThan(0);
      expect(params.maxLineLength).toBeGreaterThan(0);
      expect(params.durationScalarBase).toBeGreaterThan(0);
      expect(["compact", "comfortable", "spacious"]).toContain(params.defaultDensity);
    }
  });
  test("phone has 44px touch target", () => {
    expect(getDeviceParameters("phone").minInteractiveTarget).toBe(44);
  });
  test("desktop has 24px touch target", () => {
    expect(getDeviceParameters("desktop").minInteractiveTarget).toBe(24);
  });
  test("tv has largest base font", () => {
    expect(getDeviceParameters("tv").baseFontSize).toBe(48);
  });
  test("watch has compact density", () => {
    expect(getDeviceParameters("watch").defaultDensity).toBe("compact");
  });
  test("tv has spacious density", () => {
    expect(getDeviceParameters("tv").defaultDensity).toBe("spacious");
  });
  test("tv has larger spacing base unit", () => {
    expect(getDeviceParameters("tv").spacingBaseUnit).toBe(24);
  });
});
describe("classifyRefreshRate", () => {
  test("120Hz → high", () => {
    expect(classifyRefreshRate(120)).toBe("high");
  });
  test("90Hz → high", () => {
    expect(classifyRefreshRate(90)).toBe("high");
  });
  test("60Hz → medium", () => {
    expect(classifyRefreshRate(60)).toBe("medium");
  });
  test("48Hz → medium", () => {
    expect(classifyRefreshRate(48)).toBe("medium");
  });
  test("30Hz → low", () => {
    expect(classifyRefreshRate(30)).toBe("low");
  });
  test("0Hz → low", () => {
    expect(classifyRefreshRate(0)).toBe("low");
  });
});
describe("getMinAnimationDuration", () => {
  test("high → 44ms", () => {
    expect(getMinAnimationDuration("high")).toBe(44);
  });
  test("medium → 67ms", () => {
    expect(getMinAnimationDuration("medium")).toBe(67);
  });
  test("low → 133ms", () => {
    expect(getMinAnimationDuration("low")).toBe(133);
  });
});
describe("REFRESH_TIER_MIN_DURATION", () => {
  test("has all three tiers", () => {
    expect(REFRESH_TIER_MIN_DURATION).toHaveProperty("high");
    expect(REFRESH_TIER_MIN_DURATION).toHaveProperty("medium");
    expect(REFRESH_TIER_MIN_DURATION).toHaveProperty("low");
  });
});
describe("inferDisplayType", () => {
  test("HDR + P3 → oled", () => {
    const signals = { dynamicRangeHigh: true, gamutP3: true, gamutRec2020: false };
    expect(inferDisplayType(signals)).toBe("oled");
  });
  test("HDR + no P3 → hdr-lcd", () => {
    const signals = { dynamicRangeHigh: true, gamutP3: false, gamutRec2020: false };
    expect(inferDisplayType(signals)).toBe("hdr-lcd");
  });
  test("no HDR → lcd", () => {
    const signals = { dynamicRangeHigh: false, gamutP3: true, gamutRec2020: false };
    expect(inferDisplayType(signals)).toBe("lcd");
  });
  test("all false → lcd", () => {
    const signals = { dynamicRangeHigh: false, gamutP3: false, gamutRec2020: false };
    expect(inferDisplayType(signals)).toBe("lcd");
  });
});
describe("getDarkModeWeightOffset", () => {
  test("oled → -50", () => {
    expect(getDarkModeWeightOffset("oled")).toBe(-50);
  });
  test("lcd → -100", () => {
    expect(getDarkModeWeightOffset("lcd")).toBe(-100);
  });
  test("hdr-lcd → -100", () => {
    expect(getDarkModeWeightOffset("hdr-lcd")).toBe(-100);
  });
  test("unknown → -100", () => {
    expect(getDarkModeWeightOffset("unknown")).toBe(-100);
  });
});
describe("resolveGamut", () => {
  test("rec2020 → rec2020", () => {
    const signals = { dynamicRangeHigh: false, gamutP3: true, gamutRec2020: true };
    expect(resolveGamut(signals)).toBe("rec2020");
  });
  test("p3 → p3", () => {
    const signals = { dynamicRangeHigh: false, gamutP3: true, gamutRec2020: false };
    expect(resolveGamut(signals)).toBe("p3");
  });
  test("neither → srgb", () => {
    const signals = { dynamicRangeHigh: false, gamutP3: false, gamutRec2020: false };
    expect(resolveGamut(signals)).toBe("srgb");
  });
});
describe("DEFAULT_DEVICE_CONTEXT", () => {
  test("is a desktop device", () => {
    expect(DEFAULT_DEVICE_CONTEXT.class).toBe("desktop");
  });
  test("uses pointer input", () => {
    expect(DEFAULT_DEVICE_CONTEXT.input.committed).toBe("pointer");
  });
  test("has 60Hz medium refresh", () => {
    expect(DEFAULT_DEVICE_CONTEXT.display.refreshRate).toBe(60);
    expect(DEFAULT_DEVICE_CONTEXT.display.refreshTier).toBe("medium");
  });
  test("has sRGB gamut", () => {
    expect(DEFAULT_DEVICE_CONTEXT.display.gamut).toBe("srgb");
  });
  test("has light color scheme", () => {
    expect(DEFAULT_DEVICE_CONTEXT.ambient.colorScheme).toBe("light");
  });
  test("has no reduced motion", () => {
    expect(DEFAULT_DEVICE_CONTEXT.ambient.reducedMotion).toBe(false);
  });
  test("has 1.0 contrast boost", () => {
    expect(DEFAULT_DEVICE_CONTEXT.ambient.contrastBoost).toBe(1);
  });
  test("is tier 1", () => {
    expect(DEFAULT_DEVICE_CONTEXT.tier).toBe(1);
  });
  test("has lcd display type", () => {
    expect(DEFAULT_DEVICE_CONTEXT.display.inferredType).toBe("lcd");
  });
  test("viewing distance matches desktop preset", () => {
    expect(DEFAULT_DEVICE_CONTEXT.viewingDistanceCm).toBe(71);
  });
});
