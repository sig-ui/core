// @ts-check

/**
 * Repository module for layout audit.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  buildTokenMap,
  parseCSSBlocks,
  resolveValueToPx,
  auditProximityHierarchy,
  auditRhythmRegularity,
  auditLineMeasure,
  auditTouchTargets,
  auditAlignmentConsistency,
  auditSpacingClutter,
  auditLayout,
  computeLayoutBalance
} from "../src/spacing/layout-audit.js";
describe("buildTokenMap", () => {
  test("extracts px values from :root", () => {
    const css = `:root {
  --sg-space-1: 4px;
  --sg-space-2: 8px;
  --sg-space-4: 16px;
}`;
    const map = buildTokenMap(css);
    expect(map.get("--sg-space-1")).toBe(4);
    expect(map.get("--sg-space-2")).toBe(8);
    expect(map.get("--sg-space-4")).toBe(16);
  });
  test("extracts rem values (×16)", () => {
    const css = `:root {
  --sg-text-base: 1rem;
  --sg-text-lg: 1.125rem;
}`;
    const map = buildTokenMap(css);
    expect(map.get("--sg-text-base")).toBe(16);
    expect(map.get("--sg-text-lg")).toBe(18);
  });
  test("resolves var() chains (1 level)", () => {
    const css = `:root {
  --sg-space-base: 4px;
  --sg-space-inner: var(--sg-space-base);
}`;
    const map = buildTokenMap(css);
    expect(map.get("--sg-space-inner")).toBe(4);
  });
  test("resolves var() chains (2 levels)", () => {
    const css = `:root {
  --a: 8px;
  --b: var(--a);
  --c: var(--b);
}`;
    const map = buildTokenMap(css);
    expect(map.get("--c")).toBe(8);
  });
  test("resolves var() chains (3 levels)", () => {
    const css = `:root {
  --a: 16px;
  --b: var(--a);
  --c: var(--b);
  --d: var(--c);
}`;
    const map = buildTokenMap(css);
    expect(map.get("--d")).toBe(16);
  });
  test("returns null for chains deeper than 3", () => {
    const css = `:root {
  --a: 16px;
  --b: var(--a);
  --c: var(--b);
  --d: var(--c);
  --e: var(--d);
}`;
    const map = buildTokenMap(css);
    expect(map.has("--e")).toBe(false);
  });
  test("ignores non-root blocks", () => {
    const css = `.button {
  --sg-space-1: 4px;
}`;
    const map = buildTokenMap(css);
    expect(map.size).toBe(0);
  });
  test("handles zero value", () => {
    const css = `:root {
  --sg-space-0: 0;
}`;
    const map = buildTokenMap(css);
    expect(map.get("--sg-space-0")).toBe(0);
  });
  test("handles var() with fallback", () => {
    const css = `:root {
  --sg-space-fallback: var(--does-not-exist, 12px);
}`;
    const map = buildTokenMap(css);
    expect(map.get("--sg-space-fallback")).toBe(12);
  });
  test("skips unresolvable values like % or vw", () => {
    const css = `:root {
  --sg-width: 100%;
  --sg-height: 50vw;
  --sg-color: #ff0000;
}`;
    const map = buildTokenMap(css);
    expect(map.has("--sg-width")).toBe(false);
    expect(map.has("--sg-height")).toBe(false);
    expect(map.has("--sg-color")).toBe(false);
  });
});
describe("resolveValueToPx", () => {
  const tokens = new Map([
    ["--sg-space-1", 4],
    ["--sg-space-2", 8],
    ["--sg-space-4", 16]
  ]);
  test("resolves literal px", () => {
    expect(resolveValueToPx("44px", tokens)).toBe(44);
  });
  test("resolves literal rem", () => {
    expect(resolveValueToPx("1.5rem", tokens)).toBe(24);
  });
  test("resolves 0", () => {
    expect(resolveValueToPx("0", tokens)).toBe(0);
  });
  test("resolves var() from token map", () => {
    expect(resolveValueToPx("var(--sg-space-1)", tokens)).toBe(4);
    expect(resolveValueToPx("var(--sg-space-4)", tokens)).toBe(16);
  });
  test("resolves var() with fallback when token missing", () => {
    expect(resolveValueToPx("var(--missing, 20px)", tokens)).toBe(20);
  });
  test("prefers token over fallback", () => {
    expect(resolveValueToPx("var(--sg-space-2, 999px)", tokens)).toBe(8);
  });
  test("resolves calc(N * var(--name))", () => {
    expect(resolveValueToPx("calc(2 * var(--sg-space-1))", tokens)).toBe(8);
    expect(resolveValueToPx("calc(1.5 * var(--sg-space-4))", tokens)).toBe(24);
  });
  test("resolves calc(var(--name) * N)", () => {
    expect(resolveValueToPx("calc(var(--sg-space-2) * 3)", tokens)).toBe(24);
  });
  test("returns null for percentage", () => {
    expect(resolveValueToPx("100%", tokens)).toBeNull();
  });
  test("returns null for vw", () => {
    expect(resolveValueToPx("50vw", tokens)).toBeNull();
  });
  test("returns null for missing var", () => {
    expect(resolveValueToPx("var(--missing)", tokens)).toBeNull();
  });
  test("returns null for complex calc", () => {
    expect(resolveValueToPx("calc(100% - 20px)", tokens)).toBeNull();
  });
  test("handles negative px", () => {
    expect(resolveValueToPx("-8px", tokens)).toBe(-8);
  });
  test("handles decimal px", () => {
    expect(resolveValueToPx("0.5px", tokens)).toBe(0.5);
  });
});
describe("parseCSSBlocks", () => {
  test("parses a simple block", () => {
    const css = `.button {
  padding: 8px;
  margin: 16px;
}`;
    const blocks = parseCSSBlocks(css);
    expect(blocks.length).toBe(1);
    expect(blocks[0].selector).toBe(".button");
    expect(blocks[0].declarations.length).toBe(2);
    expect(blocks[0].declarations[0].property).toBe("padding");
    expect(blocks[0].declarations[0].resolvedPx).toBe(8);
    expect(blocks[0].declarations[1].property).toBe("margin");
    expect(blocks[0].declarations[1].resolvedPx).toBe(16);
  });
  test("tracks @layer context", () => {
    const css = `@layer sigui.base {
  .card {
    padding: 16px;
  }
}`;
    const blocks = parseCSSBlocks(css);
    expect(blocks.length).toBe(1);
    expect(blocks[0].layer).toBe("sigui.base");
    expect(blocks[0].selector).toBe(".card");
  });
  test("parses multiple blocks", () => {
    const css = `.a {
  padding: 4px;
}
.b {
  margin: 8px;
}`;
    const blocks = parseCSSBlocks(css);
    expect(blocks.length).toBe(2);
    expect(blocks[0].selector).toBe(".a");
    expect(blocks[1].selector).toBe(".b");
  });
  test("resolves declarations against :root tokens", () => {
    const css = `:root {
  --sg-space-4: 16px;
}
.card {
  padding: var(--sg-space-4);
}`;
    const blocks = parseCSSBlocks(css);
    const card = blocks.find((b) => b.selector === ".card");
    expect(card).toBeDefined();
    expect(card.declarations[0].resolvedPx).toBe(16);
  });
  test("handles null layer outside @layer", () => {
    const css = `.standalone {
  gap: 12px;
}`;
    const blocks = parseCSSBlocks(css);
    expect(blocks[0].layer).toBeNull();
  });
  test("records correct line numbers", () => {
    const css = `
.first {
  padding: 4px;
}
.second {
  margin: 8px;
}`;
    const blocks = parseCSSBlocks(css);
    expect(blocks[0].startLine).toBe(2);
    expect(blocks[1].startLine).toBe(5);
  });
});
describe("auditProximityHierarchy", () => {
  const emptyMap = new Map;
  test("no issue when outer > inner", () => {
    const blocks = [{
      selector: ".card",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "padding", rawValue: "8px", resolvedPx: 8, line: 2 },
        { property: "margin", rawValue: "16px", resolvedPx: 16, line: 3 }
      ]
    }];
    expect(auditProximityHierarchy(blocks, emptyMap)).toHaveLength(0);
  });
  test("flags when inner >= outer", () => {
    const blocks = [{
      selector: ".card",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "padding", rawValue: "24px", resolvedPx: 24, line: 2 },
        { property: "margin", rawValue: "16px", resolvedPx: 16, line: 3 }
      ]
    }];
    const results = auditProximityHierarchy(blocks, emptyMap);
    expect(results.length).toBe(1);
    expect(results[0].rule).toBe("proximity-hierarchy");
    expect(results[0].selector).toBe(".card");
  });
  test("flags when inner == outer", () => {
    const blocks = [{
      selector: ".card",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "gap", rawValue: "16px", resolvedPx: 16, line: 2 },
        { property: "margin-bottom", rawValue: "16px", resolvedPx: 16, line: 3 }
      ]
    }];
    const results = auditProximityHierarchy(blocks, emptyMap);
    expect(results.length).toBe(1);
  });
  test("skips blocks with only inner or only outer spacing", () => {
    const blocks = [{
      selector: ".inner-only",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "padding", rawValue: "16px", resolvedPx: 16, line: 2 }
      ]
    }];
    expect(auditProximityHierarchy(blocks, emptyMap)).toHaveLength(0);
  });
  test("ignores zero-value spacing", () => {
    const blocks = [{
      selector: ".card",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "padding", rawValue: "0", resolvedPx: 0, line: 2 },
        { property: "margin", rawValue: "16px", resolvedPx: 16, line: 3 }
      ]
    }];
    expect(auditProximityHierarchy(blocks, emptyMap)).toHaveLength(0);
  });
  test("uses absolute value for negative margins", () => {
    const blocks = [{
      selector: ".overlap",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "padding", rawValue: "8px", resolvedPx: 8, line: 2 },
        { property: "margin-top", rawValue: "-4px", resolvedPx: -4, line: 3 }
      ]
    }];
    const results = auditProximityHierarchy(blocks, emptyMap);
    expect(results.length).toBe(1);
  });
  test("compares max inner vs min outer", () => {
    const blocks = [{
      selector: ".card",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "padding", rawValue: "8px", resolvedPx: 8, line: 2 },
        { property: "gap", rawValue: "4px", resolvedPx: 4, line: 3 },
        { property: "margin-top", rawValue: "24px", resolvedPx: 24, line: 4 },
        { property: "margin-bottom", rawValue: "12px", resolvedPx: 12, line: 5 }
      ]
    }];
    expect(auditProximityHierarchy(blocks, emptyMap)).toHaveLength(0);
  });
});
describe("auditRhythmRegularity", () => {
  const emptyMap = new Map;
  test("no issue with consistent gap values", () => {
    const blocks = [
      {
        selector: ".a",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "gap", rawValue: "16px", resolvedPx: 16, line: 2 }
        ]
      },
      {
        selector: ".b",
        layer: null,
        startLine: 3,
        declarations: [
          { property: "gap", rawValue: "16px", resolvedPx: 16, line: 4 }
        ]
      }
    ];
    const results = auditRhythmRegularity(blocks, emptyMap);
    expect(results.filter((r) => r.rule === "rhythm-regularity")).toHaveLength(0);
  });
  test("flags high variability (CV > 0.5)", () => {
    const blocks = [
      {
        selector: ".a",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "gap", rawValue: "4px", resolvedPx: 4, line: 2 }
        ]
      },
      {
        selector: ".b",
        layer: null,
        startLine: 3,
        declarations: [
          { property: "gap", rawValue: "64px", resolvedPx: 64, line: 4 }
        ]
      }
    ];
    const results = auditRhythmRegularity(blocks, emptyMap);
    expect(results.some((r) => r.rule === "rhythm-regularity")).toBe(true);
  });
  test("flags scale step skips > 2", () => {
    const blocks = [
      {
        selector: ".a",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "gap", rawValue: "4px", resolvedPx: 4, line: 2 }
        ]
      },
      {
        selector: ".b",
        layer: null,
        startLine: 3,
        declarations: [
          { property: "gap", rawValue: "48px", resolvedPx: 48, line: 4 }
        ]
      }
    ];
    const results = auditRhythmRegularity(blocks, emptyMap);
    expect(results.some((r) => r.rule === "rhythm-scale-skip")).toBe(true);
  });
  test("no skip warning for adjacent scale steps", () => {
    const blocks = [
      {
        selector: ".a",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "gap", rawValue: "8px", resolvedPx: 8, line: 2 }
        ]
      },
      {
        selector: ".b",
        layer: null,
        startLine: 3,
        declarations: [
          { property: "gap", rawValue: "12px", resolvedPx: 12, line: 4 }
        ]
      }
    ];
    const results = auditRhythmRegularity(blocks, emptyMap);
    expect(results.filter((r) => r.rule === "rhythm-scale-skip")).toHaveLength(0);
  });
  test("skips with fewer than 2 gap values", () => {
    const blocks = [{
      selector: ".a",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "gap", rawValue: "16px", resolvedPx: 16, line: 2 }
      ]
    }];
    expect(auditRhythmRegularity(blocks, emptyMap)).toHaveLength(0);
  });
  test("includes row-gap and column-gap", () => {
    const blocks = [
      {
        selector: ".grid",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "row-gap", rawValue: "4px", resolvedPx: 4, line: 2 },
          { property: "column-gap", rawValue: "64px", resolvedPx: 64, line: 3 }
        ]
      }
    ];
    const results = auditRhythmRegularity(blocks, emptyMap);
    expect(results.length).toBeGreaterThan(0);
  });
  test("flags Weber-indistinct gap values (<15% apart)", () => {
    const blocks = [
      {
        selector: ".a",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "gap", rawValue: "16px", resolvedPx: 16, line: 2 }
        ]
      },
      {
        selector: ".b",
        layer: null,
        startLine: 3,
        declarations: [
          { property: "gap", rawValue: "17px", resolvedPx: 17, line: 4 }
        ]
      }
    ];
    const results = auditRhythmRegularity(blocks, emptyMap);
    expect(results.some((r) => r.rule === "rhythm-weber")).toBe(true);
  });
  test("no Weber warning for values >=15% apart", () => {
    const blocks = [
      {
        selector: ".a",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "gap", rawValue: "16px", resolvedPx: 16, line: 2 }
        ]
      },
      {
        selector: ".b",
        layer: null,
        startLine: 3,
        declarations: [
          { property: "gap", rawValue: "20px", resolvedPx: 20, line: 4 }
        ]
      }
    ];
    const results = auditRhythmRegularity(blocks, emptyMap);
    expect(results.filter((r) => r.rule === "rhythm-weber")).toHaveLength(0);
  });
  test("Weber check handles exact 15% boundary", () => {
    const blocks = [
      {
        selector: ".a",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "gap", rawValue: "20px", resolvedPx: 20, line: 2 }
        ]
      },
      {
        selector: ".b",
        layer: null,
        startLine: 3,
        declarations: [
          { property: "gap", rawValue: "23px", resolvedPx: 23, line: 4 }
        ]
      }
    ];
    const results = auditRhythmRegularity(blocks, emptyMap);
    expect(results.filter((r) => r.rule === "rhythm-weber")).toHaveLength(0);
  });
  test("ignores zero gap values", () => {
    const blocks = [
      {
        selector: ".a",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "gap", rawValue: "0", resolvedPx: 0, line: 2 }
        ]
      },
      {
        selector: ".b",
        layer: null,
        startLine: 3,
        declarations: [
          { property: "gap", rawValue: "16px", resolvedPx: 16, line: 4 }
        ]
      }
    ];
    expect(auditRhythmRegularity(blocks, emptyMap)).toHaveLength(0);
  });
});
describe("auditLineMeasure", () => {
  const emptyMap = new Map;
  test("flags typography block missing max-width", () => {
    const blocks = [{
      selector: ".prose",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "font-size", rawValue: "var(--sg-text-base)", resolvedPx: 16, line: 2 }
      ]
    }];
    const results = auditLineMeasure(blocks, emptyMap);
    expect(results.length).toBe(1);
    expect(results[0].rule).toBe("line-measure");
  });
  test("no issue with max-width in ch range", () => {
    const blocks = [{
      selector: ".prose",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "font-size", rawValue: "var(--sg-text-base)", resolvedPx: 16, line: 2 },
        { property: "max-width", rawValue: "65ch", resolvedPx: null, line: 3 }
      ]
    }];
    expect(auditLineMeasure(blocks, emptyMap)).toHaveLength(0);
  });
  test("flags max-width below 45ch", () => {
    const blocks = [{
      selector: ".narrow",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "line-height", rawValue: "var(--sg-leading-normal)", resolvedPx: null, line: 2 },
        { property: "max-width", rawValue: "30ch", resolvedPx: null, line: 3 }
      ]
    }];
    const results = auditLineMeasure(blocks, emptyMap);
    expect(results.length).toBe(1);
    expect(results[0].message).toContain("30ch");
  });
  test("flags max-width above 75ch", () => {
    const blocks = [{
      selector: ".wide",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "font-size", rawValue: "1rem", resolvedPx: 16, line: 2 },
        { property: "max-inline-size", rawValue: "90ch", resolvedPx: null, line: 3 }
      ]
    }];
    const results = auditLineMeasure(blocks, emptyMap);
    expect(results.length).toBe(1);
    expect(results[0].message).toContain("90ch");
  });
  test("skips non-prose selectors (button)", () => {
    const blocks = [{
      selector: ".sg-button",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "font-size", rawValue: "var(--sg-text-sm)", resolvedPx: 14, line: 2 }
      ]
    }];
    expect(auditLineMeasure(blocks, emptyMap)).toHaveLength(0);
  });
  test("skips non-prose selectors (input)", () => {
    const blocks = [{
      selector: "input",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "font-size", rawValue: "1rem", resolvedPx: 16, line: 2 }
      ]
    }];
    expect(auditLineMeasure(blocks, emptyMap)).toHaveLength(0);
  });
  test("skips non-prose selectors (nav)", () => {
    const blocks = [{
      selector: ".sidebar-nav",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "font-size", rawValue: "0.875rem", resolvedPx: 14, line: 2 }
      ]
    }];
    expect(auditLineMeasure(blocks, emptyMap)).toHaveLength(0);
  });
  test("skips blocks without typography", () => {
    const blocks = [{
      selector: ".container",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "padding", rawValue: "16px", resolvedPx: 16, line: 2 }
      ]
    }];
    expect(auditLineMeasure(blocks, emptyMap)).toHaveLength(0);
  });
  test("45ch boundary is valid", () => {
    const blocks = [{
      selector: ".article",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "font-size", rawValue: "1rem", resolvedPx: 16, line: 2 },
        { property: "max-width", rawValue: "45ch", resolvedPx: null, line: 3 }
      ]
    }];
    expect(auditLineMeasure(blocks, emptyMap)).toHaveLength(0);
  });
  test("75ch boundary is valid", () => {
    const blocks = [{
      selector: ".article",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "font-size", rawValue: "1rem", resolvedPx: 16, line: 2 },
        { property: "max-width", rawValue: "75ch", resolvedPx: null, line: 3 }
      ]
    }];
    expect(auditLineMeasure(blocks, emptyMap)).toHaveLength(0);
  });
});
describe("auditTouchTargets", () => {
  const emptyMap = new Map;
  test("no issue when min-height >= 44px", () => {
    const blocks = [{
      selector: ".sg-button",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "min-height", rawValue: "44px", resolvedPx: 44, line: 2 }
      ]
    }];
    expect(auditTouchTargets(blocks, emptyMap)).toHaveLength(0);
  });
  test("flags button with insufficient min-height", () => {
    const blocks = [{
      selector: ".sg-button",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "min-height", rawValue: "32px", resolvedPx: 32, line: 2 }
      ]
    }];
    const results = auditTouchTargets(blocks, emptyMap);
    expect(results.length).toBe(1);
    expect(results[0].rule).toBe("touch-target");
    expect(results[0].message).toContain("32px");
  });
  test("flags interactive element with no height at all", () => {
    const blocks = [{
      selector: "button",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "padding", rawValue: "8px", resolvedPx: 8, line: 2 }
      ]
    }];
    const results = auditTouchTargets(blocks, emptyMap);
    expect(results.length).toBe(1);
    expect(results[0].message).toContain("none");
  });
  test("accepts touch token usage", () => {
    const blocks = [{
      selector: ".sg-button",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "min-height", rawValue: "var(--sg-touch-target)", resolvedPx: null, line: 2 }
      ]
    }];
    expect(auditTouchTargets(blocks, emptyMap)).toHaveLength(0);
  });
  test("accepts height >= 44px", () => {
    const blocks = [{
      selector: "input",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "height", rawValue: "48px", resolvedPx: 48, line: 2 }
      ]
    }];
    expect(auditTouchTargets(blocks, emptyMap)).toHaveLength(0);
  });
  test("skips non-interactive selectors", () => {
    const blocks = [{
      selector: ".card",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "min-height", rawValue: "20px", resolvedPx: 20, line: 2 }
      ]
    }];
    expect(auditTouchTargets(blocks, emptyMap)).toHaveLength(0);
  });
  test("detects [role='button'] as interactive", () => {
    const blocks = [{
      selector: '[role="button"]',
      layer: null,
      startLine: 1,
      declarations: [
        { property: "min-height", rawValue: "30px", resolvedPx: 30, line: 2 }
      ]
    }];
    const results = auditTouchTargets(blocks, emptyMap);
    expect(results.length).toBe(1);
  });
  test("detects .sg-switch as interactive", () => {
    const blocks = [{
      selector: ".sg-switch",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "min-height", rawValue: "20px", resolvedPx: 20, line: 2 }
      ]
    }];
    expect(auditTouchTargets(blocks, emptyMap).length).toBe(1);
  });
  test("min-block-size is accepted", () => {
    const blocks = [{
      selector: ".sg-button",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "min-block-size", rawValue: "44px", resolvedPx: 44, line: 2 }
      ]
    }];
    expect(auditTouchTargets(blocks, emptyMap)).toHaveLength(0);
  });
  test("exact 44px boundary passes", () => {
    const blocks = [{
      selector: "select",
      layer: null,
      startLine: 1,
      declarations: [
        { property: "min-height", rawValue: "44px", resolvedPx: 44, line: 2 }
      ]
    }];
    expect(auditTouchTargets(blocks, emptyMap)).toHaveLength(0);
  });
});
describe("auditAlignmentConsistency", () => {
  const emptyMap = new Map;
  test("no issue with <= 3 distinct left-edge values", () => {
    const blocks = [
      {
        selector: ".sg-card",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "padding-left", rawValue: "16px", resolvedPx: 16, line: 2 }
        ]
      },
      {
        selector: ".sg-card-header",
        layer: null,
        startLine: 3,
        declarations: [
          { property: "padding-left", rawValue: "16px", resolvedPx: 16, line: 4 }
        ]
      },
      {
        selector: ".sg-card-body",
        layer: null,
        startLine: 5,
        declarations: [
          { property: "padding-left", rawValue: "24px", resolvedPx: 24, line: 6 }
        ]
      }
    ];
    expect(auditAlignmentConsistency(blocks, emptyMap)).toHaveLength(0);
  });
  test("flags > 3 distinct left-edge values per component", () => {
    const blocks = [
      {
        selector: ".sg-card",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "padding-left", rawValue: "4px", resolvedPx: 4, line: 2 }
        ]
      },
      {
        selector: ".sg-card-header",
        layer: null,
        startLine: 3,
        declarations: [
          { property: "padding-left", rawValue: "8px", resolvedPx: 8, line: 4 }
        ]
      },
      {
        selector: ".sg-card-body",
        layer: null,
        startLine: 5,
        declarations: [
          { property: "padding-left", rawValue: "16px", resolvedPx: 16, line: 6 }
        ]
      },
      {
        selector: ".sg-card-footer",
        layer: null,
        startLine: 7,
        declarations: [
          { property: "padding-left", rawValue: "24px", resolvedPx: 24, line: 8 }
        ]
      }
    ];
    const results = auditAlignmentConsistency(blocks, emptyMap);
    expect(results.length).toBe(1);
    expect(results[0].rule).toBe("alignment-consistency");
    expect(results[0].message).toContain("card");
    expect(results[0].message).toContain("4");
  });
  test("skips non-sigui selectors", () => {
    const blocks = [
      {
        selector: ".custom-card",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "padding-left", rawValue: "4px", resolvedPx: 4, line: 2 }
        ]
      }
    ];
    expect(auditAlignmentConsistency(blocks, emptyMap)).toHaveLength(0);
  });
  test("groups by component name prefix", () => {
    const blocks = [
      {
        selector: ".sg-card",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "padding-left", rawValue: "8px", resolvedPx: 8, line: 2 }
        ]
      },
      {
        selector: ".sg-dialog",
        layer: null,
        startLine: 3,
        declarations: [
          { property: "padding-left", rawValue: "16px", resolvedPx: 16, line: 4 }
        ]
      }
    ];
    expect(auditAlignmentConsistency(blocks, emptyMap)).toHaveLength(0);
  });
  test("considers padding-inline-start", () => {
    const blocks = [
      {
        selector: ".sg-list",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "padding-inline-start", rawValue: "4px", resolvedPx: 4, line: 2 }
        ]
      },
      {
        selector: ".sg-list-item",
        layer: null,
        startLine: 3,
        declarations: [
          { property: "padding-inline-start", rawValue: "8px", resolvedPx: 8, line: 4 }
        ]
      },
      {
        selector: ".sg-list-header",
        layer: null,
        startLine: 5,
        declarations: [
          { property: "margin-inline-start", rawValue: "12px", resolvedPx: 12, line: 6 }
        ]
      },
      {
        selector: ".sg-list-footer",
        layer: null,
        startLine: 7,
        declarations: [
          { property: "margin-left", rawValue: "24px", resolvedPx: 24, line: 8 }
        ]
      }
    ];
    const results = auditAlignmentConsistency(blocks, emptyMap);
    expect(results.length).toBe(1);
    expect(results[0].message).toContain("list");
  });
  test("ignores null-resolved values", () => {
    const blocks = [
      {
        selector: ".sg-card",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "padding-left", rawValue: "var(--unknown)", resolvedPx: null, line: 2 }
        ]
      }
    ];
    expect(auditAlignmentConsistency(blocks, emptyMap)).toHaveLength(0);
  });
});
describe("auditSpacingClutter", () => {
  const emptyMap = new Map;
  test("no issue with <= 5 distinct spacing values per component", () => {
    const blocks = [
      {
        selector: ".sg-card",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "padding", rawValue: "4px", resolvedPx: 4, line: 2 },
          { property: "margin", rawValue: "8px", resolvedPx: 8, line: 3 },
          { property: "gap", rawValue: "12px", resolvedPx: 12, line: 4 }
        ]
      },
      {
        selector: ".sg-card-header",
        layer: null,
        startLine: 5,
        declarations: [
          { property: "padding", rawValue: "16px", resolvedPx: 16, line: 6 },
          { property: "margin-bottom", rawValue: "24px", resolvedPx: 24, line: 7 }
        ]
      }
    ];
    expect(auditSpacingClutter(blocks, emptyMap)).toHaveLength(0);
  });
  test("flags component with > 5 distinct spacing values", () => {
    const blocks = [
      {
        selector: ".sg-card",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "padding", rawValue: "4px", resolvedPx: 4, line: 2 },
          { property: "gap", rawValue: "8px", resolvedPx: 8, line: 3 },
          { property: "margin", rawValue: "12px", resolvedPx: 12, line: 4 }
        ]
      },
      {
        selector: ".sg-card-header",
        layer: null,
        startLine: 5,
        declarations: [
          { property: "padding", rawValue: "16px", resolvedPx: 16, line: 6 },
          { property: "margin-top", rawValue: "24px", resolvedPx: 24, line: 7 }
        ]
      },
      {
        selector: ".sg-card-footer",
        layer: null,
        startLine: 8,
        declarations: [
          { property: "padding-left", rawValue: "32px", resolvedPx: 32, line: 9 }
        ]
      }
    ];
    const results = auditSpacingClutter(blocks, emptyMap);
    expect(results.length).toBe(1);
    expect(results[0].rule).toBe("spacing-clutter");
    expect(results[0].message).toContain("card");
  });
  test("ignores zero spacing values", () => {
    const blocks = [
      {
        selector: ".sg-card",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "padding", rawValue: "0", resolvedPx: 0, line: 2 },
          { property: "gap", rawValue: "8px", resolvedPx: 8, line: 3 }
        ]
      }
    ];
    expect(auditSpacingClutter(blocks, emptyMap)).toHaveLength(0);
  });
  test("ignores non-sigui selectors", () => {
    const blocks = [
      {
        selector: ".custom-widget",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "padding", rawValue: "4px", resolvedPx: 4, line: 2 },
          { property: "margin", rawValue: "8px", resolvedPx: 8, line: 3 },
          { property: "gap", rawValue: "12px", resolvedPx: 12, line: 4 },
          { property: "padding-top", rawValue: "16px", resolvedPx: 16, line: 5 },
          { property: "padding-bottom", rawValue: "24px", resolvedPx: 24, line: 6 },
          { property: "margin-left", rawValue: "32px", resolvedPx: 32, line: 7 }
        ]
      }
    ];
    expect(auditSpacingClutter(blocks, emptyMap)).toHaveLength(0);
  });
  test("uses absolute value for negative margins", () => {
    const blocks = [
      {
        selector: ".sg-card",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "margin-top", rawValue: "-8px", resolvedPx: -8, line: 2 },
          { property: "padding", rawValue: "8px", resolvedPx: 8, line: 3 }
        ]
      }
    ];
    const results = auditSpacingClutter(blocks, emptyMap);
    expect(results).toHaveLength(0);
  });
  test("groups values by component name", () => {
    const blocks = [
      {
        selector: ".sg-card",
        layer: null,
        startLine: 1,
        declarations: [
          { property: "padding", rawValue: "4px", resolvedPx: 4, line: 2 },
          { property: "margin", rawValue: "8px", resolvedPx: 8, line: 3 }
        ]
      },
      {
        selector: ".sg-dialog",
        layer: null,
        startLine: 4,
        declarations: [
          { property: "padding", rawValue: "12px", resolvedPx: 12, line: 5 },
          { property: "margin", rawValue: "16px", resolvedPx: 16, line: 6 }
        ]
      }
    ];
    expect(auditSpacingClutter(blocks, emptyMap)).toHaveLength(0);
  });
});
describe("auditLayout", () => {
  test("returns empty for well-formed CSS", () => {
    const css = `:root {
  --sg-space-2: 8px;
  --sg-space-4: 16px;
}
.sg-card {
  padding: var(--sg-space-2);
  margin: var(--sg-space-4);
}`;
    const results = auditLayout(css);
    expect(results.filter((r) => r.rule === "proximity-hierarchy")).toHaveLength(0);
  });
  test("detects proximity violation in full CSS", () => {
    const css = `:root {
  --sg-space-6: 24px;
  --sg-space-2: 8px;
}
.sg-card {
  padding: var(--sg-space-6);
  margin: var(--sg-space-2);
}`;
    const results = auditLayout(css);
    expect(results.some((r) => r.rule === "proximity-hierarchy")).toBe(true);
  });
  test("returns results from multiple audit functions", () => {
    const css = `:root {
  --sg-space-1: 4px;
}
button {
  padding: 8px;
}
.prose {
  font-size: 1rem;
}`;
    const results = auditLayout(css);
    const rules = new Set(results.map((r) => r.rule));
    expect(rules.has("touch-target")).toBe(true);
    expect(rules.has("line-measure")).toBe(true);
  });
});
describe("computeLayoutBalance", () => {
  const container = { width: 1000, height: 800 };
  test("perfectly centered single element scores 0", () => {
    const elements = [
      { x: 400, y: 300, width: 200, height: 200 }
    ];
    const result = computeLayoutBalance(elements, container);
    expect(result.score).toBeCloseTo(0, 5);
    expect(result.centroid.x).toBeCloseTo(500, 5);
    expect(result.centroid.y).toBeCloseTo(400, 5);
    expect(result.distance).toBeCloseTo(0, 5);
  });
  test("empty elements array scores 0", () => {
    const result = computeLayoutBalance([], container);
    expect(result.score).toBe(0);
    expect(result.centroid.x).toBe(500);
    expect(result.centroid.y).toBe(400);
    expect(result.distance).toBe(0);
  });
  test("element at top-left corner produces high score", () => {
    const elements = [
      { x: 0, y: 0, width: 100, height: 100 }
    ];
    const result = computeLayoutBalance(elements, container);
    expect(result.score).toBeGreaterThan(0.5);
    expect(result.centroid.x).toBeCloseTo(50, 5);
    expect(result.centroid.y).toBeCloseTo(50, 5);
  });
  test("symmetrically placed elements cancel out", () => {
    const elements = [
      { x: 0, y: 0, width: 200, height: 200 },
      { x: 800, y: 600, width: 200, height: 200 }
    ];
    const result = computeLayoutBalance(elements, container);
    expect(result.score).toBeCloseTo(0, 5);
    expect(result.centroid.x).toBeCloseTo(500, 5);
    expect(result.centroid.y).toBeCloseTo(400, 5);
  });
  test("weight parameter affects centroid position", () => {
    const elements = [
      { x: 0, y: 300, width: 200, height: 200, weight: 3 },
      { x: 800, y: 300, width: 200, height: 200, weight: 1 }
    ];
    const result = computeLayoutBalance(elements, container);
    expect(result.centroid.x).toBeLessThan(500);
    expect(result.score).toBeGreaterThan(0);
  });
  test("larger area element has more influence", () => {
    const elements = [
      { x: 0, y: 0, width: 400, height: 400 },
      { x: 900, y: 700, width: 100, height: 100 }
    ];
    const result = computeLayoutBalance(elements, container);
    expect(result.centroid.x).toBeLessThan(500);
    expect(result.centroid.y).toBeLessThan(400);
  });
  test("score is clamped to 1 for extreme positions", () => {
    const elements = [
      { x: -500, y: -500, width: 100, height: 100 }
    ];
    const result = computeLayoutBalance(elements, container);
    expect(result.score).toBeLessThanOrEqual(1);
  });
  test("zero-area elements produce score 0", () => {
    const elements = [
      { x: 0, y: 0, width: 0, height: 100 },
      { x: 900, y: 700, width: 100, height: 0 }
    ];
    const result = computeLayoutBalance(elements, container);
    expect(result.score).toBe(0);
  });
  test("zero-size container returns score 0", () => {
    const elements = [
      { x: 0, y: 0, width: 100, height: 100 }
    ];
    const result = computeLayoutBalance(elements, { width: 0, height: 0 });
    expect(result.score).toBe(0);
  });
  test("container center is correctly reported", () => {
    const result = computeLayoutBalance([], { width: 600, height: 400 });
    expect(result.containerCenter.x).toBe(300);
    expect(result.containerCenter.y).toBe(200);
  });
  test("distance is correctly computed", () => {
    const elements = [
      { x: 0, y: 0, width: 200, height: 200 }
    ];
    const result = computeLayoutBalance(elements, container);
    const expectedDist = Math.sqrt(400 ** 2 + 300 ** 2);
    expect(result.distance).toBeCloseTo(expectedDist, 5);
  });
  test("multiple equal elements along center line score 0", () => {
    const elements = [
      { x: 400, y: 0, width: 200, height: 200 },
      { x: 400, y: 300, width: 200, height: 200 },
      { x: 400, y: 600, width: 200, height: 200 }
    ];
    const result = computeLayoutBalance(elements, container);
    expect(result.centroid.x).toBeCloseTo(500, 5);
    expect(result.centroid.y).toBeCloseTo(400, 5);
    expect(result.score).toBeCloseTo(0, 5);
  });
});
