// @ts-check

/**
 * SigUI core spacing module for relationship.
 * @module
 */
const RELATIONSHIP_RANGES = {
  related: {
    relationship: "related",
    min: 4,
    max: 8,
    default: 4,
    tokens: ["1", "2"],
    description: "Elements that form a single atomic component (icon + label, checkbox + label)",
    examples: [
      "Icon + button label",
      "Checkbox + label text",
      "Input prefix/suffix + field"
    ]
  },
  grouped: {
    relationship: "grouped",
    min: 12,
    max: 16,
    default: 16,
    tokens: ["3", "4"],
    description: "Elements forming a coherent thought or block (title + paragraph, input + hint)",
    examples: [
      "Heading + paragraph",
      "Input + helper text",
      "Label + input field",
      "List item components"
    ]
  },
  separated: {
    relationship: "separated",
    min: 24,
    max: 32,
    default: 24,
    tokens: ["6", "8"],
    description: "Separate blocks within a shared context (form groups, sibling cards)",
    examples: [
      "Form field groups",
      "Sibling cards in a grid",
      "Navigation items with sub-sections",
      "Related UI panels"
    ]
  },
  distinct: {
    relationship: "distinct",
    min: 48,
    max: 64,
    default: 48,
    tokens: ["12", "16"],
    description: "Major layout regions changing subject context (page sections, header vs content)",
    examples: [
      "Page sections",
      "Header vs main content",
      "Footer separation",
      "Hero vs body content"
    ]
  }
};
/**
 * getRelationshipSpacing.
 * @param {SpacingRelationship} relationship
 * @returns {RelationshipSpacingRange}
 */
export function getRelationshipSpacing(relationship) {
  return RELATIONSHIP_RANGES[relationship];
}
/**
 * getAllRelationshipSpacings.
 * @returns {ReadonlyArray<RelationshipSpacingRange>}
 */
export function getAllRelationshipSpacings() {
  return [
    RELATIONSHIP_RANGES["related"],
    RELATIONSHIP_RANGES["grouped"],
    RELATIONSHIP_RANGES["separated"],
    RELATIONSHIP_RANGES["distinct"]
  ];
}
/**
 * getDefaultSpacing.
 * @param {SpacingRelationship} relationship
 * @returns {number}
 */
export function getDefaultSpacing(relationship) {
  return RELATIONSHIP_RANGES[relationship].default;
}
/**
 * validateProximityHierarchy.
 * @param {number} innerSpacing
 * @param {number} outerSpacing
 * @returns {boolean}
 */
export function validateProximityHierarchy(innerSpacing, outerSpacing) {
  return outerSpacing > innerSpacing;
}
/**
 * spacingRelationship.
 * @param {number} innerContext
 * @param {number} outerContext
 * @param {SpacingRelationshipOptions} options
 * @returns {SpacingRelationshipResult}
 */
export function spacingRelationship(innerContext, outerContext, options) {
  const withinThreshold = options?.withinThresholdPx ?? RELATIONSHIP_RANGES.grouped.max;
  const betweenThreshold = options?.betweenThresholdPx ?? RELATIONSHIP_RANGES.separated.min;
  const minRatio = options?.minRatio ?? betweenThreshold / Math.max(withinThreshold, 1);
  const withinWeight = options?.withinWeight ?? 1;
  const betweenWeight = options?.betweenWeight ?? 1;
  const ratioWeight = options?.ratioWeight ?? 0.5;
  const safeInner = Math.max(innerContext, 0.0001);
  const ratio = outerContext / safeInner;
  const withinPenalty = Math.max(0, innerContext - withinThreshold) / Math.max(withinThreshold, 1);
  const betweenPenalty = Math.max(0, betweenThreshold - outerContext) / Math.max(betweenThreshold, 1);
  const ratioPenalty = Math.max(0, minRatio - ratio) / Math.max(minRatio, 1);
  const energy = withinPenalty * withinWeight + betweenPenalty * betweenWeight + ratioPenalty * ratioWeight;
  return {
    valid: energy === 0,
    ratio,
    minRatio,
    withinPenalty,
    betweenPenalty,
    ratioPenalty,
    energy
  };
}
/**
 * relationshipForDepth.
 * @param {number} depth
 * @returns {SpacingRelationship}
 */
export function relationshipForDepth(depth) {
  if (depth <= 0)
    return "distinct";
  if (depth === 1)
    return "separated";
  if (depth === 2)
    return "grouped";
  return "related";
}
/**
 * isInRelationshipRange.
 * @param {number} spacing
 * @param {SpacingRelationship} relationship
 * @returns {boolean}
 */
export function isInRelationshipRange(spacing, relationship) {
  const range = RELATIONSHIP_RANGES[relationship];
  return spacing >= range.min && spacing <= range.max;
}
