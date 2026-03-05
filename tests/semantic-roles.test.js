// @ts-check

/**
 * Repository module for semantic roles.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { assignSemanticRoles, RATIO_BANDS } from "../src/typography/semantic-roles.js";
import { generateTypeScale } from "../src/typography/scale.js";
describe("RATIO_BANDS", () => {
  test("contains 10 bands (3 display + h1-h4 + body + body-small + caption)", () => {
    expect(RATIO_BANDS).toHaveLength(10);
  });
  test("all bands have min < max", () => {
    for (const band of RATIO_BANDS) {
      expect(band.min).toBeLessThan(band.max);
    }
  });
  test("bands are ordered from highest ratio to lowest", () => {
    for (let i = 0;i < RATIO_BANDS.length - 1; i++) {
      expect(RATIO_BANDS[i].min).toBeGreaterThanOrEqual(RATIO_BANDS[i + 1].min);
    }
  });
});
describe("assignSemanticRoles", () => {
  test("default scale (base=16, ratio=1.2) assigns body to 'base' step", () => {
    const scale = generateTypeScale();
    const result = assignSemanticRoles(scale);
    expect(result.bodyStep).toBe("base");
    const bodyAssignment = result.assignments.find((a) => a.role === "body");
    expect(bodyAssignment).toBeDefined();
    expect(bodyAssignment.scaleStep).toBe("base");
    expect(bodyAssignment.ratioToBody).toBeCloseTo(1, 2);
  });
  test("all assigned roles have valid scale steps", () => {
    const scale = generateTypeScale();
    const result = assignSemanticRoles(scale);
    const validSteps = new Set([
      "2xs",
      "xs",
      "sm",
      "base",
      "lg",
      "xl",
      "2xl",
      "3xl",
      "4xl",
      "5xl",
      "6xl",
      "7xl",
      "8xl",
      "9xl"
    ]);
    for (const assignment of result.assignments) {
      expect(validSteps.has(assignment.scaleStep)).toBe(true);
    }
  });
  test("no scale step is assigned twice", () => {
    const scale = generateTypeScale();
    const result = assignSemanticRoles(scale);
    const steps = result.assignments.map((a) => a.scaleStep);
    const unique = new Set(steps);
    expect(unique.size).toBe(steps.length);
  });
  test("no role is assigned twice", () => {
    const scale = generateTypeScale();
    const result = assignSemanticRoles(scale);
    const roles = result.assignments.map((a) => a.role);
    const unique = new Set(roles);
    expect(unique.size).toBe(roles.length);
  });
  test("assignments + gaps account for all 10 roles", () => {
    const scale = generateTypeScale();
    const result = assignSemanticRoles(scale);
    const allRoles = new Set([
      "display-high",
      "display-mid",
      "display-low",
      "h1",
      "h2",
      "h3",
      "h4",
      "body",
      "body-small",
      "caption"
    ]);
    const covered = new Set;
    for (const a of result.assignments)
      covered.add(a.role);
    for (const g of result.gaps)
      covered.add(g);
    expect(covered.size).toBe(allRoles.size);
  });
  test("h-level assignments have ratios > 1 (larger than body)", () => {
    const scale = generateTypeScale();
    const result = assignSemanticRoles(scale);
    const headings = result.assignments.filter((a) => a.role.startsWith("h") && !a.role.startsWith("he"));
    for (const h of headings) {
      expect(h.ratioToBody).toBeGreaterThanOrEqual(1);
    }
  });
  test("body-small and caption assignments have ratios < 1", () => {
    const scale = generateTypeScale();
    const result = assignSemanticRoles(scale);
    const smallRoles = result.assignments.filter((a) => a.role === "body-small" || a.role === "caption");
    for (const r of smallRoles) {
      expect(r.ratioToBody).toBeLessThan(1);
    }
  });
  test("custom ratio 1.333 (Perfect Fourth) redistributes correctly", () => {
    const scale = generateTypeScale({ ratio: 1.333 });
    const result = assignSemanticRoles(scale);
    expect(result.assignments.length).toBeGreaterThan(0);
    const bodyAssignment = result.assignments.find((a) => a.role === "body");
    expect(bodyAssignment).toBeDefined();
    expect(bodyAssignment.scaleStep).toBe("base");
  });
  test("gap detection reports roles with no matching scale value", () => {
    const scale = generateTypeScale();
    const result = assignSemanticRoles(scale);
    const allRoles = new Set([
      "display-high",
      "display-mid",
      "display-low",
      "h1",
      "h2",
      "h3",
      "h4",
      "body",
      "body-small",
      "caption"
    ]);
    for (const gap of result.gaps) {
      expect(allRoles.has(gap)).toBe(true);
    }
  });
  test("assignments are sorted by role order", () => {
    const scale = generateTypeScale();
    const result = assignSemanticRoles(scale);
    const roleOrder = [
      "display-high",
      "display-mid",
      "display-low",
      "h1",
      "h2",
      "h3",
      "h4",
      "body",
      "body-small",
      "caption"
    ];
    const indices = result.assignments.map((a) => roleOrder.indexOf(a.role));
    for (let i = 1;i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]);
    }
  });
  test("custom bodyStep changes the anchor point", () => {
    const scale = generateTypeScale();
    const result = assignSemanticRoles(scale, { bodyStep: "lg" });
    expect(result.bodyStep).toBe("lg");
    const bodyAssignment = result.assignments.find((a) => a.role === "body");
    expect(bodyAssignment).toBeDefined();
    expect(bodyAssignment.scaleStep).toBe("lg");
  });
});
