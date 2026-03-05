// @ts-check

/**
 * SigUI core typography module for semantic roles.
 * @module
 */
export const RATIO_BANDS = [
  { role: "display-high", min: 3.25, max: 4 },
  { role: "display-mid", min: 2.85, max: 3.25 },
  { role: "display-low", min: 2.5, max: 2.85 },
  { role: "h1", min: 1.8, max: 2.5 },
  { role: "h2", min: 1.4, max: 1.8 },
  { role: "h3", min: 1.2, max: 1.4 },
  { role: "h4", min: 1, max: 1.2 },
  { role: "body", min: 0.975, max: 1.025 },
  { role: "body-small", min: 0.75, max: 0.975 },
  { role: "caption", min: 0.5, max: 0.75 }
];
const STEP_ORDER = [
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
];
function geometricMean(a, b) {
  return Math.sqrt(a * b);
}
function bandDistance(ratio, band) {
  const center = geometricMean(band.min, band.max);
  return Math.abs(Math.log(ratio) - Math.log(center));
}
/**
 * assignSemanticRoles.
 * @param {TypeScale} scale
 * @param {{ bodyStep?: TypeScaleStep }} options
 * @returns {SemanticRoleResult}
 */
export function assignSemanticRoles(scale, options) {
  const bodyStep = options?.bodyStep ?? "base";
  const bodyValue = scale[bodyStep];
  const ratios = [];
  for (const step of STEP_ORDER) {
    ratios.push({
      step,
      ratio: scale[step] / bodyValue,
      size: scale[step]
    });
  }
  const nonDisplayBands = RATIO_BANDS.filter((b) => !b.role.startsWith("display-"));
  const displayBands = RATIO_BANDS.filter((b) => b.role.startsWith("display-"));
  const displayMin = 2.5;
  const assignments = [];
  const displayCandidates = [];
  const assignedRoles = new Set;
  const assignedSteps = new Set;
  for (const entry of ratios) {
    if (entry.ratio >= displayMin) {
      displayCandidates.push(entry);
    }
  }
  const rolePriority = [
    "body",
    "h4",
    "h3",
    "h2",
    "h1",
    "body-small",
    "caption"
  ];
  for (const role of rolePriority) {
    const band = nonDisplayBands.find((b) => b.role === role);
    let bestStep = null;
    let bestDist = 1 / 0;
    for (const entry of ratios) {
      if (assignedSteps.has(entry.step))
        continue;
      if (displayCandidates.includes(entry))
        continue;
      const dist = bandDistance(entry.ratio, band);
      if (entry.ratio >= band.min * 0.8 && entry.ratio < band.max * 1.2) {
        if (dist < bestDist) {
          bestDist = dist;
          bestStep = entry;
        }
      }
    }
    if (bestStep) {
      assignments.push({
        role,
        scaleStep: bestStep.step,
        sizeRem: bestStep.size,
        ratioToBody: bestStep.ratio
      });
      assignedRoles.add(role);
      assignedSteps.add(bestStep.step);
    }
  }
  displayCandidates.sort((a, b) => b.ratio - a.ratio);
  const displayRoles = ["display-high", "display-mid", "display-low"];
  for (let i = 0;i < displayCandidates.length && i < displayRoles.length; i++) {
    const candidate = displayCandidates[i];
    if (assignedSteps.has(candidate.step))
      continue;
    assignments.push({
      role: displayRoles[i],
      scaleStep: candidate.step,
      sizeRem: candidate.size,
      ratioToBody: candidate.ratio
    });
    assignedRoles.add(displayRoles[i]);
    assignedSteps.add(candidate.step);
  }
  const allRoles = [
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
  const gaps = allRoles.filter((r) => !assignedRoles.has(r));
  const roleOrder = new Map(allRoles.map((r, i) => [r, i]));
  assignments.sort((a, b) => (roleOrder.get(a.role) ?? 0) - (roleOrder.get(b.role) ?? 0));
  return {
    assignments,
    gaps,
    bodyStep
  };
}
