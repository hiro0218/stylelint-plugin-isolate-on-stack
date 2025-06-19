/**
 * 副作用のあるプロパティを使ってスタッキングコンテキストを生成している場合、
 * より明示的なisolation: isolateの使用を推奨するルール
 */
import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";

export const ruleName =
  "stylelint-plugin-isolate-on-stack/prefer-over-side-effects";

export const messages = {
  rejected: (property: string, value: string) =>
    `${property}: ${value}の意図しない副作用を避け、スタッキングコンテキストを生成するためにisolation: isolateの使用を検討してください。`,
};

/**
 * 副作用のあるプロパティを使ってスタッキングコンテキストを生成している場合、
 * より明示的なisolation: isolateの使用を推奨するルール
 */
const rule: Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    // プライマリオプションがtrueでない場合はスキップ
    if (primary !== true) return;

    // 副作用を使ったスタッキングコンテキスト生成の可能性があるパターンをチェック
    root.walkDecls((decl) => {
      const { prop, value } = decl;

      // opacity: 0.999などの、ほぼ透明ではない値
      if (
        prop === "opacity" &&
        parseFloat(value) >= 0.99 &&
        parseFloat(value) < 1
      ) {
        report({
          message: messages.rejected(prop, value),
          node: decl,
          result,
          ruleName,
        });
      }

      // transform: translateZ(0)やtransform: translate3d(0,0,0)などのハックチェック
      if (
        prop === "transform" &&
        (value === "translateZ(0)" ||
          value === "translate3d(0,0,0)" ||
          value === "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)")
      ) {
        report({
          message: messages.rejected(prop, value),
          node: decl,
          result,
          ruleName,
        });
      }

      // will-change: opacity, transform などのパフォーマンスヒントを使った場合
      if (
        prop === "will-change" &&
        (value.includes("opacity") ||
          value.includes("transform") ||
          value.includes("z-index"))
      ) {
        report({
          message: messages.rejected(prop, value),
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
