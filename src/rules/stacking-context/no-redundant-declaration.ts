/**
 * 冗長なisolation: isolate宣言を検出するルール
 *
 * 既に他のプロパティでスタッキングコンテキストが生成されている場合に
 * 不要なisolation: isolate宣言を検出し警告する
 */
import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";
import { alreadyCreatesStackingContext, collectElementProperties } from "../../utils/stacking-context.js";
import { noRedundantDeclarationMessages } from "../../utils/message.js";

const ruleName = "stylelint-plugin-isolate-on-stack/no-redundant-declaration";

const rule: Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    // プライマリオプションがtrueでない場合はスキップ
    if (primary !== true) return;

    // Map構造でプロパティを収集
    const elementProperties = collectElementProperties(root);

    // isolation: isolateを持つ要素をチェック
    root.walkRules((rule) => {
      const selector = rule.selector;
      const properties = elementProperties.get(selector);

      // プロパティが見つからなければスキップ
      if (!properties) return;

      // isolation: isolateを持っているか確認
      const isolationValue = properties.get("isolation");
      if (isolationValue !== "isolate") return;

      // プロパティをRecord形式に変換（既存関数との互換性のため）
      const propsRecord: Record<string, any> = {};
      properties.forEach((value, key) => {
        propsRecord[key] = value;
      });

      // 他のプロパティで既にスタッキングコンテキストが生成されている場合
      if (alreadyCreatesStackingContext(propsRecord)) {
        // 違反を報告
        rule.walkDecls("isolation", (decl) => {
          if (decl.value === "isolate") {
            report({
              message: noRedundantDeclarationMessages.rejected,
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
rule.messages = noRedundantDeclarationMessages;

export default rule;
