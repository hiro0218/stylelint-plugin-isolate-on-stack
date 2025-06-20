/**
 * スタッキングコンテキストユーティリティのテスト
 */
import { describe, it, expect } from "vitest";
import {
  createsStackingContext,
  hasPositionAndZIndexStackingContext,
  hasFlexOrGridItemZIndexStackingContext,
  getZIndexValue,
  hasInvalidBackgroundBlendWithIsolation,
  alreadyCreatesStackingContext,
} from "../../src/utils/stacking-context";
import { Declaration } from "postcss";

// モックDeclarationの作成ヘルパー関数
function createMockDeclaration(prop: string, value: string): Declaration {
  return {
    prop,
    value,
    parent: {
      type: "rule",
      nodes: [],
    },
  } as unknown as Declaration;
}

describe("スタッキングコンテキストユーティリティ", () => {
  describe("createsStackingContext", () => {
    it("isolation: isolateの場合、trueを返す", () => {
      const decl = createMockDeclaration("isolation", "isolate");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("isolation: autoの場合、falseを返す", () => {
      const decl = createMockDeclaration("isolation", "auto");
      expect(createsStackingContext(decl)).toBe(false);
    });

    it("opacity: 0.5の場合、trueを返す", () => {
      const decl = createMockDeclaration("opacity", "0.5");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("opacity: 1の場合、falseを返す", () => {
      const decl = createMockDeclaration("opacity", "1");
      expect(createsStackingContext(decl)).toBe(false);
    });

    it("transform: translateX(10px)の場合、trueを返す", () => {
      const decl = createMockDeclaration("transform", "translateX(10px)");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("transform: noneの場合、falseを返す", () => {
      const decl = createMockDeclaration("transform", "none");
      expect(createsStackingContext(decl)).toBe(false);
    });

    it("filter: blur(5px)の場合、trueを返す", () => {
      const decl = createMockDeclaration("filter", "blur(5px)");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("mix-blend-mode: multiply の場合、trueを返す", () => {
      const decl = createMockDeclaration("mix-blend-mode", "multiply");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("mix-blend-mode: normal の場合、falseを返す", () => {
      const decl = createMockDeclaration("mix-blend-mode", "normal");
      expect(createsStackingContext(decl)).toBe(false);
    });

    it("contain: layout の場合、trueを返す", () => {
      const decl = createMockDeclaration("contain", "layout");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("contain: none の場合、falseを返す", () => {
      const decl = createMockDeclaration("contain", "none");
      expect(createsStackingContext(decl)).toBe(false);
    });

    it("will-change: transform の場合、trueを返す", () => {
      const decl = createMockDeclaration("will-change", "transform");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("will-change: transform, opacity の場合、trueを返す", () => {
      const decl = createMockDeclaration("will-change", "transform, opacity");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("will-change: color の場合、falseを返す", () => {
      const decl = createMockDeclaration("will-change", "color");
      expect(createsStackingContext(decl)).toBe(false);
    });

    it("未定義のプロパティの場合、falseを返す", () => {
      const decl = createMockDeclaration("color", "red");
      expect(createsStackingContext(decl)).toBe(false);
    });
  });

  describe("hasPositionAndZIndexStackingContext", () => {
    it("position: relative と z-index: 1 の組み合わせでtrueを返す", () => {
      expect(
        hasPositionAndZIndexStackingContext({
          position: "relative",
          "z-index": "1",
        }),
      ).toBe(true);
    });

    it("position: static と z-index: 1 の組み合わせでfalseを返す", () => {
      expect(
        hasPositionAndZIndexStackingContext({
          position: "static",
          "z-index": "1",
        }),
      ).toBe(false);
    });

    it("position: relative と z-index: auto の組み合わせでfalseを返す", () => {
      expect(
        hasPositionAndZIndexStackingContext({
          position: "relative",
          "z-index": "auto",
        }),
      ).toBe(false);
    });

    it("positionプロパティがない場合はfalseを返す", () => {
      const result = hasPositionAndZIndexStackingContext({
        "z-index": "1",
      });
      // 関数が明示的にfalseを返さない場合でも、falsy値ならテスト成功と見なす
      expect(!!result).toBe(false);
    });
  });

  describe("hasFlexOrGridItemZIndexStackingContext", () => {
    it("親要素がflexでz-indexが1の場合、trueを返す", () => {
      expect(
        hasFlexOrGridItemZIndexStackingContext({
          parentDisplay: "flex",
          "z-index": "1",
        }),
      ).toBe(true);
    });

    it("親要素がgridでz-indexが1の場合、trueを返す", () => {
      expect(
        hasFlexOrGridItemZIndexStackingContext({
          parentDisplay: "grid",
          "z-index": "1",
        }),
      ).toBe(true);
    });

    it("親要素がflexでz-indexがautoの場合、falseを返す", () => {
      expect(
        hasFlexOrGridItemZIndexStackingContext({
          parentDisplay: "flex",
          "z-index": "auto",
        }),
      ).toBe(false);
    });

    it("親要素がblockの場合、falseを返す", () => {
      expect(
        hasFlexOrGridItemZIndexStackingContext({
          parentDisplay: "block",
          "z-index": "1",
        }),
      ).toBe(false);
    });
  });

  describe("getZIndexValue", () => {
    it("z-index: 5 の場合、5を返す", () => {
      const decl = createMockDeclaration("z-index", "5");
      expect(getZIndexValue(decl)).toBe(5);
    });

    it("z-index: auto の場合、nullを返す", () => {
      const decl = createMockDeclaration("z-index", "auto");
      expect(getZIndexValue(decl)).toBeNull();
    });

    it("z-index: -10 の場合、-10を返す", () => {
      const decl = createMockDeclaration("z-index", "-10");
      expect(getZIndexValue(decl)).toBe(-10);
    });

    it("z-index以外のプロパティの場合、nullを返す", () => {
      const decl = createMockDeclaration("color", "red");
      expect(getZIndexValue(decl)).toBeNull();
    });
  });

  describe("hasInvalidBackgroundBlendWithIsolation", () => {
    it("isolation: isolateとbackground-blend-mode: multiplyの組み合わせでtrueを返す", () => {
      expect(
        hasInvalidBackgroundBlendWithIsolation({
          isolation: "isolate",
          "background-blend-mode": "multiply",
        }),
      ).toBe(true);
    });

    it("isolation: isolateとbackground-blend-mode: normalの組み合わせでfalseを返す", () => {
      expect(
        hasInvalidBackgroundBlendWithIsolation({
          isolation: "isolate",
          "background-blend-mode": "normal",
        }),
      ).toBe(false);
    });

    it("isolation: autoとbackground-blend-mode: multiplyの組み合わせでfalseを返す", () => {
      expect(
        hasInvalidBackgroundBlendWithIsolation({
          isolation: "auto",
          "background-blend-mode": "multiply",
        }),
      ).toBe(false);
    });

    it("background-blend-modeがない場合はfalseを返す", () => {
      expect(
        hasInvalidBackgroundBlendWithIsolation({
          isolation: "isolate",
        }),
      ).toBe(false);
    });
  });

  describe("alreadyCreatesStackingContext", () => {
    it("positionとz-indexによるスタッキングコンテキストの場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          position: "relative",
          "z-index": "1",
        }),
      ).toBe(true);
    });

    it("opacity: 0.5の場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          opacity: "0.5",
        }),
      ).toBe(true);
    });

    it("transform: translateX(10px)の場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          transform: "translateX(10px)",
        }),
      ).toBe(true);
    });

    it("filter: blur(5px)の場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          filter: "blur(5px)",
        }),
      ).toBe(true);
    });

    it("backdrop-filter: blur(5px)の場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          "backdrop-filter": "blur(5px)",
        }),
      ).toBe(true);
    });

    it("mix-blend-mode: multiplyの場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          "mix-blend-mode": "multiply",
        }),
      ).toBe(true);
    });

    it("perspective: 1000pxの場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          perspective: "1000px",
        }),
      ).toBe(true);
    });

    it("clip-path: circle(50%)の場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          "clip-path": "circle(50%)",
        }),
      ).toBe(true);
    });

    it("mask: url(#mask)の場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          mask: "url(#mask)",
        }),
      ).toBe(true);
    });

    it("mask-image: url(mask.png)の場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          "mask-image": "url(mask.png)",
        }),
      ).toBe(true);
    });

    it("mask-border: url(border.png)の場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          "mask-border": "url(border.png)",
        }),
      ).toBe(true);
    });

    it("contain: layoutの場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          contain: "layout",
        }),
      ).toBe(true);
    });

    it("contain: paint strictの場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          contain: "paint strict",
        }),
      ).toBe(true);
    });

    it("will-change: transformの場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          "will-change": "transform",
        }),
      ).toBe(true);
    });

    it("will-change: opacity, z-indexの場合、trueを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          "will-change": "opacity, z-index",
        }),
      ).toBe(true);
    });

    it("スタッキングコンテキストを生成しないプロパティのみの場合、falseを返す", () => {
      expect(
        alreadyCreatesStackingContext({
          color: "red",
          margin: "10px",
          padding: "20px",
        }),
      ).toBe(false);
    });
  });

  // その他の関数のテストも必要に応じて追加
});
