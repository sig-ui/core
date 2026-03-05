// @ts-check

/**
 * SigUI core spacing module for layout audit.
 * @module
 */
import { validateProximityHierarchy } from "./relationship.js";
/**
 * computeLayoutBalance.
 * @param {readonly LayoutElement[]} elements
 * @param {{ readonly width: number; readonly height: number }} container
 * @returns {LayoutBalanceResult}
 */
export function computeLayoutBalance(elements, container) {
  const cx = container.width / 2;
  const cy = container.height / 2;
  const containerCenter = { x: cx, y: cy };
  if (elements.length === 0) {
    return { score: 0, centroid: { x: cx, y: cy }, containerCenter, distance: 0 };
  }
  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;
  for (const el of elements) {
    const area = el.width * el.height;
    const w = area * (el.weight ?? 1);
    weightedX += (el.x + el.width / 2) * w;
    weightedY += (el.y + el.height / 2) * w;
    totalWeight += w;
  }
  if (totalWeight === 0) {
    return { score: 0, centroid: { x: cx, y: cy }, containerCenter, distance: 0 };
  }
  const centroid = { x: weightedX / totalWeight, y: weightedY / totalWeight };
  const dx = centroid.x - cx;
  const dy = centroid.y - cy;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const maxDistance = Math.sqrt(cx * cx + cy * cy);
  const score = maxDistance > 0 ? Math.min(distance / maxDistance, 1) : 0;
  return { score, centroid, containerCenter, distance };
}
/**
 * buildTokenMap.
 * @param {string} css
 * @returns {TokenMap}
 */
export function buildTokenMap(css) {
  const raw = new Map;
  const lines = css.split(`
`);
  let inRoot = false;
  let braceDepth = 0;
  let rootDepth = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^:root\s*\{/.test(trimmed) || /^:root\s*,/.test(trimmed)) {
      inRoot = true;
      rootDepth = braceDepth;
    }
    for (const ch of trimmed) {
      if (ch === "{")
        braceDepth++;
      if (ch === "}") {
        braceDepth--;
        if (inRoot && braceDepth <= rootDepth) {
          inRoot = false;
        }
      }
    }
    if (inRoot) {
      const declMatch = trimmed.match(/^(--[\w-]+)\s*:\s*(.+?)\s*;?\s*$/);
      if (declMatch) {
        raw.set(declMatch[1], declMatch[2]);
      }
    }
  }
  const resolved = new Map;
  for (const [prop, value] of raw) {
    const px = resolveRawToPx(value, raw, 0);
    if (px !== null) {
      resolved.set(prop, px);
    }
  }
  return resolved;
}
function resolveRawToPx(value, raw, depth) {
  if (depth > 3)
    return null;
  const trimmed = value.trim();
  const pxMatch = trimmed.match(/^(-?[\d.]+)px$/);
  if (pxMatch)
    return parseFloat(pxMatch[1]);
  const remMatch = trimmed.match(/^(-?[\d.]+)rem$/);
  if (remMatch)
    return parseFloat(remMatch[1]) * 16;
  if (trimmed === "0")
    return 0;
  const varMatch = trimmed.match(/^var\(\s*(--[\w-]+)(?:\s*,\s*(.+))?\s*\)$/);
  if (varMatch) {
    const ref = raw.get(varMatch[1]);
    if (ref !== undefined) {
      return resolveRawToPx(ref, raw, depth + 1);
    }
    if (varMatch[2]) {
      return resolveRawToPx(varMatch[2], raw, depth + 1);
    }
    return null;
  }
  const calcMatch = trimmed.match(/^calc\(\s*(-?[\d.]+)\s*\*\s*var\(\s*(--[\w-]+)\s*\)\s*\)$/);
  if (calcMatch) {
    const multiplier = parseFloat(calcMatch[1]);
    const ref = raw.get(calcMatch[2]);
    if (ref !== undefined) {
      const base = resolveRawToPx(ref, raw, depth + 1);
      if (base !== null)
        return multiplier * base;
    }
    return null;
  }
  const calcMatch2 = trimmed.match(/^calc\(\s*var\(\s*(--[\w-]+)\s*\)\s*\*\s*(-?[\d.]+)\s*\)$/);
  if (calcMatch2) {
    const ref = raw.get(calcMatch2[1]);
    const multiplier = parseFloat(calcMatch2[2]);
    if (ref !== undefined) {
      const base = resolveRawToPx(ref, raw, depth + 1);
      if (base !== null)
        return base * multiplier;
    }
    return null;
  }
  return null;
}
/**
 * parseCSSBlocks.
 * @param {string} css
 * @returns {CSSBlock[]}
 */
