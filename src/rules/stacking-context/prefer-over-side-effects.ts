import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";
import { preferOverSideEffectsMessages } from "../../utils/message.js";

const ruleName = "stylelint-plugin-isolate-on-stack/prefer-over-side-effects";

const rule: Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    if (primary !== true) return;

    root.walkDecls((decl) => {
      const { prop, value } = decl;

      if (prop === "opacity" && parseFloat(value) >= 0.99 && parseFloat(value) < 1) {
        report({
          message: preferOverSideEffectsMessages.rejected,
          node: decl,
          result,
          ruleName,
        });
      }

      if (
        prop === "transform" &&
        (value === "translateZ(0)" ||
          value === "translate3d(0,0,0)" ||
          value === "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)")
      ) {
        report({
          message: preferOverSideEffectsMessages.rejected,
          node: decl,
          result,
          ruleName,
        });
      }

      if (
        prop === "will-change" &&
        (value.includes("opacity") || value.includes("transform") || value.includes("z-index"))
      ) {
        report({
          message: preferOverSideEffectsMessages.rejected,
          node: decl,
          result,
          ruleName,
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
rule.messages = preferOverSideEffectsMessages;

export default rule;
