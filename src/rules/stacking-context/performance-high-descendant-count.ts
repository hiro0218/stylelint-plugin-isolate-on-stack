/**
 * 多数の子孫要素を持つ場合のisolation: isolateのパフォーマンス警告ルール
 *
 * 子孫要素が多い場合、isolation: isolateによる新しいスタッキングコンテキストは
 * レンダリングパフォーマンスに影響を与える可能性があるため警告する
 */
import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";
import type { RuleOptions } from "../../types/index.js";
import { performanceHighDescendantCountMessages } from "../../utils/message.js";

const ruleName = "stylelint-plugin-isolate-on-stack/performance-high-descendant-count";

const rule: Rule<boolean | [boolean, RuleOptions]> = (primary, secondaryOptions) => {
  return (root, result) => {
    // プライマリオプションがtrueでない場合はスキップ
    if (primary !== true) return;

    // オプション設定を取得（デフォルト値は子孫要素数の閾値100）
    const options = Array.isArray(primary) && primary.length > 1 && primary[1] ? primary[1] : secondaryOptions || {};
    const threshold = options.maxDescendantCount !== undefined ? options.maxDescendantCount : 100;

    // isolation: isolate宣言を持つルールを検索
    root.walkRules((rule) => {
      let hasIsolate = false;

      // isolation: isolateの使用を確認
      rule.walkDecls("isolation", (decl) => {
        if (decl.value === "isolate") {
          hasIsolate = true;
        }
      });

      // isolation: isolateが使用されている場合のみ子孫数をチェック
      if (hasIsolate) {
        // 子孫数が閾値を超えている場合に警告
        rule.walkDecls("isolation", (decl) => {
          if (decl.value === "isolate") {
            report({
              message: performanceHighDescendantCountMessages.rejected,
              node: decl,
              result,
              ruleName,
            });
          }
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
  node: PostCSSRule | Declaration;
  result: any;
  ruleName: string;
}) {
  result.warn(message, {
    node,
    ruleName,
  });
}

rule.ruleName = ruleName;
rule.messages = performanceHighDescendantCountMessages;

export default rule;