export function parseCSSBlocks(css) {
  const blocks = [];
  const lines = css.split(`
`);
  const tokenMap = buildTokenMap(css);
  let currentLayer = null;
  const layerStack = [];
  let braceDepth = 0;
  let currentSelector = null;
  let currentDeclarations = [];
  let blockStartLine = 0;
  let selectorDepth = 0;
  for (let i = 0;i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith("/*") || trimmed.startsWith("*"))
      continue;
    const layerMatch = trimmed.match(/^@layer\s+([\w.]+)\s*\{/);
    if (layerMatch) {
      layerStack.push(currentLayer);
      currentLayer = layerMatch[1];
      braceDepth++;
      continue;
    }
    if (trimmed.startsWith("@") && trimmed.includes("{")) {
      braceDepth++;
      continue;
    }
    if (trimmed.includes("{") && !trimmed.startsWith("@")) {
      const selector = trimmed.split("{")[0].trim();
      if (selector && currentSelector === null) {
        currentSelector = selector;
        currentDeclarations = [];
        blockStartLine = i + 1;
        selectorDepth = braceDepth;
      }
      braceDepth++;
      continue;
    }
    if (currentSelector !== null && trimmed.includes(":") && !trimmed.startsWith("}")) {
      const declMatch = trimmed.match(/^([\w-]+)\s*:\s*(.+?)\s*;?\s*$/);
      if (declMatch) {
        currentDeclarations.push({
          property: declMatch[1],
          rawValue: declMatch[2],
          resolvedPx: resolveValueToPx(declMatch[2], tokenMap),
          line: i + 1
        });
      }
    }
    if (trimmed.includes("}")) {
      const closeCount = (trimmed.match(/}/g) || []).length;
      for (let c = 0;c < closeCount; c++) {
        braceDepth--;
        if (currentSelector !== null && braceDepth <= selectorDepth) {
          blocks.push({
            selector: currentSelector,
            layer: currentLayer,
            declarations: currentDeclarations,
            startLine: blockStartLine
          });
          currentSelector = null;
          currentDeclarations = [];
        }
        if (layerStack.length > 0 && braceDepth < layerStack.length) {
          currentLayer = layerStack.pop() ?? null;
        }
      }
    }
  }
  return blocks;
}
/**
 * resolveValueToPx.
 * @param {string} value
 * @param {TokenMap} tokenMap
 * @returns {number | null}
 */
export function resolveValueToPx(value, tokenMap) {
  const trimmed = value.trim();
  const pxMatch = trimmed.match(/^(-?[\d.]+)px$/);
  if (pxMatch)
    return parseFloat(pxMatch[1]);
  const remMatch = trimmed.match(/^(-?[\d.]+)rem$/);
  if (remMatch)
    return parseFloat(remMatch[1]) * 16;
  if (trimmed === "0")
    return 0;
  const varMatch = trimmed.match(/^var\(\s*(--[\w-]+)(?:\s*,\s*(.+))?\s*\)$/);
  if (varMatch) {
    const resolved = tokenMap.get(varMatch[1]);
    if (resolved !== undefined)
      return resolved;
    if (varMatch[2])
      return resolveValueToPx(varMatch[2], tokenMap);
    return null;
  }
  const calcMatch = trimmed.match(/^calc\(\s*(-?[\d.]+)\s*\*\s*var\(\s*(--[\w-]+)\s*\)\s*\)$/);
  if (calcMatch) {
    const multiplier = parseFloat(calcMatch[1]);
    const base = tokenMap.get(calcMatch[2]);
    if (base !== undefined)
      return multiplier * base;
    return null;
  }
  const calcMatch2 = trimmed.match(/^calc\(\s*var\(\s*(--[\w-]+)\s*\)\s*\*\s*(-?[\d.]+)\s*\)$/);
  if (calcMatch2) {
    const base = tokenMap.get(calcMatch2[1]);
    const multiplier = parseFloat(calcMatch2[2]);
    if (base !== undefined)
      return base * multiplier;
    return null;
  }
  return null;
}
const INNER_SPACING_PROPS = new Set([
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "padding-inline",
  "padding-inline-start",
  "padding-inline-end",
  "padding-block",
  "padding-block-start",
  "padding-block-end",
  "gap",
  "row-gap",
  "column-gap"
]);
const OUTER_SPACING_PROPS = new Set([
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "margin-inline",
  "margin-inline-start",
  "margin-inline-end",
  "margin-block",
  "margin-block-start",
  "margin-block-end"
]);
/**
 * auditProximityHierarchy.
 * @param {readonly CSSBlock[]} blocks
 * @param {TokenMap} _tokenMap
 * @returns {LayoutAuditResult[]}
 */
