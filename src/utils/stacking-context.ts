/**
 * スタッキングコンテキスト関連のユーティリティ関数
 */
import type { Declaration } from "postcss";
import { STACKING_CONTEXT_PROPERTIES } from "../types/index.js";

/**
 * スタッキングコンテキストを生成する条件をチェックする
 *
 * @param decl - チェック対象のCSS宣言
 * @returns スタッキングコンテキストを生成するかどうか
 */
export function createsStackingContext(decl: Declaration): boolean {
  const { prop, value } = decl;

  // 直接的にスタッキングコンテキストを生成するプロパティ
  switch (prop) {
    case "isolation":
      return value === "isolate";
    case "opacity":
      return parseFloat(value) < 1;
    case "transform":
    case "filter":
    case "backdrop-filter":
    case "perspective":
    case "clip-path":
    case "mask":
    case "mask-image":
    case "mask-border":
      return value !== "none";
    case "mix-blend-mode":
      return value !== "normal";
    case "contain":
      return (
        value === "layout" ||
        value === "paint" ||
        value === "strict" ||
        value === "content"
      );
    case "will-change": {
      // will-changeがスタッキングコンテキストを生成するプロパティを参照しているかチェック
      const willChangeValues = value.split(",").map((v) => v.trim());
      return willChangeValues.some(
        (v) =>
          STACKING_CONTEXT_PROPERTIES.includes(v as any) ||
          v === "opacity" ||
          v === "transform",
      );
    }
    default:
      return false;
  }
}

/**
 * position プロパティと z-index の組み合わせがスタッキングコンテキストを生成するかチェックする
 *
 * @param element - 対象のCSSルール
 * @returns スタッキングコンテキストを生成するかどうか
 */
export function hasPositionAndZIndexStackingContext(
  element: Record<string, any>,
): boolean {
  // position値が static 以外かつ z-index が auto 以外の場合
  return (
    element.position &&
    ["relative", "absolute", "fixed", "sticky"].includes(element.position) &&
    element["z-index"] !== undefined &&
    element["z-index"] !== "auto"
  );
}

/**
 * フレックスアイテムやグリッドアイテムの z-index がスタッキングコンテキストを生成するかチェックする
 *
 * @param element - 対象のCSSルール
 * @returns スタッキングコンテキストを生成するかどうか
 */
export function hasFlexOrGridItemZIndexStackingContext(
  element: Record<string, any>,
): boolean {
  // flexまたはgridのアイテムで z-index が auto 以外の場合
  const parentDisplay = element.parentDisplay || "";
  return (
    (parentDisplay === "flex" || parentDisplay === "grid") &&
    element["z-index"] !== undefined &&
    element["z-index"] !== "auto"
  );
}

/**
 * z-index値を数値として取得する
 *
 * @param decl - z-index宣言
 * @returns 数値化したz-index値、変換できない場合はnull
 */
export function getZIndexValue(decl: Declaration): number | null {
  if (decl.prop !== "z-index") return null;

  const value = decl.value;
  if (value === "auto") return null;

  const numValue = parseInt(value, 10);
  return isNaN(numValue) ? null : numValue;
}

/**
 * background-blend-modeとisolation: isolateの組み合わせが無効かチェックする
 *
 * @param element - 対象のCSSルール
 * @returns 無効な組み合わせかどうか
 */
export function hasInvalidBackgroundBlendWithIsolation(
  element: Record<string, any>,
): boolean {
  return (
    element.isolation === "isolate" &&
    element["background-blend-mode"] !== undefined &&
    element["background-blend-mode"] !== "normal"
  );
}

/**
 * 要素がすでにスタッキングコンテキストを生成しているかチェックする
 *
 * @param element - 対象のCSSルール
 * @returns すでにスタッキングコンテキストを生成しているかどうか
 */
export function alreadyCreatesStackingContext(
  element: Record<string, any>,
): boolean {
  // 各種スタッキングコンテキスト生成条件をチェック
  if (hasPositionAndZIndexStackingContext(element)) return true;
  if (hasFlexOrGridItemZIndexStackingContext(element)) return true;

  // その他のプロパティのチェック
  if (element.opacity !== undefined && parseFloat(element.opacity) < 1)
    return true;
  if (element.transform !== undefined && element.transform !== "none")
    return true;
  if (element.filter !== undefined && element.filter !== "none") return true;
  if (
    element["backdrop-filter"] !== undefined &&
    element["backdrop-filter"] !== "none"
  )
    return true;
  if (
    element["mix-blend-mode"] !== undefined &&
    element["mix-blend-mode"] !== "normal"
  )
    return true;
  if (element.perspective !== undefined && element.perspective !== "none")
    return true;
  if (element["clip-path"] !== undefined && element["clip-path"] !== "none")
    return true;
  if (element.mask !== undefined && element.mask !== "none") return true;
  if (element["mask-image"] !== undefined && element["mask-image"] !== "none")
    return true;
  if (element["mask-border"] !== undefined && element["mask-border"] !== "none")
    return true;

  // contain プロパティのチェック
  if (element.contain !== undefined) {
    const containValues = element.contain
      .split(" ")
      .map((v: string) => v.trim());
    if (
      containValues.includes("layout") ||
      containValues.includes("paint") ||
      containValues.includes("strict") ||
      containValues.includes("content")
    ) {
      return true;
    }
  }

  // will-change プロパティのチェック
  if (element["will-change"] !== undefined) {
    const willChangeValues = element["will-change"]
      .split(",")
      .map((v: string) => v.trim());
    if (
      willChangeValues.some(
        (v: string) =>
          STACKING_CONTEXT_PROPERTIES.includes(v as any) ||
          v === "opacity" ||
          v === "transform",
      )
    ) {
      return true;
    }
  }

  return false;
}
