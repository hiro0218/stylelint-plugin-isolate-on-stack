import type { Declaration, Rule as PostCSSRule } from "postcss";
import type { Rule } from "stylelint";

/**
 * CSS properties that create stacking contexts
 * These properties are used to determine if an element creates a stacking context
 */
export const STACKING_CONTEXT_PROPERTIES = [
  "position",
  "opacity",
  "transform",
  "filter",
  "isolation",
  "mix-blend-mode",
  "contain",
  "will-change",
  "perspective",
  "clip-path",
  "mask",
  "mask-image",
  "mask-border",
  "z-index",
] as const;

/**
 * Set for O(1) lookups of stacking context properties
 */
export const STACKING_CONTEXT_PROPERTIES_SET = new Set<string>(STACKING_CONTEXT_PROPERTIES);

export type StackingContextProperty = (typeof STACKING_CONTEXT_PROPERTIES)[number];

/**
 * Configuration options for plugin rules
 */
export interface RuleOptions {
  severity?: "error" | "warning";
  maxZIndex?: number;
  maxDescendantCount?: number;
  allowedProperties?: string[];
  ignoreSelectors?: string[];
}

/**
 * Parameters for the report function used in Stylelint rules
 */
export interface ReportFunctionParams {
  message: string;
  node: PostCSSRule | Declaration;
  result: any; // PostCSS Result
  ruleName: string;
}

export type ReportFunction = (params: ReportFunctionParams) => void;

/**
 * Error messages definition for Stylelint rules
 */
export interface RuleMessages {
  [key: string]: string;
  expected: string;
  rejected: string;
}

/**
 * Extended Stylelint plugin rule type with added properties
 */
export interface PluginRule extends Rule<boolean | [boolean, RuleOptions]> {
  ruleName: string;
  messages: RuleMessages;
}
