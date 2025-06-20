/**
 * 過度に高いz-index値を検出して警告するルール
 *
 * z-indexの値が設定された閾値を超える場合に警告し、
 * スタッキングコンテキストを適切に使用したレイヤー設計を促す
 */
import { Rule } from "stylelint";
import { Declaration } from "postcss";
import { getZIndexValue } from "../../utils/stacking-context.js";
import { zIndexRangeMessages } from "../../utils/message.js";
import type { RuleOptions } from "../../types/index.js";

const ruleName = "stylelint-plugin-isolate-on-stack/z-index-range";

const rule: Rule<boolean | [boolean, RuleOptions]> = (primary, secondaryOptions) => {
  return (root, result) => {
    // プライマリオプションがtrueでない場合はスキップ
    if (primary !== true) return;

    // オプション設定を取得（デフォルト値はz-index最大値100）
    const options = Array.isArray(primary) && primary.length > 1 && primary[1] ? primary[1] : secondaryOptions || {};
    const maxZIndex = options.maxZIndex !== undefined ? options.maxZIndex : 100;

    // z-index宣言をチェック
    root.walkDecls("z-index", (decl) => {
      const zIndexValue = getZIndexValue(decl);

      // 数値であり、最大値を超える場合に報告
      if (zIndexValue !== null && zIndexValue > maxZIndex) {
        report({
          message: zIndexRangeMessages.rejected(zIndexValue, maxZIndex),
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
rule.messages = zIndexRangeMessages;

export default rule;
