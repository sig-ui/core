# @sig-ui/core

Foundation package for SigUI.
Includes color science, token utilities, typography and spacing math, motion helpers, accessibility helpers, and UI state machines.

## Install

```bash
bun add @sig-ui/core
```

## Quick start

```js
import { generatePalette } from "@sig-ui/core/palette";
import { apcaContrast } from "@sig-ui/core/contrast";

const palette = generatePalette("#6366f1", { background: "#ffffff" });
const primary500 = palette.formatted[500];
const textLc = Math.abs(apcaContrast(palette.ramp[900], "#ffffff"));

console.log({ primary500, textLc });
```

## Entry points

- `@sig-ui/core`: full API
- `@sig-ui/core/color`: color parse, convert, and manipulation helpers
- `@sig-ui/core/contrast`: APCA and WCAG contrast helpers
- `@sig-ui/core/palette`: shade ramp and palette generation
- `@sig-ui/core/tokens`: DTCG token export helpers
- `@sig-ui/core/machines`: finite-state machines for interactive UI
- `@sig-ui/core/typography`, `@sig-ui/core/spacing`, `@sig-ui/core/motion`, `@sig-ui/core/elevation`, `@sig-ui/core/accessibility`

## Common uses

- Generate perceptual palettes from a brand color
- Compute accessible spacing and typography systems
- Export token structures for design-token pipelines
- Reuse tested interaction state machines in custom UI
