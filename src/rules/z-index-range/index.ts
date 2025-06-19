/**
 * 過度に高いz-index値を検出するルール
 */
import { Rule } from "stylelint";
import { Declaration } from "postcss";
import { getZIndexValue } from "../../utils/stacking-context.js";
import type { RuleOptions } from "../../types/index.js";

export const ruleName = "stylelint-plugin-isolate-on-stack/z-index-range";

export const messages = {
  rejected: (value: number, max: number) =>
    `z-index値 ${value} が最大許容値 ${max} を超えています。スタッキングコンテキストを生成してz-indexをリセットすることを検討してください。`,
};

/**
 * 過度に高いz-index値を検出するルール
 */
const rule: Rule<boolean | [boolean, RuleOptions]> = (
  primary,
  secondaryOptions,
) => {
  return (root, result) => {
    // プライマリオプションがtrueでない場合はスキップ
    if (primary !== true) return;

    // セカンダリオプションを取得
    const options =
      Array.isArray(primary) && primary.length > 1 && primary[1]
        ? primary[1]
        : secondaryOptions || {};
    const maxZIndex = options.maxZIndex !== undefined ? options.maxZIndex : 100; // デフォルト値は100

    // z-index宣言をチェック
    root.walkDecls("z-index", (decl) => {
      const zIndexValue = getZIndexValue(decl);

      // 数値であり、最大値を超える場合に報告
      if (zIndexValue !== null && zIndexValue > maxZIndex) {
        report({
          message: messages.rejected(zIndexValue, maxZIndex),
          node: decl,
          result,
          ruleName,
        });
      }
    });
  };
};

/**
 * 違反を報告する関数
 */
function report({
  message,
  node,
  result,
  ruleName,
}: {
  message: string;
  node: Declaration;
  result: any;
  ruleName: string;
}) {
  result.warn(message, {
    node,
    ruleName,
  });
}

rule.ruleName = ruleName;
rule.messages = messages;

export default rule;
