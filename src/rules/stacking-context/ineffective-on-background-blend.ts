/**
 * 無効なbackground-blend-modeとisolation: isolateの組み合わせを検出するルール
 */
import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";
import { hasInvalidBackgroundBlendWithIsolation } from "../../utils/stacking-context.js";

export const ruleName =
  "stylelint-plugin-isolate-on-stack/ineffective-on-background-blend";

export const messages = {
  rejected:
    "無効なisolation: isolateです。このプロパティは、要素内部の背景レイヤーで動作するbackground-blend-modeには影響しません。",
};

/**
 * 無効なbackground-blend-modeとisolation: isolateの組み合わせを検出するルール
 */
const rule: Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    // プライマリオプションがtrueでない場合はスキップ
    if (primary !== true) return;

    // CSS宣言を走査する際に使用する要素のプロパティ情報
    const elementProperties: Record<string, Record<string, any>> = {};

    // まず、すべての宣言を収集して各要素のプロパティマップを構築
    root.walkRules((rule) => {
      const selector = rule.selector;
      elementProperties[selector] = elementProperties[selector] || {};

      rule.walkDecls((decl) => {
        elementProperties[selector][decl.prop] = decl.value;
      });
    });

    // 次に、isolation: isolateとbackground-blend-modeの組み合わせをチェック
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
