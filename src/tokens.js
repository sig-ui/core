// @ts-check

/**
 * SigUI core tokens module for tokens.
 * @module
 */
import { fromOklch } from "./color-space/oklch.js";
import { isInGamut } from "./gamut/check.js";
import { apcaContrast } from "./contrast/apca.js";
import { ALL_STOPS } from "./generation/targets.js";
/**
 * rampToDTCG.
 * @param {string} name
 * @param {ShadeRamp} ramp
 * @param {RampToDTCGOptions} options
 * @returns {DTCGGroup}
 */
export function rampToDTCG(name, ramp, options = {}) {
  const {
    includeGamutInfo = false,
    includeAPCAMetadata = false,
    background,
    mode
  } = options;
  const group = {
    $type: "color"
  };
  for (const stop of ALL_STOPS) {
    const color = ramp[stop];
    if (!color)
      continue;
    const oklchStr = fromOklch(color, "oklch");
    const inSrgb = isInGamut(color, "srgb");
    let extensions;
    if (includeGamutInfo || includeAPCAMetadata) {
      const sigui = {};
      if (includeGamutInfo) {
        sigui.gamut = inSrgb ? "srgb" : "p3";
        if (!inSrgb) {
          sigui.srgbFallback = fromOklch(color, "hex");
        }
      }
      if (includeAPCAMetadata && background) {
        const lc = Math.round(Math.abs(apcaContrast(color, background)));
        sigui.apcaLc = lc;
      }
      if (Object.keys(sigui).length > 0) {
        extensions = { "com.sigui": sigui };
      }
    }
    const token = { $value: oklchStr };
    if (includeGamutInfo && !inSrgb) {
      token.$description = "Out of sRGB gamut (Display P3)";
    }
    if (extensions) {
      token.$extensions = extensions;
    }
    group[String(stop)] = token;
  }
  return { [name]: group };
}
/**
 * paletteToDTCG.
 * @param {Record<string, ShadeRamp>} ramps
 * @param {PaletteToDTCGOptions} options
 * @returns {DTCGGroup}
 */
export function paletteToDTCG(ramps, options = {}) {
  const tree = {};
  for (const [name, ramp] of Object.entries(ramps)) {
    const group = rampToDTCG(name, ramp, options);
    tree[name] = group[name];
  }
  return tree;
}
/**
 * rolesToDTCG.
 * @param {Record<string, string>} roles
 * @returns {DTCGGroup}
 */
