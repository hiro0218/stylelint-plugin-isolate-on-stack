/**
 * 無効なbackground-blend-modeとisolation: isolateの組み合わせを検出するルール
 *
 * isolation: isolateはbackground-blend-modeに影響しないため、
 * この2つのプロパティの組み合わせを検出して警告する
 */
import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";
import { collectElementProperties } from "../../utils/stacking-context.js";
import { ineffectiveOnBackgroundBlendMessages } from "../../utils/message.js";

const ruleName = "stylelint-plugin-isolate-on-stack/ineffective-on-background-blend";

const rule: Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    // プライマリオプションがtrueでない場合はスキップ
    if (primary !== true) return;

    // Map構造でプロパティを収集
    const elementProperties = collectElementProperties(root);

    // isolation: isolateとbackground-blend-modeの組み合わせをチェック
    root.walkRules((rule) => {
      const selector = rule.selector;
      const properties = elementProperties.get(selector);

      // プロパティが見つからなければスキップ
      if (!properties) return;

      // isolation: isolateとbackground-blend-modeを持っているか確認
      const isolationValue = properties.get("isolation");
      const blendModeValue = properties.get("background-blend-mode");

      if (isolationValue !== "isolate" || !blendModeValue || blendModeValue === "normal") return;

      // 無効な組み合わせが見つかった場合は報告
      rule.walkDecls("isolation", (decl) => {
        if (decl.value === "isolate") {
          report({
            message: ineffectiveOnBackgroundBlendMessages.rejected,
            node: decl,
            result,
            ruleName,
          });
        }
      });
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
rule.messages = ineffectiveOnBackgroundBlendMessages;

export default rule;
