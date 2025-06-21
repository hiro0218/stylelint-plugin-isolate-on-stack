import stylelint from "stylelint";
import noRedundantDeclarationRule from "./rules/stacking-context/no-redundant-declaration.js";
import ineffectiveOnBackgroundBlendRule from "./rules/stacking-context/ineffective-on-background-blend.js";
import preferOverSideEffectsRule from "./rules/stacking-context/prefer-over-side-effects.js";
import zIndexRangeRule from "./rules/z-index-range/index.js";
import performanceHighDescendantCountRule from "./rules/stacking-context/performance-high-descendant-count.js";

const namespace = "stylelint-plugin-isolate-on-stack";
const noRedundantDeclaration = stylelint.createPlugin(
  `${namespace}/no-redundant-declaration`,
  noRedundantDeclarationRule,
);

const ineffectiveOnBackgroundBlend = stylelint.createPlugin(
  `${namespace}/ineffective-on-background-blend`,
  ineffectiveOnBackgroundBlendRule,
);

const preferOverSideEffects = stylelint.createPlugin(
  `${namespace}/prefer-over-side-effects`,
  preferOverSideEffectsRule,
);

const zIndexRange = stylelint.createPlugin(`${namespace}/z-index-range`, zIndexRangeRule);

const performanceHighDescendantCount = stylelint.createPlugin(
  `${namespace}/performance-high-descendant-count`,
  performanceHighDescendantCountRule,
);

const plugins = [
  noRedundantDeclaration,
  ineffectiveOnBackgroundBlend,
  preferOverSideEffects,
  zIndexRange,
  performanceHighDescendantCount,
];

export default plugins;

export {
  noRedundantDeclarationRule as noRedundantDeclaration,
  ineffectiveOnBackgroundBlendRule as ineffectiveOnBackgroundBlend,
  preferOverSideEffectsRule as preferOverSideEffects,
  zIndexRangeRule as zIndexRange,
  performanceHighDescendantCountRule as performanceHighDescendantCount,
};