export function rolesToDTCG(roles) {
  const ROLE_REGEX = /^(.+?)@(\d+)$/;
  const root = {};
  for (const [role, value] of Object.entries(roles)) {
    const match = ROLE_REGEX.exec(value);
    if (!match)
      continue;
    const token = {
      $value: `{${match[1]}.${match[2]}}`,
      $type: "color"
    };
    const parts = role.split(".");
    let current = root;
    for (let i = 0;i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== "object") {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = token;
  }
  return root;
}
/**
 * spacingToDTCG.
 * @param {SpacingScale} scale
 * @returns {DTCGGroup}
 */
export function spacingToDTCG(scale) {
  const group = {
    $type: "dimension"
  };
  for (const [name, value] of Object.entries(scale)) {
    group[name] = { $value: value };
  }
  return { space: group };
}
/**
 * typographyToDTCG.
 * @param {TypographyConfig} config
 * @returns {DTCGGroup}
 */
export function typographyToDTCG(config) {
  const root = {};
  if (config.fontFamilies) {
    const group = { $type: "fontFamily" };
    for (const [name, value] of Object.entries(config.fontFamilies)) {
      group[name] = { $value: value };
    }
    root.fontFamily = group;
  }
  if (config.fontSizes) {
    const group = { $type: "dimension" };
    for (const [name, value] of Object.entries(config.fontSizes)) {
      group[name] = { $value: value };
    }
    root.fontSize = group;
  }
  if (config.fontWeights) {
    const group = { $type: "fontWeight" };
    for (const [name, value] of Object.entries(config.fontWeights)) {
      group[name] = { $value: value };
    }
    root.fontWeight = group;
  }
  if (config.lineHeights) {
    const group = { $type: "number" };
    for (const [name, value] of Object.entries(config.lineHeights)) {
      group[name] = { $value: value };
    }
    root.lineHeight = group;
  }
  if (config.letterSpacings) {
    const group = { $type: "dimension" };
    for (const [name, value] of Object.entries(config.letterSpacings)) {
      group[name] = { $value: value };
    }
    root.letterSpacing = group;
  }
  if (config.composites) {
    const group = { $type: "typography" };
    for (const [name, value] of Object.entries(config.composites)) {
      group[name] = {
        $value: {
          fontFamily: value.fontFamily,
          fontSize: value.fontSize,
          fontWeight: value.fontWeight,
          lineHeight: value.lineHeight,
          letterSpacing: value.letterSpacing
        }
      };
    }
    root.typography = group;
  }
  return root;
}
/**
 * shadowsToDTCG.
 * @param {ShadowScale} shadows
 * @returns {DTCGGroup}
 */
export function shadowsToDTCG(shadows) {
  const group = {
    $type: "shadow"
  };
  for (const [name, value] of Object.entries(shadows)) {
    if (Array.isArray(value)) {
      group[name] = {
        $value: value.map(toShadowValue)
      };
    } else {
      group[name] = {
        $value: toShadowValue(value)
      };
    }
  }
  return { shadow: group };
}
function toShadowValue(input) {
  return {
    offsetX: input.offsetX,
    offsetY: input.offsetY,
    blur: input.blur,
    spread: input.spread,
    color: input.color
  };
}
/**
 * motionToDTCG.
 * @param {MotionConfig} config
 * @returns {DTCGGroup}
 */
export function motionToDTCG(config) {
  const root = {};
  if (config.durations) {
    const group = { $type: "duration" };
    for (const [name, value] of Object.entries(config.durations)) {
      group[name] = { $value: value };
    }
    root.duration = group;
  }
  if (config.easings) {
    const group = { $type: "cubicBezier" };
    for (const [name, value] of Object.entries(config.easings)) {
      group[name] = { $value: value };
    }
    root.easing = group;
  }
  if (config.springEasings) {
    const springGroup = {};
    for (const [name, spring] of Object.entries(config.springEasings)) {
      springGroup[name] = {
        $value: spring.css,
        $type: "string",
        $extensions: {
          "com.sigui": {
            easingKind: "spring-linear",
            springConfig: spring.config
          }
        }
      };
    }
    if (!root.easing) {
      root.easing = springGroup;
    } else {
      Object.assign(root.easing, springGroup);
    }
  }
  return root;
}
/**
 * iconsToDTCG.
 * @param {IconToDTCGConfig} config
 * @returns {DTCGGroup}
 */
export function iconsToDTCG(config) {
  const defaultSizes = {
    xs: "0.75rem",
    sm: "1rem",
    md: "1.25rem",
    default: "1.5rem",
    lg: "2rem",
    xl: "3rem"
  };
  const defaultStrokes = {
    thin: "1px",
    default: "1.5px",
    medium: "2px",
    bold: "2.5px"
  };
  const defaultDarkMode = {
    "outlined-opacity": 0.88,
    "outlined-opacity-hidpi": 0.93,
    "filled-l-offset": -0.03,
    "filled-l-offset-hidpi": -0.01
  };
  const sizes = config?.sizes ?? defaultSizes;
  const strokes = config?.strokes ?? defaultStrokes;
  const sizeGroup = { $type: "dimension" };
  for (const [name, value] of Object.entries(sizes)) {
    sizeGroup[name] = { $value: value };
  }
  const strokeGroup = { $type: "dimension" };
  for (const [name, value] of Object.entries(strokes)) {
    strokeGroup[name] = { $value: value };
  }
  const dmOverrides = config?.darkMode;
  const darkModeGroup = { $type: "number" };
  darkModeGroup["outlined-opacity"] = {
    $value: dmOverrides?.outlinedOpacity ?? defaultDarkMode["outlined-opacity"]
  };
  darkModeGroup["outlined-opacity-hidpi"] = {
    $value: dmOverrides?.outlinedOpacityHiDPI ?? defaultDarkMode["outlined-opacity-hidpi"]
  };
  darkModeGroup["filled-l-offset"] = {
    $value: dmOverrides?.filledLightnessOffset ?? defaultDarkMode["filled-l-offset"]
  };
  darkModeGroup["filled-l-offset-hidpi"] = {
    $value: dmOverrides?.filledLightnessOffsetHiDPI ?? defaultDarkMode["filled-l-offset-hidpi"]
  };
  return {
    icon: {
      size: sizeGroup,
      stroke: strokeGroup,
      darkMode: darkModeGroup
    }
  };
}
/**
 * aspectRatiosToDTCG.
 * @param {AspectRatioScale} ratios
 * @returns {DTCGGroup}
 */
export function aspectRatiosToDTCG(ratios) {
  const group = {
    $type: "number"
  };
  for (const [name, value] of Object.entries(ratios)) {
    group[name] = { $value: value };
  }
  return { aspectRatio: group };
}
/**
 * themeToDTCG.
 * @param {ThemeInput} theme
 * @param {ThemeToDTCGOptions} options
 * @returns {DTCGGroup}
 */
export function themeToDTCG(theme, options = {}) {
  const root = {};
  if (theme.palette) {
    const paletteOpts = {
      includeGamutInfo: options.includeGamutInfo,
      includeAPCAMetadata: options.includeAPCAMetadata,
      background: options.backgroundLight,
      mode: "light"
    };
    root.color = paletteToDTCG(theme.palette, paletteOpts);
  }
  if (theme.roles) {
    const semanticGroup = {
      $type: "color"
    };
    const resolved = rolesToDTCG(theme.roles);
    for (const [key, value] of Object.entries(resolved)) {
      semanticGroup[key] = value;
    }
    if (root.color && typeof root.color === "object") {
      root.color.semantic = semanticGroup;
    } else {
      root.color = { semantic: semanticGroup };
    }
  }
  if (theme.spacing) {
    const spacingTree = spacingToDTCG(theme.spacing);
    Object.assign(root, spacingTree);
  }
  if (theme.typography) {
    const typoTree = typographyToDTCG(theme.typography);
    Object.assign(root, typoTree);
  }
  if (theme.shadows) {
    const shadowTree = shadowsToDTCG(theme.shadows);
    Object.assign(root, shadowTree);
  }
  if (theme.motion) {
    const motionTree = motionToDTCG(theme.motion);
    Object.assign(root, motionTree);
  }
  if (theme.icons) {
    const iconTree = iconsToDTCG(theme.icons);
    Object.assign(root, iconTree);
  }
  if (theme.aspectRatios) {
    const arTree = aspectRatiosToDTCG(theme.aspectRatios);
    Object.assign(root, arTree);
  }
  return root;
}
/**
 * i18nToDTCG.
 * @param {I18nToDTCGConfig} config
 * @returns {DTCGGroup}
 */
export function i18nToDTCG(config) {
  const root = {};
  if (config.fontFamilies && Object.keys(config.fontFamilies).length > 0) {
    const token = {
      $value: "Inter, system-ui, sans-serif",
      $type: "fontFamily",
      $extensions: {
        "sigui.i18n": Object.fromEntries(Object.entries(config.fontFamilies).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.join(", ") : v
        ]))
      }
    };
    root.fontFamily = { sans: token };
  }
  if (config.lineHeights && Object.keys(config.lineHeights).length > 0) {
    const token = {
      $value: 1.55,
      $type: "number",
      $extensions: {
        "sigui.i18n": config.lineHeights
      }
    };
    root.lineHeight = { body: token };
  }
  if (config.apcaOffsets && Object.keys(config.apcaOffsets).length > 0) {
    const token = {
      $value: 0,
      $type: "number",
      $extensions: {
        "sigui.i18n": config.apcaOffsets
      }
    };
    root.accessibility = { apcaOffset: token };
  }
  if (config.fontWeights && Object.keys(config.fontWeights).length > 0) {
    const token = {
      $value: 400,
      $type: "fontWeight",
      $extensions: {
        "sigui.i18n": config.fontWeights
      }
    };
    root.fontWeight = { body: token };
  }
  return root;
}
