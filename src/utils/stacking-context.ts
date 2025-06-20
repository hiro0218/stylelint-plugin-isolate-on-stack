/**
 * スタッキングコンテキストの検出と分析のためのユーティリティ関数
 */
import type { Declaration } from "postcss";
import { STACKING_CONTEXT_PROPERTIES, STACKING_CONTEXT_PROPERTIES_SET } from "../types/index.js";

/**
 * CSS宣言がスタッキングコンテキストを生成するか判定
 *
 * @param decl - 検査対象のCSS宣言
 * @returns スタッキングコンテキストを生成する場合はtrue
 */
export function createsStackingContext(decl: Declaration): boolean {
  const { prop, value } = decl;

  // isolation: isolateは明示的なスタッキングコンテキスト生成
  if (prop === "isolation") {
    return value === "isolate";
  }

  // transform
  if (prop === "transform") {
    return value !== "none";
  }

  // opacity
  if (prop === "opacity") {
    return parseFloat(value) < 1;
  }

  // これらのプロパティは共通の条件：none以外の値
  const noneCheckProps = ["filter", "backdrop-filter", "perspective", "clip-path", "mask", "mask-image", "mask-border"];
  if (noneCheckProps.includes(prop)) {
    return value !== "none";
  }

  // mix-blend-modeはnormal以外の値でスタッキングコンテキスト生成
  if (prop === "mix-blend-mode") {
    return value !== "normal";
  }

  // containは特定の値の場合
  if (prop === "contain") {
    const validContainValues = new Set(["layout", "paint", "strict", "content"]);
    const containValues = value.split(" ").map(v => v.trim());
    return containValues.some((v: string) => validContainValues.has(v));
  }

  // will-change
  if (prop === "will-change") {
    const stackingProps = new Set([...STACKING_CONTEXT_PROPERTIES, "opacity", "transform"]);
    const willChangeValues = value.split(",").map(v => v.trim());
    return willChangeValues.some((v: string) => stackingProps.has(v));
  }

  return false;
}

/**
 * position と z-index の組み合わせによるスタッキングコンテキスト生成を検出
 *
 * @param element - CSSプロパティを含むオブジェクト
 * @returns スタッキングコンテキストを生成する場合はtrue
 */
export function hasPositionAndZIndexStackingContext(element: Record<string, any>): boolean {
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
export function hasFlexOrGridItemZIndexStackingContext(element: Record<string, any>): boolean {
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
export function hasInvalidBackgroundBlendWithIsolation(element: Record<string, any>): boolean {
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
export function alreadyCreatesStackingContext(element: Record<string, any>): boolean {
  // 1. position + z-index の組み合わせ
  if (element.position &&
    ["relative", "absolute", "fixed", "sticky"].includes(element.position) &&
    element["z-index"] !== undefined &&
    element["z-index"] !== "auto") {
    return true;
  }

  // 2. transform
  if (element.transform !== undefined && element.transform !== "none") return true;

  // 3. opacity < 1
  if (element.opacity !== undefined && parseFloat(element.opacity) < 1) return true;

  // 4. filter系
  if (element.filter !== undefined && element.filter !== "none") return true;
  if (element["backdrop-filter"] !== undefined && element["backdrop-filter"] !== "none") return true;

  // 5. mix-blend-mode
  if (element["mix-blend-mode"] !== undefined && element["mix-blend-mode"] !== "normal") return true;

  // 6. flex/gridアイテムのz-index
  if (hasFlexOrGridItemZIndexStackingContext(element)) return true;

  // 7. その他のプロパティ
  if (element.perspective !== undefined && element.perspective !== "none") return true;
  if (element["clip-path"] !== undefined && element["clip-path"] !== "none") return true;

  // マスク関連のプロパティをまとめて処理
  const maskProps = ["mask", "mask-image", "mask-border"];
  for (const prop of maskProps) {
    if (element[prop] !== undefined && element[prop] !== "none") return true;
  }    // containプロパティによるスタッキングコンテキスト
  if (element.contain !== undefined) {
    const validContainValues = new Set(["layout", "paint", "strict", "content"]);
    const containValues = element.contain.split(" ").map((v: string) => v.trim());
    if (containValues.some((value: string) => validContainValues.has(value))) {
      return true;
    }
  }

  // will-changeプロパティによるスタッキングコンテキスト
  if (element["will-change"] !== undefined) {
    const stackingProps = new Set(["opacity", "transform"]);
    const willChangeValues = element["will-change"].split(",").map((v: string) => v.trim());
    if (willChangeValues.some((v: string) => STACKING_CONTEXT_PROPERTIES_SET.has(v) || stackingProps.has(v))) {
      return true;
    }
  }

  return false;
}

/**
 * ルール内のすべての宣言を収集する
 *
 * @param root - CSSルートノード
 * @returns セレクタごとのプロパティマップ
 */
export function collectElementProperties(root: any): Map<string, Map<string, string>> {
  const elementProperties = new Map<string, Map<string, string>>();

  // すべての宣言を収集して各要素のプロパティマップを構築
  root.walkRules((rule: any) => {
    const selector = rule.selector;

    if (!elementProperties.has(selector)) {
      elementProperties.set(selector, new Map<string, string>());
    }

    const properties = elementProperties.get(selector)!;

    rule.walkDecls((decl: Declaration) => {
      properties.set(decl.prop, decl.value);
    });
  });

  return elementProperties;
}
