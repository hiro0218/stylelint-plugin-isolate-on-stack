import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule, Root } from "postcss";
import { alreadyCreatesStackingContext, collectElementProperties } from "../../utils/stacking-context.js";
import { noRedundantDeclarationMessages } from "../../utils/message.js";

export const ruleName = "stylelint-plugin-isolate-on-stack/no-redundant-declaration";

/**
 * Reporting utility function
 */
export function report({
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

/**
 * Function to check for redundant isolation: isolate declarations
 * Detects when other properties already create a stacking context
 *
 * @param root - CSS root node
 * @param result - Stylelint result object
 */
export function checkRedundantIsolation(root: Root, result: any): void {
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
}

/**
 * Rule to detect redundant isolation: isolate declarations
 * Flags when properties other than isolation already create a stacking context
 */
const rule: Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    if (primary !== true) return;

    checkRedundantIsolation(root, result);
  };
};

rule.ruleName = ruleName;
rule.messages = noRedundantDeclarationMessages;

export default rule;
