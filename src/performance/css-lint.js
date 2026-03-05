// @ts-check

/**
 * SigUI core performance module for css lint.
 * @module
 */
import { classifyProperty } from "./properties.js";
/**
 * lintLayoutAnimations.
 * @param {string} css
 * @returns {CSSLintResult[]}
 */
export function lintLayoutAnimations(css) {
  const results = [];
  const lines = css.split(`
`);
  const transitionRe = /transition\s*:\s*(.+)/gi;
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : "";
    if (line.includes("sg-lint-disable no-layout-animation") || prevLine.includes("sg-lint-disable no-layout-animation"))
      continue;
    let match;
    transitionRe.lastIndex = 0;
    while ((match = transitionRe.exec(line)) !== null) {
      const value = match[1].replace(/;.*$/, "").trim();
      const parts = value.split(",");
      for (const part of parts) {
        const prop = part.trim().split(/\s+/)[0];
        if (!prop || prop === "all" || prop === "none")
          continue;
        const thread = classifyProperty(prop);
        if (thread === "layout") {
          results.push({
            rule: "no-layout-animation",
            severity: "error",
            message: `Layout-triggering property "${prop}" must not be animated (use compositor-friendly alternative)`,
            line: i + 1
          });
        }
      }
    }
  }
  return results;
}
/**
 * lintNoImport.
 * @param {string} css
 * @returns {CSSLintResult[]}
 */
export function lintNoImport(css) {
  const results = [];
  const lines = css.split(`
`);
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("@import ") || line.startsWith("@import\t")) {
      results.push({
        rule: "no-import",
        severity: "error",
        message: "@import serializes CSS loading - use <link> or bundler import instead",
        line: i + 1
      });
    }
  }
  return results;
}
/**
 * lintNoUniversalAnimation.
 * @param {string} css
 * @returns {CSSLintResult[]}
 */
export function lintNoUniversalAnimation(css) {
  const results = [];
  const lines = css.split(`
`);
  let inUniversalBlock = false;
  let braceDepth = 0;
  let universalLine = 0;
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*\*\s*\{/.test(line) || /^\s*\*\s*,/.test(line)) {
      inUniversalBlock = true;
      universalLine = i + 1;
      braceDepth = 0;
    }
    if (inUniversalBlock) {
      for (const ch of line) {
        if (ch === "{")
          braceDepth++;
        if (ch === "}")
          braceDepth--;
      }
      if (/transition\s*:/i.test(line) || /animation\s*:/i.test(line)) {
        results.push({
          rule: "no-universal-animation",
          severity: "error",
          message: "Universal selector (*) must not have transition or animation - creates per-element overhead",
          line: i + 1
        });
      }
      if (braceDepth <= 0) {
        inUniversalBlock = false;
      }
    }
  }
  return results;
}
/**
 * estimateSpecificity.
 * @param {string} selector
 * @returns {[number, number, number]}
 */
export function estimateSpecificity(selector) {
  const cleaned = selector.replace(/:(?:not|is|where|has)\(/gi, " ").replace(/\)/g, " ").replace(/\[[^\]]*\]/g, ".attr");
  let ids = 0;
  let classes = 0;
  let elements = 0;
  const idMatches = cleaned.match(/#[a-zA-Z_-]/g);
  if (idMatches)
    ids = idMatches.length;
  const classMatches = cleaned.match(/\.[a-zA-Z_-]/g);
  if (classMatches)
    classes = classMatches.length;
  const pseudoClasses = cleaned.match(/:[a-zA-Z][a-zA-Z-]*/g);
  if (pseudoClasses) {
    for (const pc of pseudoClasses) {
      if (["::before", "::after", "::first-line", "::first-letter", ":before", ":after", ":first-line", ":first-letter"].includes(pc)) {
        elements++;
      } else {
        classes++;
      }
    }
  }
  const elementMatches = cleaned.match(/(?:^|\s)[a-zA-Z][a-zA-Z0-9-]*/g);
  if (elementMatches)
    elements += elementMatches.length;
  return [ids, classes, elements];
}
/**
 * lintSelectorSpecificity.
 * @param {string} css
 * @param {readonly [number, number, number]} maxSpecificity
 * @returns {CSSLintResult[]}
 */
export function lintSelectorSpecificity(css, maxSpecificity = [0, 2, 0]) {
  const results = [];
  const lines = css.split(`
`);
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("/*") || line.startsWith("*") || line.startsWith("@") || line === "}" || line === ");")
      continue;
    if (line.includes("{")) {
      const selectorPart = line.split("{")[0].trim();
      if (!selectorPart || selectorPart.startsWith("@"))
        continue;
      const selectors = selectorPart.split(",");
      for (const sel of selectors) {
        const trimmed = sel.trim();
        if (!trimmed)
          continue;
        const [id, cls, el] = estimateSpecificity(trimmed);
        if (id > maxSpecificity[0] || id === maxSpecificity[0] && cls > maxSpecificity[1] || id === maxSpecificity[0] && cls === maxSpecificity[1] && el > maxSpecificity[2]) {
          results.push({
            rule: "max-specificity",
            severity: "warning",
            message: `Selector "${trimmed}" has specificity [${id},${cls},${el}] exceeding max [${maxSpecificity.join(",")}]`,
            line: i + 1
          });
        }
      }
    }
  }
  return results;
}
/**
 * lintCSS.
 * @param {string} css
 * @param {{ maxSpecificity?: readonly [number, number, number] }} options
 * @returns {CSSLintResult[]}
 */
export function lintCSS(css, options) {
  return [
    ...lintLayoutAnimations(css),
    ...lintNoImport(css),
    ...lintNoUniversalAnimation(css),
    ...lintSelectorSpecificity(css, options?.maxSpecificity)
  ];
}