export function auditProximityHierarchy(blocks, _tokenMap) {
  const results = [];
  for (const block of blocks) {
    const innerValues = [];
    const outerValues = [];
    for (const decl of block.declarations) {
      if (decl.resolvedPx === null || decl.resolvedPx === 0)
        continue;
      if (INNER_SPACING_PROPS.has(decl.property)) {
        innerValues.push(decl.resolvedPx);
      } else if (OUTER_SPACING_PROPS.has(decl.property)) {
        outerValues.push(Math.abs(decl.resolvedPx));
      }
    }
    if (innerValues.length === 0 || outerValues.length === 0)
      continue;
    const maxInner = Math.max(...innerValues);
    const minOuter = Math.min(...outerValues);
    if (!validateProximityHierarchy(maxInner, minOuter)) {
      results.push({
        rule: "proximity-hierarchy",
        severity: "warning",
        message: `Inner spacing (${maxInner}px) >= outer spacing (${minOuter}px) – violates Gestalt proximity hierarchy`,
        line: block.startLine,
        selector: block.selector
      });
    }
  }
  return results;
}
/**
 * auditRhythmRegularity.
 * @param {readonly CSSBlock[]} blocks
 * @param {TokenMap} _tokenMap
 * @returns {LayoutAuditResult[]}
 */
export function auditRhythmRegularity(blocks, _tokenMap) {
  const results = [];
  const gapValues = [];
  const GAP_PROPS = new Set(["gap", "row-gap", "column-gap"]);
  for (const block of blocks) {
    for (const decl of block.declarations) {
      if (GAP_PROPS.has(decl.property) && decl.resolvedPx !== null && decl.resolvedPx > 0) {
        gapValues.push({
          px: decl.resolvedPx,
          line: decl.line,
          selector: block.selector
        });
      }
    }
  }
  if (gapValues.length < 2)
    return results;
  const values = gapValues.map((g) => g.px);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 0;
  if (cv > 0.5) {
    results.push({
      rule: "rhythm-regularity",
      severity: "warning",
      message: `Gap values have high variability (CV=${cv.toFixed(2)}). Use fewer distinct gap values for consistent rhythm.`
    });
  }
  const uniqueGaps = [...new Set(values)].sort((a, b) => a - b);
  for (let i = 1;i < uniqueGaps.length; i++) {
    const smaller = uniqueGaps[i - 1];
    const larger = uniqueGaps[i];
    if (smaller > 0) {
      const ratio = (larger - smaller) / smaller;
      if (ratio < 0.15) {
        results.push({
          rule: "rhythm-weber",
          severity: "warning",
          message: `Gap values ${smaller}px and ${larger}px differ by only ${(ratio * 100).toFixed(1)}% – below Weber JND threshold (15%). Users cannot perceive this difference; merge to a single token.`
        });
      }
    }
  }
  const SCALE_STEPS = [0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];
  for (let i = 1;i < uniqueGaps.length; i++) {
    const prev = uniqueGaps[i - 1];
    const curr = uniqueGaps[i];
    const prevIdx = findNearestScaleIndex(prev, SCALE_STEPS);
    const currIdx = findNearestScaleIndex(curr, SCALE_STEPS);
    if (currIdx - prevIdx > 2) {
      results.push({
        rule: "rhythm-scale-skip",
        severity: "warning",
        message: `Gap values ${prev}px and ${curr}px skip ${currIdx - prevIdx - 1} scale steps. Prefer adjacent or near-adjacent scale tokens.`
      });
    }
  }
  return results;
}
function findNearestScaleIndex(value, scale) {
  let best = 0;
  let bestDist = Math.abs(value - scale[0]);
  for (let i = 1;i < scale.length; i++) {
    const dist = Math.abs(value - scale[i]);
    if (dist < bestDist) {
      best = i;
      bestDist = dist;
    }
  }
  return best;
}
const NON_PROSE_PATTERNS = [
  /^:root$/,
  /^html$/,
  /^body$/,
  /button/i,
  /input/i,
  /select/i,
  /textarea/i,
  /badge/i,
  /nav/i,
  /sidebar/i,
  /toolbar/i,
  /tab/i,
  /switch/i,
  /toggle/i,
  /checkbox/i,
  /radio/i,
  /slider/i,
  /menu/i,
  /tooltip/i,
  /toast/i,
  /alert/i,
  /dialog/i,
  /modal/i,
  /kbd/i,
  /code/i,
  /avatar/i,
  /icon/i,
  /spinner/i,
  /skeleton/i,
  /progress/i,
  /breadcrumb/i,
  /pagination/i,
  /chip/i,
  /tag/i,
  /header/i,
  /footer/i
];
/**
 * auditLineMeasure.
 * @param {readonly CSSBlock[]} blocks
 * @param {TokenMap} tokenMap
 * @returns {LayoutAuditResult[]}
 */
