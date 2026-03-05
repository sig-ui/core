// @ts-check

/**
 * SigUI core harmony module for theme.
 * @module
 */
import { computeHarmony } from "./harmony.js";
import { generatePalette } from "../palette.js";
import { toOklch, fromOklch } from "../color-space/oklch.js";
import { isInGamut } from "../gamut/check.js";
import { clampToGamut } from "../gamut/clamp.js";
import { apcaContrast } from "../contrast/apca.js";
import { normalizeHue, clamp, toRadians } from "../utils.js";
const STATUS_HUES = {
  success: 145,
  warning: 85,
  danger: 25,
  info: 250
};
const STATUS_CHROMA_MIN = 0.08;
const STATUS_CHROMA_MAX = 0.18;
function buildSeedColor(hue, referenceChroma) {
  const c = clamp(referenceChroma, 0.01, 0.3);
  const seed = { l: 0.55, c, h: normalizeHue(hue), alpha: 1 };
  return fromOklch(seed, "hex");
}
function warmHue(h) {
  const n = normalizeHue(h);
  return n >= 100 && n < 280 ? normalizeHue(200 - n) : n;
}
function deriveBackground(primary, mode) {
  const h = warmHue(primary.h);
  const bg = mode === "light" ? { l: 0.985, c: 0.01, h, alpha: 1 } : { l: 0.15, c: 0.01, h, alpha: 1 };
  return fromOklch(bg, "hex");
}
const SURFACE_LIGHTNESS = {
  "bg.lowest": { light: 0.995, dark: 0.11 },
  "bg.primary": { light: 0.985, dark: 0.15 },
  "bg.low": { light: 0.975, dark: 0.17 },
  "bg.secondary": { light: 0.965, dark: 0.185 },
  "bg.tertiary": { light: 0.94, dark: 0.22 },
  "bg.highest": { light: 0.92, dark: 0.255 },
  "border.default": { light: 0.88, dark: 0.26 },
  "border.strong": { light: 0.8, dark: 0.34 }
};
/**
 * deriveSurfaceScale.
 * @param {number} primaryHue
 * @param {number} primaryChroma
 * @param {ColorMode} mode
 * @param {number} tintStrength
 * @returns {SurfaceScale}
 */
export function deriveSurfaceScale(primaryHue, primaryChroma, mode, tintStrength = 0.1) {
  const surfaceChroma = clamp(primaryChroma * tintStrength, 0, 0.04);
  const h = warmHue(primaryHue);
  const result = {};
  for (const [role, lightness] of Object.entries(SURFACE_LIGHTNESS)) {
    const l = mode === "light" ? lightness.light : lightness.dark;
    const color = { l, c: surfaceChroma, h, alpha: 1 };
    result[role] = fromOklch(color, "hex");
  }
  return result;
}
/**
 * deriveBrandBackground.
 * @param {number} brandHue
 * @param {number} brandChroma
 * @param {ColorMode} mode
 * @param {Gamut} gamut
 * @returns {string}
 */
export function deriveBrandBackground(brandHue, brandChroma, mode, gamut = "p3") {
  const H = warmHue(brandHue);
  if (mode === "light") {
    let L = 0.975;
    const hueScale = 1 - 0.3 * Math.max(0, Math.cos(toRadians(H - 270)));
    const C = clamp(0.007 * hueScale, 0.004, 0.012);
    const raw = { l: L, c: C, h: H, alpha: 1 };
    const clamped = isInGamut(raw, gamut) ? raw : clampToGamut(raw, gamut);
    const darkRef = { l: 0.15, c: 0, h: 0, alpha: 1 };
    const darkHex = fromOklch(darkRef, "hex");
    let bgHex = fromOklch(clamped, "hex");
    let lc = Math.abs(apcaContrast(darkHex, bgHex));
    if (lc < 90) {
      let lo = L, hi = 1;
      for (let i = 0;i < 16 && hi - lo > 0.0005; i++) {
        const mid = (lo + hi) / 2;
        const candidate = { l: mid, c: C, h: H, alpha: 1 };
        const cHex = fromOklch(isInGamut(candidate, gamut) ? candidate : clampToGamut(candidate, gamut), "hex");
        if (Math.abs(apcaContrast(darkHex, cHex)) >= 90) {
          hi = mid;
          bgHex = cHex;
        } else {
          lo = mid;
        }
      }
    }
    return bgHex;
  } else {
    let L = 0.2;
    const hueScale = 1 + 0.3 * Math.max(0, Math.cos(toRadians(H - 270)));
    const C = clamp(0.015 * hueScale, 0.008, 0.025);
    const raw = { l: L, c: C, h: H, alpha: 1 };
    const clamped = isInGamut(raw, gamut) ? raw : clampToGamut(raw, gamut);
    const lightRef = { l: 0.93, c: 0, h: 0, alpha: 1 };
    const lightHex = fromOklch(lightRef, "hex");
    let bgHex = fromOklch(clamped, "hex");
    let lc = Math.abs(apcaContrast(lightHex, bgHex));
    if (lc < 90) {
      let lo = 0, hi = L;
      for (let i = 0;i < 16 && hi - lo > 0.0005; i++) {
        const mid = (lo + hi) / 2;
        const candidate = { l: mid, c: C, h: H, alpha: 1 };
        const cHex = fromOklch(isInGamut(candidate, gamut) ? candidate : clampToGamut(candidate, gamut), "hex");
        if (Math.abs(apcaContrast(lightHex, cHex)) >= 90) {
          lo = mid;
          bgHex = cHex;
        } else {
          hi = mid;
        }
      }
    }
    return bgHex;
  }
}
/**
 * generateFullPalette.
 * @param {string} primary
 * @param {ThemeOptions} options
 * @returns {ThemeColors}
 */
