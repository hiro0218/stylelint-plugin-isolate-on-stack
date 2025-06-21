import type { Declaration } from "postcss";
import { STACKING_CONTEXT_PROPERTIES, STACKING_CONTEXT_PROPERTIES_SET } from "../types/index.js";

// containプロパティの有効値セットを関数外で定義し、毎回再生成しないようにする
const VALID_CONTAIN_VALUES = new Set(["layout", "paint", "strict", "content"]);

/**
 * Determines if a CSS declaration creates a stacking context
 *
 * @param decl - CSS declaration to check
 * @returns true if the declaration creates a stacking context
 */
export function createsStackingContext(decl: Declaration): boolean {
  const { prop, value } = decl;

  if (prop === "isolation") {
    return value === "isolate";
  }

  if (prop === "transform") {
    return value !== "none";
  }

  if (prop === "opacity") {
    return parseFloat(value) < 1;
  }

  const noneCheckProps = ["filter", "backdrop-filter", "perspective", "clip-path", "mask", "mask-image", "mask-border"];
  if (noneCheckProps.includes(prop)) {
    return value !== "none";
  }

  if (prop === "mix-blend-mode") {
    return value !== "normal";
  }

  // Check for contain property values that create stacking contexts
  if (prop === "contain") {
    const containValues = value.split(" ").map((v) => v.trim());
    return containValues.some((v: string) => VALID_CONTAIN_VALUES.has(v));
  }

  // Check if will-change references properties that create stacking contexts
  if (prop === "will-change") {
    const stackingProps = new Set([...STACKING_CONTEXT_PROPERTIES, "opacity", "transform"]);
    const willChangeValues = value.split(",").map((v) => v.trim());
    return willChangeValues.some((v: string) => stackingProps.has(v));
  }

  return false;
}

/**
 * Detects stacking context creation from position and z-index combination
 *
 * @param element - Object containing CSS properties
 * @returns true if the element creates a stacking context via position and z-index
 */
export function hasPositionAndZIndexStackingContext(element: Record<string, any>): boolean {
  // Positioned elements (except static) with z-index other than auto create stacking contexts
  return (
    element.position &&
    ["relative", "absolute", "fixed", "sticky"].includes(element.position) &&
    element["z-index"] !== undefined &&
    element["z-index"] !== "auto"
  );
}

/**
 * Detects stacking context creation from z-index on flex or grid items
 *
 * @param element - Object containing CSS properties
 * @returns true if the element creates a stacking context as a flex/grid item with z-index
 */
export function hasFlexOrGridItemZIndexStackingContext(element: Record<string, any>): boolean {
  // Child elements of flex/grid containers with z-index other than auto create stacking contexts
  const parentDisplay = element.parentDisplay || "";
  return (
    (parentDisplay === "flex" || parentDisplay === "grid") &&
    element["z-index"] !== undefined &&
    element["z-index"] !== "auto"
  );
}

/**
 * Parses z-index value to a number
 *
 * @param decl - z-index declaration
 * @returns numeric z-index value, or null for 'auto' or invalid values
 */
export function getZIndexValue(decl: Declaration): number | null {
  if (decl.prop !== "z-index") return null;

  const value = decl.value;
  if (value === "auto") return null;

  const numValue = parseInt(value, 10);
  return isNaN(numValue) ? null : numValue;
}

/**
 * Detects invalid combinations of background-blend-mode and isolation: isolate
 * isolation: isolate has no effect on background-blend-mode, making this an ineffective combination
 *
 * @param element - Object containing CSS properties
 * @returns true if there's an ineffective combination
 */
export function hasInvalidBackgroundBlendWithIsolation(element: Record<string, any>): boolean {
  return (
    element.isolation === "isolate" &&
    element["background-blend-mode"] !== undefined &&
    element["background-blend-mode"] !== "normal"
  );
}

/**
 * Detects if an element already meets conditions to generate a stacking context
 *
 * @param element - Object containing CSS properties
 * @returns true if the element already creates a stacking context
 */
export function alreadyCreatesStackingContext(element: Record<string, any>): boolean {
  // 1. position + z-index combination
  if (
    element.position &&
    ["relative", "absolute", "fixed", "sticky"].includes(element.position) &&
    element["z-index"] !== undefined &&
    element["z-index"] !== "auto"
  ) {
    return true;
  }

  // 2. transform
  if (element.transform !== undefined && element.transform !== "none") return true;

  // 3. opacity < 1
  if (element.opacity !== undefined && parseFloat(element.opacity) < 1) return true;

  // 4. filter properties
  if (element.filter !== undefined && element.filter !== "none") return true;
  if (element["backdrop-filter"] !== undefined && element["backdrop-filter"] !== "none") return true;

  // 5. mix-blend-mode
  if (element["mix-blend-mode"] !== undefined && element["mix-blend-mode"] !== "normal") return true;

  // 6. flex/grid item with z-index
  if (hasFlexOrGridItemZIndexStackingContext(element)) return true;

  // 7. Other properties
  if (element.perspective !== undefined && element.perspective !== "none") return true;
  if (element["clip-path"] !== undefined && element["clip-path"] !== "none") return true;

  // Process mask-related properties together
  const maskProps = ["mask", "mask-image", "mask-border"];
  for (const prop of maskProps) {
    if (element[prop] !== undefined && element[prop] !== "none") return true;
  } // Stacking context from contain property
  if (element.contain !== undefined) {
    const containValues = element.contain.split(" ").map((v: string) => v.trim());
    if (containValues.some((value: string) => VALID_CONTAIN_VALUES.has(value))) {
      return true;
    }
  }

  // Stacking context from will-change property
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
 * Collects all declarations within rules
 *
 * @param root - CSS root node
 * @returns Map of properties for each selector
 */
export function collectElementProperties(root: any): Map<string, Map<string, string>> {
  const elementProperties = new Map<string, Map<string, string>>();

  // Collect all declarations and build property maps for each element
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