export function auditLineMeasure(blocks, tokenMap) {
  const results = [];
  const TYPOGRAPHY_PATTERNS = [
    /--sg-text-/,
    /--sg-leading-/,
    /--sg-font-/,
    /font-size/,
    /line-height/
  ];
  for (const block of blocks) {
    if (NON_PROSE_PATTERNS.some((p) => p.test(block.selector)))
      continue;
    const hasTypography = block.declarations.some((d) => TYPOGRAPHY_PATTERNS.some((p) => p.test(d.rawValue) || p.test(d.property)));
    if (!hasTypography)
      continue;
    const maxWidthDecl = block.declarations.find((d) => d.property === "max-width" || d.property === "max-inline-size");
    if (!maxWidthDecl) {
      results.push({
        rule: "line-measure",
        severity: "warning",
        message: "Typography block missing max-width/max-inline-size for readable line measure (45–75ch recommended)",
        line: block.startLine,
        selector: block.selector
      });
      continue;
    }
    const chMatch = maxWidthDecl.rawValue.match(/^(\d+(?:\.\d+)?)ch$/);
    if (chMatch) {
      const ch = parseFloat(chMatch[1]);
      if (ch < 45 || ch > 75) {
        results.push({
          rule: "line-measure",
          severity: "warning",
          message: `Line measure ${ch}ch is outside optimal 45–75ch range`,
          line: maxWidthDecl.line,
          selector: block.selector
        });
      }
    }
  }
  return results;
}
const INTERACTIVE_PATTERNS = [
  /button/i,
  /\.sg-button/i,
  /\binput\b/i,
  /\bselect\b/i,
  /\btextarea\b/i,
  /\[role="button"\]/i,
  /\[role="tab"\]/i,
  /\[role="menuitem"\]/i,
  /\[role="link"\]/i,
  /\[role="option"\]/i,
  /\[role="switch"\]/i,
  /\[role="checkbox"\]/i,
  /\[role="radio"\]/i,
  /\.sg-switch/i,
  /\.sg-toggle/i,
  /\.sg-checkbox/i,
  /\.sg-radio/i,
  /\.sg-select/i,
  /\.sg-tab/i,
  /\.sg-menu-item/i,
  /a\[/i,
  /a\./,
  /a:/
];
const TOUCH_TOKEN_RE = /--sg-touch-/;
/**
 * auditTouchTargets.
 * @param {readonly CSSBlock[]} blocks
 * @param {TokenMap} _tokenMap
 * @returns {LayoutAuditResult[]}
 */
export function auditTouchTargets(blocks, _tokenMap) {
  const results = [];
  for (const block of blocks) {
    const isInteractive = INTERACTIVE_PATTERNS.some((p) => p.test(block.selector));
    if (!isInteractive)
      continue;
    const usesTouchToken = block.declarations.some((d) => TOUCH_TOKEN_RE.test(d.rawValue));
    if (usesTouchToken)
      continue;
    const minHeightDecl = block.declarations.find((d) => d.property === "min-height" || d.property === "min-block-size");
    const heightDecl = block.declarations.find((d) => d.property === "height" || d.property === "block-size");
    const effectiveHeight = minHeightDecl?.resolvedPx ?? heightDecl?.resolvedPx ?? null;
    if (effectiveHeight === null || effectiveHeight < 44) {
      results.push({
        rule: "touch-target",
        severity: "warning",
        message: `Interactive element missing min-height >= 44px (has ${effectiveHeight !== null ? effectiveHeight + "px" : "none"}). Use --sg-touch-* tokens or set explicit min-height.`,
        line: block.startLine,
        selector: block.selector
      });
    }
  }
  return results;
}
function extractComponentName(selector) {
  const match = selector.match(/\.sg-(\w+)/);
  return match ? match[1] : null;
}
const LEFT_EDGE_PROPS = new Set([
  "padding-left",
  "padding-inline-start",
  "margin-left",
  "margin-inline-start"
]);
/**
 * auditAlignmentConsistency.
 * @param {readonly CSSBlock[]} blocks
 * @param {TokenMap} _tokenMap
 * @returns {LayoutAuditResult[]}
 */
export function auditAlignmentConsistency(blocks, _tokenMap) {
  const results = [];
  const componentEdges = new Map;
  for (const block of blocks) {
    const name = extractComponentName(block.selector);
    if (!name)
      continue;
    for (const decl of block.declarations) {
      if (LEFT_EDGE_PROPS.has(decl.property) && decl.resolvedPx !== null) {
        let edges = componentEdges.get(name);
        if (!edges) {
          edges = new Set;
          componentEdges.set(name, edges);
        }
        edges.add(decl.resolvedPx);
      }
    }
  }
  for (const [name, edges] of componentEdges) {
    if (edges.size > 3) {
      results.push({
        rule: "alignment-consistency",
        severity: "warning",
        message: `Component ".sg-${name}" has ${edges.size} distinct left-edge values (${[...edges].sort((a, b) => a - b).join(", ")}px). Reduce to ≤3 for consistent alignment.`
      });
    }
  }
  return results;
}
const ALL_SPACING_PROPS = new Set([
  ...INNER_SPACING_PROPS,
  ...OUTER_SPACING_PROPS
]);
const CLUTTER_THRESHOLD = 5;
/**
 * auditSpacingClutter.
 * @param {readonly CSSBlock[]} blocks
 * @param {TokenMap} _tokenMap
 * @returns {LayoutAuditResult[]}
 */
export function auditSpacingClutter(blocks, _tokenMap) {
  const results = [];
  const componentValues = new Map;
  for (const block of blocks) {
    const name = extractComponentName(block.selector);
    if (!name)
      continue;
    for (const decl of block.declarations) {
      if (ALL_SPACING_PROPS.has(decl.property) && decl.resolvedPx !== null && decl.resolvedPx !== 0) {
        let values = componentValues.get(name);
        if (!values) {
          values = new Set;
          componentValues.set(name, values);
        }
        values.add(Math.abs(decl.resolvedPx));
      }
    }
  }
  for (const [name, values] of componentValues) {
    if (values.size > CLUTTER_THRESHOLD) {
      results.push({
        rule: "spacing-clutter",
        severity: "warning",
        message: `Component ".sg-${name}" uses ${values.size} distinct spacing values (${[...values].sort((a, b) => a - b).join(", ")}px). Reduce to ≤${CLUTTER_THRESHOLD} for visual clarity.`
      });
    }
  }
  return results;
}
/**
 * auditLayout.
 * @param {string} css
 * @returns {LayoutAuditResult[]}
 */
export function auditLayout(css) {
  const tokenMap = buildTokenMap(css);
  const blocks = parseCSSBlocks(css);
  return [
    ...auditProximityHierarchy(blocks, tokenMap),
    ...auditRhythmRegularity(blocks, tokenMap),
    ...auditLineMeasure(blocks, tokenMap),
    ...auditTouchTargets(blocks, tokenMap),
    ...auditAlignmentConsistency(blocks, tokenMap),
    ...auditSpacingClutter(blocks, tokenMap)
  ];
}
