/**
 * スタッキングコンテキストとz-indexに関連する全ルールのエクスポート
 */
import noRedundantDeclaration from "./stacking-context/no-redundant-declaration.js";
import ineffectiveOnBackgroundBlend from "./stacking-context/ineffective-on-background-blend.js";
import preferOverSideEffects from "./stacking-context/prefer-over-side-effects.js";
import performanceHighDescendantCount from "./stacking-context/performance-high-descendant-count.js";
import zIndexRange from "./z-index-range/index.js";

export default {
  "no-redundant-declaration": noRedundantDeclaration,
  "ineffective-on-background-blend": ineffectiveOnBackgroundBlend,
  "prefer-over-side-effects": preferOverSideEffects,
  "performance-high-descendant-count": performanceHighDescendantCount,
  "z-index-range": zIndexRange,
};
