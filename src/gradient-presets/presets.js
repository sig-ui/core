// @ts-check

/**
 * SigUI core gradient presets module for presets.
 * @module
 */
import {
  mix,
  opacityFromIntensity,
  neutralVariants,
  defaultPositions,
  fillToArity
} from "./utils.js";
/**
 * mesh.
 * @param {{
  positions?: Position2D[];
}} params
 * @returns {PresetDefinition}
 */
export function mesh(params) {
  return {
    arity: 3,
    render(ctx) {
      const pos = fillToArity(params?.positions ?? defaultPositions(3), 3);
      const colors = ctx.neutral ? neutralVariants(ctx.colors, ctx.intensity) : ctx.colors;
      const o1 = opacityFromIntensity(ctx.intensity);
      const o2 = opacityFromIntensity(ctx.intensity, 0.75);
      const o3 = opacityFromIntensity(ctx.intensity, 0.5);
      const layers = [
        `radial-gradient(ellipse 80% 80% at ${pos[0].x}% ${pos[0].y}%, ${mix(colors[0], o1)} 0%, transparent 70%)`,
        `radial-gradient(ellipse 70% 70% at ${pos[1].x}% ${pos[1].y}%, ${mix(colors[1], o2)} 0%, transparent 70%)`,
        `radial-gradient(ellipse 60% 60% at ${pos[2].x}% ${pos[2].y}%, ${mix(colors[2], o3)} 0%, transparent 70%)`
      ];
      return {
        background: layers.join(", "),
        animation: {
          keyframes: [
            { backgroundPosition: "0% 0%, 100% 100%, 50% 50%" },
            { backgroundPosition: "30% 60%, 70% 20%, 80% 40%" },
            { backgroundPosition: "60% 30%, 40% 80%, 20% 70%" },
            { backgroundPosition: "0% 0%, 100% 100%, 50% 50%" }
          ],
          duration: 20000,
          easing: "ease-in-out"
        },
        style: {
          backgroundSize: "200% 200%"
        }
      };
    }
  };
}
/**
 * aurora.
 * @param {{
  direction?: number;
}} params
 * @returns {PresetDefinition}
 */
export function aurora(params) {
  return {
    arity: 3,
    render(ctx) {
      const dir = params?.direction ?? 135;
      const colors = ctx.neutral ? neutralVariants(ctx.colors, ctx.intensity) : ctx.colors;
      const o1 = opacityFromIntensity(ctx.intensity);
      const o2 = opacityFromIntensity(ctx.intensity, 0.75);
      const o3 = opacityFromIntensity(ctx.intensity, 0.5);
      const layers = [
        `linear-gradient(${dir}deg, ${mix(colors[0], o1)} 0%, transparent 50%)`,
        `linear-gradient(${dir + 90}deg, ${mix(colors[1], o2)} 10%, transparent 60%)`,
        `linear-gradient(${dir + 180}deg, ${mix(colors[2], o3)} 5%, transparent 55%)`
      ];
      return {
        background: layers.join(", "),
        filter: "blur(40px)",
        animation: {
          keyframes: [
            { filter: "blur(40px) hue-rotate(0deg)" },
            { filter: "blur(50px) hue-rotate(15deg)" },
            { filter: "blur(40px) hue-rotate(0deg)" }
          ],
          duration: 16000,
          easing: "ease-in-out"
        }
      };
    }
  };
}
/**
 * glow.
 * @param {{
  positions?: Position2D[];
  spread?: number;
}} params
 * @returns {PresetDefinition}
 */
export function glow(params) {
  return {
    arity: 2,
    render(ctx) {
      const spread = params?.spread ?? 1;
      const pos = fillToArity(params?.positions ?? defaultPositions(2), 2);
      const colors = ctx.neutral ? neutralVariants(ctx.colors, ctx.intensity) : ctx.colors;
      const o1 = opacityFromIntensity(ctx.intensity);
      const o2 = opacityFromIntensity(ctx.intensity, 0.5);
      const radius = Math.round(70 * spread);
      const layers = pos.map((p, i) => {
        const c = colors[i % colors.length];
        const o = i === 0 ? o1 : o2;
        return `radial-gradient(circle at ${p.x}% ${p.y}%, ${mix(c, o)} 0%, ${mix(c, o2)} ${Math.round(radius * 0.6)}%, transparent ${radius}%)`;
      });
      return {
        background: layers.join(", "),
        animation: {
          keyframes: [
            { backgroundSize: "100% 100%", opacity: 1 },
            { backgroundSize: "140% 140%", opacity: 0.7 },
            { backgroundSize: "100% 100%", opacity: 1 }
          ],
          duration: 8000,
          easing: "ease-in-out"
        }
      };
    }
  };
}
/**
 * sweep.
 * @param {{
  origin?: Position2D;
  direction?: number;
}} params
 * @returns {PresetDefinition}
 */
