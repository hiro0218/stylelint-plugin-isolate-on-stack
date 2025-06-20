/**
 * スタッキングコンテキストの検出と分析のためのユーティリティ関数
 */
import type { Declaration } from "postcss";
import { STACKING_CONTEXT_PROPERTIES } from "../types/index.js";

/**
 * CSS宣言がスタッキングコンテキストを生成するか判定
 *
 * @param decl - 検査対象のCSS宣言
 * @returns スタッキングコンテキストを生成する場合はtrue
 */
export function createsStackingContext(decl: Declaration): boolean {
  const { prop, value } = decl;

  // プロパティごとにスタッキングコンテキスト生成条件を確認
  switch (prop) {
    case "isolation": // isolation: isolateは明示的にスタッキングコンテキストを生成
      return value === "isolate";
    case "opacity": // 1未満の不透明度はスタッキングコンテキストを生成
      return parseFloat(value) < 1;
    case "transform":
    case "filter":
    case "backdrop-filter":
    case "perspective":
    case "clip-path":
    case "mask":
    case "mask-image":
    case "mask-border": // これらはnone以外の値でスタッキングコンテキストを生成
      return value !== "none";
    case "mix-blend-mode": // normal以外の混合モードでスタッキングコンテキストを生成
      return value !== "normal";
    case "contain": // 特定のcontain値でスタッキングコンテキストを生成
      return (
        value === "layout" ||
        value === "paint" ||
        value === "strict" ||
        value === "content"
      );
    case "will-change": { // 特定のプロパティを指定したwill-changeでスタッキングコンテキスト生成
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
 * position と z-index の組み合わせによるスタッキングコンテキスト生成を検出
 *
 * @param element - CSSプロパティを含むオブジェクト
 * @returns スタッキングコンテキストを生成する場合はtrue
 */
export function hasPositionAndZIndexStackingContext(
  element: Record<string, any>,
): boolean {
  // static以外のposition値と、auto以外のz-indexの組み合わせでスタッキングコンテキスト生成
  return (
    element.position &&
    ["relative", "absolute", "fixed", "sticky"].includes(element.position) &&
    element["z-index"] !== undefined &&
    element["z-index"] !== "auto"
  );
}

/**
 * FlexアイテムまたはGridアイテムのz-indexによるスタッキングコンテキスト生成を検出
 *
 * @param element - CSSプロパティを含むオブジェクト
 * @returns スタッキングコンテキストを生成する場合はtrue
 */
export function hasFlexOrGridItemZIndexStackingContext(
  element: Record<string, any>,
): boolean {
  // flexまたはgridコンテナ内の子要素でauto以外のz-indexを持つとスタッキングコンテキスト生成
  const parentDisplay = element.parentDisplay || "";
  return (
    (parentDisplay === "flex" || parentDisplay === "grid") &&
    element["z-index"] !== undefined &&
    element["z-index"] !== "auto"
  );
}

/**
 * z-index値を数値として解析
 *
 * @param decl - z-index宣言
 * @returns 数値化したz-index値、autoまたは無効な値の場合はnull
 */
export function getZIndexValue(decl: Declaration): number | null {
  if (decl.prop !== "z-index") return null;

  const value = decl.value;
  if (value === "auto") return null;

  const numValue = parseInt(value, 10);
  return isNaN(numValue) ? null : numValue;
}

/**
 * background-blend-modeとisolation: isolateの組み合わせが問題になるかを検出
 * isolation: isolateはbackground-blend-modeに影響しないため、無効な組み合わせとなる
 *
 * @param element - CSSプロパティを含むオブジェクト
 * @returns 無効な組み合わせの場合はtrue
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
 * 要素が既にスタッキングコンテキストを生成する条件を満たしているか検出
 *
 * @param element - CSSプロパティを含むオブジェクト
 * @returns 既にスタッキングコンテキストを生成する場合はtrue
 */
export function alreadyCreatesStackingContext(
  element: Record<string, any>,
): boolean {
  // positionとz-indexの組み合わせによるスタッキングコンテキスト
  if (hasPositionAndZIndexStackingContext(element)) return true;
  // flexまたはgridアイテムのz-indexによるスタッキングコンテキスト
  if (hasFlexOrGridItemZIndexStackingContext(element)) return true;

  // 他の様々なスタッキングコンテキスト生成プロパティをチェック
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

  // containプロパティによるスタッキングコンテキスト
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

  // will-changeプロパティによるスタッキングコンテキスト
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
