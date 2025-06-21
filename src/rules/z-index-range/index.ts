import { Rule } from "stylelint";
import { Declaration } from "postcss";
import { getZIndexValue } from "../../utils/stacking-context.js";
import { zIndexRangeMessages } from "../../utils/message.js";
import type { RuleOptions } from "../../types/index.js";

const ruleName = "stylelint-plugin-isolate-on-stack/z-index-range";

const rule: Rule<boolean | [boolean, RuleOptions]> = (primary, secondaryOptions) => {
  return (root, result) => {
    if (primary !== true) return;

    const options = Array.isArray(primary) && primary.length > 1 && primary[1] ? primary[1] : secondaryOptions || {};
    const maxZIndex = options.maxZIndex !== undefined ? options.maxZIndex : 100;

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
  };
};

function report({
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

rule.ruleName = ruleName;
rule.messages = zIndexRangeMessages;

export default rule;
