/**
 * スタッキングコンテキスト関連の型定義
 */

import type { Declaration, Rule as PostCSSRule } from "postcss";
import type { Rule } from "stylelint";

/**
 * スタッキングコンテキストを生成するCSSプロパティ一覧
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

export type StackingContextProperty = (typeof STACKING_CONTEXT_PROPERTIES)[number];

/**
 * プラグインルールのオプション設定
 */
export interface RuleOptions {
  severity?: "error" | "warning";
  maxZIndex?: number;
  allowedProperties?: string[];
  ignoreSelectors?: string[];
}

/**
 * Stylelintレポート関数の引数型
 */
export interface ReportFunctionParams {
  message: string;
  node: PostCSSRule | Declaration;
  result: any; // PostCSS Result
  ruleName: string;
}

export type ReportFunction = (params: ReportFunctionParams) => void;

/**
 * ルールのエラーメッセージ定義
 */
export interface RuleMessages {
  [key: string]: string;
  expected: string;
  rejected: string;
}

/**
 * Stylelintプラグインルール型
 */
export interface PluginRule extends Rule<boolean | [boolean, RuleOptions]> {
  ruleName: string;
  messages: RuleMessages;
}
