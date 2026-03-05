// @ts-check

/**
 * SigUI core performance module for dom budget.
 * @module
 */
import { DEFAULT_DOM_BUDGET } from "./budgets.js";
/**
 * validateDOMDepth.
 * @param {number} depth
 * @param {Partial<DOMBudget>} budget
 * @returns {DOMDepthResult}
 */
export function validateDOMDepth(depth, budget) {
  const maxDepth = budget?.maxNestingDepth ?? DEFAULT_DOM_BUDGET.maxNestingDepth;
  return {
    depth,
    withinBudget: depth <= maxDepth,
    budget: maxDepth
  };
}
/**
 * validateComponentNodeCount.
 * @param {number} nodeCount
 * @param {Partial<DOMBudget>} budget
 * @returns {boolean}
 */
export function validateComponentNodeCount(nodeCount, budget) {
  const max = budget?.maxNodesPerComponent ?? DEFAULT_DOM_BUDGET.maxNodesPerComponent;
  return nodeCount <= max;
}
/**
 * validatePageNodeCount.
 * @param {number} nodeCount
 * @param {"interactive" | "content"} pageType
 * @param {Partial<DOMBudget>} budget
 * @returns {boolean}
 */
export function validatePageNodeCount(nodeCount, pageType, budget) {
  const merged = { ...DEFAULT_DOM_BUDGET, ...budget };
  const max = pageType === "interactive" ? merged.maxNodesInteractive : merged.maxNodesContent;
  return nodeCount <= max;
}
/**
 * getListRenderingStrategy.
 * @param {number} itemCount
 * @param {Partial<DOMBudget>} budget
 * @returns {"full" | "content-visibility" | "virtual" | "virtual-paginated"}
 */
export function getListRenderingStrategy(itemCount, budget) {
  const threshold = budget?.virtualScrollThreshold ?? DEFAULT_DOM_BUDGET.virtualScrollThreshold;
  if (itemCount <= 50)
    return "full";
  if (itemCount <= threshold)
    return "content-visibility";
  if (itemCount <= 1000)
    return "virtual";
  return "virtual-paginated";
}
/**
 * estimateRecalcCost.
 * @param {number} depth
 * @returns {number}
 */
export function estimateRecalcCost(depth) {
  if (depth <= 4)
    return 1;
  if (depth <= 8)
    return 1.5 + (depth - 5) * 0.125;
  if (depth <= 12)
    return 2.5 + (depth - 9) * 0.375;
  return 5 + (depth - 13) * 0.5;
}
