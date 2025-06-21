/**
 * Error messages for z-index range violations
 */
export const zIndexRangeMessages = {
  rejected: (zIndexValue: number, maxZIndex: number) =>
    `z-index value '${zIndexValue}' exceeds the allowed range (maximum: ${maxZIndex}).`,
};

/**
 * Error messages for redundant isolation declarations
 */
export const noRedundantDeclarationMessages = {
  rejected:
    "Redundant 'isolation: isolate'. This property is unnecessary when no other stacking context properties exist.",
};

/**
 * Error messages for ineffective background-blend-mode combinations
 */
export const ineffectiveOnBackgroundBlendMessages = {
  rejected:
    "Ineffective 'isolation: isolate'. This property does not affect background-blend-mode which operates on background layers within the element.",
};

/**
 * Error messages for side effects vs explicit isolation
 */
export const preferOverSideEffectsMessages = {
  rejected:
    "Consider using other stacking context properties like 'transform' or 'will-change' instead of 'isolation: isolate'.",
};

/**
 * Error messages for performance impact warnings
 */
export const performanceHighDescendantCountMessages = {
  rejected: (selector: string, count: number) =>
    `Stacking context element '${selector}' may have a high number of descendants (estimated: ${count}), which could impact performance.`,
};
