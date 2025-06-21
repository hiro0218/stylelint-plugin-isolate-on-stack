import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";
import { collectElementProperties } from "../../utils/stacking-context.js";
import { ineffectiveOnBackgroundBlendMessages } from "../../utils/message.js";

const ruleName = "stylelint-plugin-isolate-on-stack/ineffective-on-background-blend";

const rule: Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    if (primary !== true) return;

    const elementProperties = collectElementProperties(root);

    root.walkRules((rule) => {
      const selector = rule.selector;
      const properties = elementProperties.get(selector);

      if (!properties) return;

      const isolationValue = properties.get("isolation");
      const blendModeValue = properties.get("background-blend-mode");

      if (isolationValue !== "isolate" || !blendModeValue || blendModeValue === "normal") return;

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
