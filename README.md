# @sig-ui/core

Pure JavaScript utilities for SigUI design tokens, color science, typography, spacing, motion, accessibility, and state machines.

## Install

```bash
bun add @sig-ui/core
```

## Quick start

```js
import { generatePalette } from "@sig-ui/core/palette";
import { apcaContrast } from "@sig-ui/core/contrast";

const palette = generatePalette("#6366f1", { background: "#ffffff" });
console.log(palette.formatted[500]); // e.g. #6366f1

const lc = Math.abs(apcaContrast(palette.ramp[900], "#ffffff"));
console.log(lc);
```

## Common entry points

- `@sig-ui/core` - full API surface.
- `@sig-ui/core/palette` - palette + shade ramp generation.
- `@sig-ui/core/color` - color conversions and manipulation.
- `@sig-ui/core/contrast` - APCA/WCAG contrast helpers.
- `@sig-ui/core/tokens` - DTCG token export helpers.
- `@sig-ui/core/machines` - UI state machines.
- `@sig-ui/core/typography`, `@sig-ui/core/spacing`, `@sig-ui/core/motion`, `@sig-ui/core/elevation`, `@sig-ui/core/accessibility`.

## Typical use cases

- Generate brand ramps in perceptual color space.
- Build typography/spacing/motion scales from a minimal config.
- Export token trees for design-token pipelines.
- Reuse finite-state machines for interactive UI behavior.
