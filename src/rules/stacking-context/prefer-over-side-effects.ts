/**
 * 副作用を利用したスタッキングコンテキスト生成の代わりに
 * isolation: isolateの使用を推奨するルール
 *
 * opacity: 0.999やtransform: translateZ(0)などのハックを使ったスタッキングコンテキストの
 * 生成よりも、明示的なisolation: isolateを使用することを推奨
 */
import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";

const ruleName = "stylelint-plugin-isolate-on-stack/prefer-over-side-effects";

const messages = {
  rejected:
    "isolation: isolateの代わりに、transformやwill-changeなど他のスタッキングコンテキスト作成プロパティの利用を検討してください。",
};
const rule: Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    // プライマリオプションがtrueでない場合はスキップ
    if (primary !== true) return;

    // 副作用を利用したスタッキングコンテキスト生成パターンをチェック
    root.walkDecls((decl) => {
      const { prop, value } = decl;

      // 不透明度が極めて1に近い値を使ったハック
      if (prop === "opacity" && parseFloat(value) >= 0.99 && parseFloat(value) < 1) {
        report({
          message: messages.rejected,
          node: decl,
          result,
          ruleName,
        });
      }

      // 3D変換ハック（スタッキングコンテキスト生成目的）
      if (
        prop === "transform" &&
        (value === "translateZ(0)" ||
          value === "translate3d(0,0,0)" ||
          value === "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)")
      ) {
        report({
          message: messages.rejected,
          node: decl,
          result,
          ruleName,
        });
      }

      // will-changeを使ったパフォーマンスヒント兼スタッキングコンテキスト生成
      if (
        prop === "will-change" &&
        (value.includes("opacity") || value.includes("transform") || value.includes("z-index"))
      ) {
        report({
          message: messages.rejected,
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