export function sweep(params) {
  return {
    arity: 3,
    render(ctx) {
      const origin = params?.origin ?? { x: 30, y: 70 };
      const dir = params?.direction ?? 135;
      const colors = ctx.neutral ? neutralVariants(ctx.colors, ctx.intensity) : ctx.colors;
      const o1 = opacityFromIntensity(ctx.intensity);
      const o2 = opacityFromIntensity(ctx.intensity, 0.75);
      const o3 = opacityFromIntensity(ctx.intensity, 0.5);
      const layers = [
        `radial-gradient(circle at ${origin.x}% ${origin.y}%, ${mix(colors[0], o3)} 0%, transparent 50%)`,
        `conic-gradient(from ${dir}deg at ${origin.x}% ${origin.y}%, ${mix(colors[0], o1)} 0deg, ${mix(colors[1], o2)} 90deg, transparent 180deg, ${mix(colors[2], o3)} 270deg, ${mix(colors[0], o1)} 360deg)`
      ];
      return {
        background: layers.join(", "),
        filter: "blur(30px)",
        animation: {
          keyframes: [
            { filter: "blur(30px) hue-rotate(0deg)" },
            { filter: "blur(35px) hue-rotate(20deg)" },
            { filter: "blur(30px) hue-rotate(0deg)" }
          ],
          duration: 20000,
          easing: "ease-in-out"
        }
      };
    }
  };
}
/**
 * noise.
 * @param {{
  axis?: Axis;
  scale?: number;
}} params
 * @returns {PresetDefinition}
 */
export function noise(params) {
  return {
    arity: 3,
    render(ctx) {
      const scale = params?.scale ?? 1;
      const axis = params?.axis ?? "xy";
      const colors = ctx.neutral ? neutralVariants(ctx.colors, ctx.intensity) : ctx.colors;
      const o = opacityFromIntensity(ctx.intensity, 0.5);
      const angles = axis === "x" ? [0, 15, -15, 0] : axis === "y" ? [90, 75, 105, 90] : [0, 60, 120, 180];
      const layers = angles.map((angle, i) => {
        const c = colors[i % colors.length];
        return `linear-gradient(${angle}deg, ${mix(c, o)} 0%, transparent ${Math.round(40 * scale)}%, ${mix(colors[(i + 1) % colors.length], o)} ${Math.round(80 * scale)}%, transparent 100%)`;
      });
      return {
        background: layers.join(", "),
        animation: {
          keyframes: [
            { backgroundPosition: "0% 0%, 0% 0%, 0% 0%, 0% 0%" },
            { backgroundPosition: "50% 25%, 25% 50%, 50% 75%, 75% 50%" },
            { backgroundPosition: "0% 0%, 0% 0%, 0% 0%, 0% 0%" }
          ],
          duration: 24000,
          easing: "ease-in-out"
        },
        style: {
          backgroundSize: "200% 200%"
        }
      };
    }
  };
}
/**
 * definePreset.
 * @param {PresetDefinition} def
 * @returns {PresetDefinition}
 */
export function definePreset(def) {
  return def;
}
const BUILT_IN_FACTORIES = {
  mesh,
  aurora,
  glow,
  sweep,
  noise
};
/**
 * resolvePreset.
 * @param {string | PresetDefinition} preset
 * @returns {PresetDefinition}
 */
export function resolvePreset(preset) {
  if (typeof preset === "object")
    return preset;
  const factory = BUILT_IN_FACTORIES[preset];
  if (!factory)
    throw new Error(`Unknown gradient preset: "${preset}"`);
  return factory();
}