export function generateFullPalette(primary, options = {}) {
  const {
    harmony: harmonyMode = "triadic",
    mode = "light",
    gamut = "p3",
    overrides = {},
    tintStrength = 0.1
  } = options;
  const primaryOklch = toOklch(primary);
  const harmonyResult = computeHarmony(primaryOklch.h, harmonyMode);
  const surfaces = deriveSurfaceScale(primaryOklch.h, primaryOklch.c, mode, tintStrength);
  const background = options.background ?? surfaces["bg.primary"];
  function makePalette(hex) {
    return generatePalette(hex, { background, mode, gamut, format: "hex" });
  }
  const palettes = {};
  palettes.primary = makePalette(primary);
  if (overrides.secondary) {
    palettes.secondary = makePalette(overrides.secondary);
  } else {
    const secondaryHue = harmonyResult.hues.length > 1 ? harmonyResult.hues[1] : normalizeHue(primaryOklch.h + 30);
    palettes.secondary = makePalette(buildSeedColor(secondaryHue, primaryOklch.c));
  }
  if (overrides.tertiary) {
    palettes.tertiary = makePalette(overrides.tertiary);
  } else {
    const tertiaryHue = harmonyResult.hues.length > 2 ? harmonyResult.hues[2] : normalizeHue(primaryOklch.h - 30);
    palettes.tertiary = makePalette(buildSeedColor(tertiaryHue, primaryOklch.c));
  }
  if (overrides.accent) {
    palettes.accent = makePalette(overrides.accent);
  } else {
    palettes.accent = makePalette(buildSeedColor(normalizeHue(primaryOklch.h + 180), primaryOklch.c));
  }
  const statusChroma = clamp(primaryOklch.c, STATUS_CHROMA_MIN, STATUS_CHROMA_MAX);
  for (const [name, hue] of Object.entries(STATUS_HUES)) {
    const override = overrides[name];
    if (override) {
      palettes[name] = makePalette(override);
    } else {
      palettes[name] = makePalette(buildSeedColor(hue, statusChroma));
    }
  }
  if (overrides.neutral) {
    palettes.neutral = makePalette(overrides.neutral);
  } else {
    const neutralChroma = clamp(primaryOklch.c * tintStrength, 0.005, 0.03);
    palettes.neutral = makePalette(buildSeedColor(primaryOklch.h, neutralChroma));
  }
  const p = (name, stop) => palettes[name].formatted[stop];
  const ACTIONABLE_ROLES = {
    primary: { palette: "primary", shade: 500 },
    secondary: { palette: "secondary", shade: 500 },
    tertiary: { palette: "tertiary", shade: 500 },
    accent: { palette: "accent", shade: 500 },
    highlight: { palette: "accent", shade: 200 },
    success: { palette: "success", shade: 500 },
    warning: { palette: "warning", shade: 500 },
    danger: { palette: "danger", shade: 500 },
    info: { palette: "info", shade: 500 }
  };
  const roles = {
    primary: p("primary", 500),
    secondary: p("secondary", 500),
    tertiary: p("tertiary", 500),
    accent: p("accent", 500),
    highlight: p("accent", 200),
    text: p("neutral", 800),
    "text-secondary": p("neutral", 600),
    "text-muted": p("neutral", 400),
    title: p("neutral", 900),
    subtitle: p("neutral", 700),
    link: p("primary", 600),
    "link-visited": p("primary", 800),
    emphasis: p("primary", 700),
    "bg-light": background,
    "bg-dark": deriveBackground(primaryOklch, "dark"),
    surface: p("neutral", 100),
    "surface-alt": p("neutral", 200),
    border: p("neutral", 300),
    "border-light": p("neutral", 200),
    shadow: p("neutral", 900),
    "code-text": p("neutral", mode === "dark" ? 200 : 800),
    "code-bg": p("neutral", mode === "dark" ? 800 : 200),
    success: p("success", 500),
    warning: p("warning", 500),
    danger: p("danger", 500),
    info: p("info", 500)
  };
  for (const [role, def] of Object.entries(ACTIONABLE_ROLES)) {
    const hoverShade = Math.min(def.shade + 100, 950);
    const activeShade = Math.min(def.shade + 200, 950);
    roles[`${role}-hover`] = p(def.palette, hoverShade);
    roles[`${role}-active`] = p(def.palette, activeShade);
    roles[`${role}-subtle`] = p(def.palette, 100);
  }
  const dataL = 0.55;
  const dataC = clamp(primaryOklch.c, 0.08, 0.15);
  const dataHueStep = 360 / 12;
  for (let i = 0;i < 12; i++) {
    const hue = normalizeHue(primaryOklch.h + i * dataHueStep);
    const color = { l: dataL, c: dataC, h: hue, alpha: 1 };
    roles[`data-${i + 1}`] = fromOklch(color, "hex");
  }
  return {
    palettes,
    roles,
    surfaces,
    harmony: harmonyResult,
    background,
    mode
  };
}
