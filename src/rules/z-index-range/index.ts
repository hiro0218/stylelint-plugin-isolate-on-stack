import { Rule } from "stylelint";
import { Declaration, Root } from "postcss";
import { getZIndexValue } from "../../utils/stacking-context.js";
import { zIndexRangeMessages } from "../../utils/message.js";
import type { RuleOptions } from "../../types/index.js";

export const ruleName = "stylelint-plugin-isolate-on-stack/z-index-range";

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
  node: Declaration;
  result: any;
  ruleName: string;
}) {
  result.warn(message, {
    node,
    ruleName,
  });
}

export const DEFAULT_MAX_Z_INDEX = 100;

/**
 * Check if z-index values are within an acceptable range
 * @param root CSS root node
 * @param result Stylelint result object
 * @param maxZIndex Maximum allowed z-index value
 */
export function checkZIndexRange(root: Root, result: any, maxZIndex: number = DEFAULT_MAX_Z_INDEX): void {
  root.walkDecls("z-index", (decl) => {
    const zIndexValue = getZIndexValue(decl);

    if (zIndexValue !== null && zIndexValue > maxZIndex) {
      report({
        message: zIndexRangeMessages.rejected(zIndexValue, maxZIndex),
        node: decl,
        result,
        ruleName,
      });
    }
  });
}

/**
 * Rule to check if z-index values are within an acceptable range
 * Excessively large z-index values are difficult to manage and create unclear priorities
 */
const rule: Rule<boolean | [boolean, RuleOptions]> = (primary, secondaryOptions) => {
  return (root, result) => {
    if (primary !== true) return;

    const options = Array.isArray(primary) && primary.length > 1 && primary[1] ? primary[1] : secondaryOptions || {};
    const maxZIndex = options.maxZIndex !== undefined ? options.maxZIndex : DEFAULT_MAX_Z_INDEX;

    checkZIndexRange(root, result, maxZIndex);
  };
};

rule.ruleName = ruleName;
rule.messages = zIndexRangeMessages;

export default rule;
