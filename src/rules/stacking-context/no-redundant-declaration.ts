import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";
import { alreadyCreatesStackingContext, collectElementProperties } from "../../utils/stacking-context.js";
import { noRedundantDeclarationMessages } from "../../utils/message.js";

const ruleName = "stylelint-plugin-isolate-on-stack/no-redundant-declaration";

/**
 * Rule to detect redundant 'isolation: isolate' declarations
 * Flags when isolation is used but other properties already create a stacking context
 */
const rule: Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    if (primary !== true) return;

    const elementProperties = collectElementProperties(root);

    root.walkRules((rule) => {
      const selector = rule.selector;
      const properties = elementProperties.get(selector);

      if (!properties) return;

      const isolationValue = properties.get("isolation");
      if (isolationValue !== "isolate") return;

      // Convert Map to Record for compatibility with stacking context utility functions
      const propsRecord: Record<string, any> = {};
      properties.forEach((value, key) => {
        propsRecord[key] = value;
      });

      // Check if other properties already create a stacking context
      if (alreadyCreatesStackingContext(propsRecord)) {
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
 * Reports rule violations to Stylelint
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
