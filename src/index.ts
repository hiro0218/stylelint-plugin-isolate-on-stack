/**
 * stylelint-plugin-isolate-on-stack
 * スタッキングコンテキスト関連の問題を検出するStylelintプラグイン
 */
import stylelint from "stylelint";
import noRedundantDeclarationRule from "./rules/stacking-context/no-redundant-declaration.js";
import ineffectiveOnBackgroundBlendRule from "./rules/stacking-context/ineffective-on-background-blend.js";
import preferOverSideEffectsRule from "./rules/stacking-context/prefer-over-side-effects.js";
import performanceHighDescendantCountRule from "./rules/stacking-context/performance-high-descendant-count.js";
import zIndexRangeRule from "./rules/z-index-range/index.js";

/**
 * プラグインの名前空間
 */
const namespace = "stylelint-plugin-isolate-on-stack";

/**
 * 各ルールを個別にStylelintプラグインとして登録
 */
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

const performanceHighDescendantCount = stylelint.createPlugin(
  `${namespace}/performance-high-descendant-count`,
  performanceHighDescendantCountRule,
);

const zIndexRange = stylelint.createPlugin(
  `${namespace}/z-index-range`,
  zIndexRangeRule,
);

/**
 * プラグイン配列 - Stylelint v16 ESM形式に対応
 */
const plugins = [
  noRedundantDeclaration,
  ineffectiveOnBackgroundBlend,
  preferOverSideEffects,
  performanceHighDescendantCount,
  zIndexRange,
];

// ESM用のエクスポート
export default plugins;

/**
 * 個別のルールをエクスポート
 */
export {
  noRedundantDeclarationRule as noRedundantDeclaration,
  ineffectiveOnBackgroundBlendRule as ineffectiveOnBackgroundBlend,
  preferOverSideEffectsRule as preferOverSideEffects,
  performanceHighDescendantCountRule as performanceHighDescendantCount,
  zIndexRangeRule as zIndexRange,
};
