/**
 * 冗長なisolation: isolate宣言を検出するルール
 *
 * 既に他のプロパティでスタッキングコンテキストが生成されている場合に
 * 不要なisolation: isolate宣言を検出し警告する
 */
import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";
import { alreadyCreatesStackingContext } from "../../utils/stacking-context.js";

const ruleName = "stylelint-plugin-isolate-on-stack/no-redundant-declaration";

const messages = {
  rejected: "冗長なisolation: isolateです。他のスタッキングコンテキスト作成プロパティが存在しない場合は不要です。",
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

    // isolation: isolateを持つ要素をチェック
    root.walkRules((rule) => {
      const selector = rule.selector;
      const properties = elementProperties[selector] || {};

      // isolation: isolateを持ち、他のプロパティで既にスタッキングコンテキストを生成している場合
      if (properties.isolation === "isolate" && alreadyCreatesStackingContext(properties)) {
        // スタッキングコンテキストを生成している他のプロパティを特定
        let triggeringProperty = "";

        if (
          properties.position &&
          ["relative", "absolute", "fixed", "sticky"].includes(properties.position) &&
          properties["z-index"] !== undefined &&
          properties["z-index"] !== "auto"
        ) {
          triggeringProperty = `position: ${properties.position}と併用されているz-index: ${properties["z-index"]}`;
        } else if (properties.opacity !== undefined && parseFloat(properties.opacity) < 1) {
          triggeringProperty = `opacity: ${properties.opacity}`;
        } else if (properties.transform !== undefined && properties.transform !== "none") {
          triggeringProperty = `transform: ${properties.transform}`;
        } else if (properties.filter !== undefined && properties.filter !== "none") {
          triggeringProperty = `filter: ${properties.filter}`;
        } else if (properties["mix-blend-mode"] !== undefined && properties["mix-blend-mode"] !== "normal") {
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
  result: any; // PostCSS Result
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
