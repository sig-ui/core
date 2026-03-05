// @ts-check

/**
 * SigUI core device module for defaults.
 * @module
 */
export const DEFAULT_DEVICE_CONTEXT = {
  class: "desktop",
  viewingDistanceCm: 71,
  screenPpi: 96,
  input: {
    committed: "pointer",
    transient: "mouse",
    maxTouchPoints: 0
  },
  display: {
    dpr: 1,
    gamut: "srgb",
    hdr: false,
    colorDepth: 8,
    refreshTier: "medium",
    refreshRate: 60,
    inferredType: "lcd",
    orientation: "landscape"
  },
  ambient: {
    colorScheme: "light",
    contrastPreference: "none",
    reducedMotion: false,
    reducedTransparency: false,
    forcedColors: false,
    contrastBoost: 1
  },
  tier: 1
};
