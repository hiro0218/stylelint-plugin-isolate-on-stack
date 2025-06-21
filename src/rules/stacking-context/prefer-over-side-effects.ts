import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule, Root } from "postcss";
import { preferOverSideEffectsMessages } from "../../utils/message.js";

export const ruleName = "stylelint-plugin-isolate-on-stack/prefer-over-side-effects";

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
 * Checks if a declaration is a hack to generate a stacking context
 * @param decl Declaration
 * @returns true if it's a hack
 */
export function isStackingContextHack(decl: Declaration): boolean {
  const { prop, value } = decl;

  if (prop === "opacity" && parseFloat(value) >= 0.99 && parseFloat(value) < 1) {
    return true;
  }

  if (
    prop === "transform" &&
    (value === "translateZ(0)" ||
      value === "translate3d(0,0,0)" ||
      value === "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)")
  ) {
    return true;
  }

  if (
    prop === "will-change" &&
    (value.includes("opacity") || value.includes("transform") || value.includes("z-index"))
  ) {
    return true;
  }

  return false;
}

/**
 * Check for hacks that create stacking contexts
 * Warns when properties with side effects are used to create stacking contexts
 * instead of the explicit isolation: isolate
 */
export function checkStackingContextHacks(root: Root, result: any): void {
  root.walkDecls((decl) => {
    if (isStackingContextHack(decl)) {
      report({
        message: preferOverSideEffectsMessages.rejected,
        node: decl,
        result,
        ruleName,
      });
    }
  });
}

/**
 * Rule to detect hacks that create stacking contexts
 * Properties with side effects should not be used instead of isolation: isolate
 */
const rule: Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    if (primary !== true) return;

    checkStackingContextHacks(root, result);
  };
};

rule.ruleName = ruleName;
rule.messages = preferOverSideEffectsMessages;

export default rule;
