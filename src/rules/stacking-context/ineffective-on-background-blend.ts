/**
 * 無効なbackground-blend-modeとisolation: isolateの組み合わせを検出するルール
 *
 * isolation: isolateはbackground-blend-modeに影響しないため、
 * この2つのプロパティの組み合わせを検出して警告する
 */
import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";
import { hasInvalidBackgroundBlendWithIsolation } from "../../utils/stacking-context.js";

const ruleName =
  "stylelint-plugin-isolate-on-stack/ineffective-on-background-blend";

const messages = {
  rejected:
    "無効なisolation: isolateです。このプロパティは、要素内部の背景レイヤーで動作するbackground-blend-modeには影響しません。",
};
const rule: Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    // プライマリオプションがtrueでない場合はスキップ
    if (primary !== true) return;

    // 各セレクタのプロパティ情報を収集
    const elementProperties: Record<string, Record<string, any>> = {};

    // すべての宣言を収集して各要素のプロパティマップを構築
    root.walkRules((rule) => {
      const selector = rule.selector;
      elementProperties[selector] = elementProperties[selector] || {};

      rule.walkDecls((decl) => {
        elementProperties[selector][decl.prop] = decl.value;
      });
    });

    // isolation: isolateとbackground-blend-modeの組み合わせをチェック
    root.walkRules((rule) => {
      const selector = rule.selector;
      const properties = elementProperties[selector] || {};

      // 無効な組み合わせの場合
      if (hasInvalidBackgroundBlendWithIsolation(properties)) {
        // isolation: isolate宣言を見つけて報告
        rule.walkDecls("isolation", (decl) => {
          if (decl.value === "isolate") {
            report({
              message: messages.rejected,
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
rule.messages = messages;

export default rule;
