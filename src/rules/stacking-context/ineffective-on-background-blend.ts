import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule, Root } from "postcss";
import { collectElementProperties } from "../../utils/stacking-context.js";
import { ineffectiveOnBackgroundBlendMessages } from "../../utils/message.js";

export const ruleName = "stylelint-plugin-isolate-on-stack/ineffective-on-background-blend";

/**
 * Function to report violations
 */
export function report({
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

/**
 * Check for ineffective combinations of isolation: isolate and background blend modes
 * Error when isolation: isolate is used with background-blend-mode as it has no effect
 */
export function checkIneffectiveIsolation(root: Root, result: any): void {
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
}

/**
 * Rule to detect ineffective combinations of isolation: isolate and background blend modes
 * As new stacking contexts have no effect on background-blend-mode
 */
const rule: Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    if (primary !== true) return;

    checkIneffectiveIsolation(root, result);
  };
};

rule.ruleName = ruleName;
rule.messages = ineffectiveOnBackgroundBlendMessages;

export default rule;
