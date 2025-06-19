/**
 * パフォーマンスに影響を与える可能性のある多数の子孫を持つ要素に
 * isolation: isolateを使用している場合の警告ルール
 *
 * 注意: このルールは実際のDOM要素数をCSSだけで判断することができないため、
 * コメントによる特別なマーカーを使用する実装になっています。
 */
import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";
import type { RuleOptions } from "../../types/index.js";

export const ruleName =
  "stylelint-plugin-isolate-on-stack/performance-high-descendant-count";

export const messages = {
  rejected: (count: number, threshold: number) =>
    `多数の子孫（${count}個）を持つ要素にisolation: isolateを使用すると、パフォーマンスに影響を与える可能性があります。これが本当に必要か確認してください。閾値: ${threshold}個`,
};

/**
 * パフォーマンスに影響を与える可能性のある多数の子孫を持つ要素に
 * isolation: isolateを使用している場合の警告ルール
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
    const threshold =
      options.maxDescendantCount !== undefined
        ? options.maxDescendantCount
        : 100; // デフォルト値は100

    // 大量の子孫を持つ要素を特定するためのコメントマーカー
    // 例: /* @descendants: 150 */
    const descendantCommentPattern = /@descendants:\s*(\d+)/i;

    // isolation: isolate宣言を持つルールを検索
    root.walkRules((rule) => {
      let hasIsolate = false;
      let descendantCount = 0;

      // isolation: isolateの使用を確認
      rule.walkDecls("isolation", (decl) => {
        if (decl.value === "isolate") {
          hasIsolate = true;
        }
      });

      // isolation: isolateが使用されている場合のみ子孫数をチェック
      if (hasIsolate) {
        // 前の兄弟ノードからコメントを探す
        let prev = rule.prev();
        while (prev) {
          if (prev.type === "comment") {
            const match = prev.text.match(descendantCommentPattern);
            if (match && match[1]) {
              descendantCount = parseInt(match[1], 10);
              break;
            }
          }
          prev = prev.prev();
        }

        // 子孫数が閾値を超えている場合に警告
        if (descendantCount > threshold) {
          rule.walkDecls("isolation", (decl) => {
            if (decl.value === "isolate") {
              report({
                message: messages.rejected(descendantCount, threshold),
                node: decl,
                result,
                ruleName,
              });
            }
          });
        }
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
rule.messages = messages;

export default rule;
