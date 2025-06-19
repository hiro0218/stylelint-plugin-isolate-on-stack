/**
 * 冗長なisolation: isolate宣言を検出するルール
 */
import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";
import { alreadyCreatesStackingContext } from "../../utils/stacking-context.js";

export const ruleName =
  "stylelint-plugin-isolate-on-stack/no-redundant-declaration";

export const messages = {
  rejected: (property: string) =>
    `冗長なisolation: isolateです。この要素の${property}プロパティが既に新しいスタッキングコンテキストを生成しています。`,
};

/**
 * 冗長なisolation: isolate宣言を検出するルール
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

    // 次に、isolation: isolateを持つ要素をチェック
    root.walkRules((rule) => {
      const selector = rule.selector;
      const properties = elementProperties[selector] || {};

      // isolation: isolateを持ち、他のプロパティで既にスタッキングコンテキストを生成している場合
      if (
        properties.isolation === "isolate" &&
        alreadyCreatesStackingContext(properties)
      ) {
        // スタッキングコンテキストを生成している他のプロパティを見つける
        let triggeringProperty = "";

        if (
          properties.position &&
          ["relative", "absolute", "fixed", "sticky"].includes(
            properties.position,
          ) &&
          properties["z-index"] !== undefined &&
          properties["z-index"] !== "auto"
        ) {
          triggeringProperty = `position: ${properties.position}と併用されているz-index: ${properties["z-index"]}`;
        } else if (
          properties.opacity !== undefined &&
          parseFloat(properties.opacity) < 1
        ) {
          triggeringProperty = `opacity: ${properties.opacity}`;
        } else if (
          properties.transform !== undefined &&
          properties.transform !== "none"
        ) {
          triggeringProperty = `transform: ${properties.transform}`;
        } else if (
          properties.filter !== undefined &&
          properties.filter !== "none"
        ) {
          triggeringProperty = `filter: ${properties.filter}`;
        } else if (
          properties["mix-blend-mode"] !== undefined &&
          properties["mix-blend-mode"] !== "normal"
        ) {
          triggeringProperty = `mix-blend-mode: ${properties["mix-blend-mode"]}`;
        } else if (properties.contain !== undefined) {
          triggeringProperty = `contain: ${properties.contain}`;
        } else if (properties["will-change"] !== undefined) {
          triggeringProperty = `will-change: ${properties["will-change"]}`;
        } else {
          // 他のプロパティが見つからない場合は一般的なメッセージ
          triggeringProperty = "他のプロパティ";
        }

        // isolation: isolate宣言を見つけて報告
        rule.walkDecls("isolation", (decl) => {
          if (decl.value === "isolate") {
            report({
              message: messages.rejected(triggeringProperty),
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
