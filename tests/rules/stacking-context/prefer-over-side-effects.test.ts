import { testRule } from "../../utils/custom-test-rule";
import rule, {
  ruleName as importedRuleName,
  report,
  isStackingContextHack,
  checkStackingContextHacks,
} from "../../../src/rules/stacking-context/prefer-over-side-effects";
import { preferOverSideEffectsMessages } from "../../../src/utils/message";
import { describe, it, expect, vi } from "vitest";
import postcss from "postcss";
import Root from "postcss/lib/root";
import Declaration from "postcss/lib/declaration";
import Rule from "postcss/lib/rule";

const { ruleName } = rule;

// 既存のtestRuleコードはそのまま
testRule({
  plugins: [process.cwd()],
  ruleName,
  config: true,

  accept: [
    {
      code: ".valid { opacity: 0.5; }",
      description: "Intentionally used opacity",
    },
    {
      code: ".valid { opacity: 1; }",
      description: "Full opacity has no side effects",
    },
    {
      code: ".valid { transform: translateX(10px); }",
      description: "Intentionally used transform",
    },
    {
      code: ".valid { will-change: width, height; }",
      description: "will-change that doesn't generate stacking context",
    },
    {
      code: ".valid { isolation: isolate; }",
      description: "Explicit use of isolation: isolate",
    },
  ],

  reject: [
    {
      code: ".invalid { opacity: 0.999; }",
      description: "Using opacity value that is nearly opaque to create a stacking context",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { transform: translateZ(0); }",
      description: "Creating stacking context with transform hack",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { transform: translate3d(0,0,0); }",
      description: "Creating stacking context with transform 3D hack",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { will-change: opacity; }",
      description: "Using will-change for opacity",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { will-change: transform; }",
      description: "Using will-change for transform",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { will-change: z-index; }",
      description: "Using will-change for z-index",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
  ],
});

// falsyな設定値でのルールテストケース
testRule({
  plugins: [process.cwd()],
  ruleName,
  config: false,

  accept: [
    {
      code: ".invalid { opacity: 0.999; }",
      description: "When config is false, even hacks should be accepted",
    },
  ],
});

testRule({
  plugins: [process.cwd()],
  ruleName,
  config: null,

  accept: [
    {
      code: ".invalid { transform: translateZ(0); }",
      description: "When config is null, even hacks should be accepted",
    },
  ],
});

// 新しいユニットテスト
describe("prefer-over-side-effects unit tests", () => {
  describe("report function", () => {
    it("should call result.warn with correct parameters", () => {
      // モックを作成
      const result = {
        warn: vi.fn(),
      };

      const node = new Declaration({ prop: "opacity", value: "0.999" });
      const message = "Test message";

      // 関数を実行
      report({
        message,
        node,
        result,
        ruleName: importedRuleName,
      });

      // 期待される結果
      expect(result.warn).toHaveBeenCalledWith(message, {
        node,
        ruleName: importedRuleName,
      });
    });
  });

  describe("isStackingContextHack function", () => {
    it("should detect opacity hack", () => {
      const opacityHack = new Declaration({ prop: "opacity", value: "0.999" });
      expect(isStackingContextHack(opacityHack)).toBe(true);

      const validOpacity = new Declaration({ prop: "opacity", value: "0.5" });
      expect(isStackingContextHack(validOpacity)).toBe(false);

      const fullOpacity = new Declaration({ prop: "opacity", value: "1" });
      expect(isStackingContextHack(fullOpacity)).toBe(false);
    });

    it("should detect transform hack", () => {
      const transformHack1 = new Declaration({ prop: "transform", value: "translateZ(0)" });
      expect(isStackingContextHack(transformHack1)).toBe(true);

      const transformHack2 = new Declaration({ prop: "transform", value: "translate3d(0,0,0)" });
      expect(isStackingContextHack(transformHack2)).toBe(true);

      const transformHack3 = new Declaration({
        prop: "transform",
        value: "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)",
      });
      expect(isStackingContextHack(transformHack3)).toBe(true);

      const validTransform = new Declaration({ prop: "transform", value: "translateX(10px)" });
      expect(isStackingContextHack(validTransform)).toBe(false);
    });

    it("should detect will-change hack", () => {
      const willChangeHack1 = new Declaration({ prop: "will-change", value: "opacity" });
      expect(isStackingContextHack(willChangeHack1)).toBe(true);

      const willChangeHack2 = new Declaration({ prop: "will-change", value: "transform" });
      expect(isStackingContextHack(willChangeHack2)).toBe(true);

      const willChangeHack3 = new Declaration({ prop: "will-change", value: "z-index" });
      expect(isStackingContextHack(willChangeHack3)).toBe(true);

      const validWillChange = new Declaration({ prop: "will-change", value: "width, height" });
      expect(isStackingContextHack(validWillChange)).toBe(false);
    });

    it("should return false for non-hack properties", () => {
      const isolation = new Declaration({ prop: "isolation", value: "isolate" });
      expect(isStackingContextHack(isolation)).toBe(false);

      const color = new Declaration({ prop: "color", value: "red" });
      expect(isStackingContextHack(color)).toBe(false);
    });
  });

  describe("checkStackingContextHacks function", () => {
    it("should not report when no declarations exist", () => {
      const root = new Root();
      const result = {
        warn: vi.fn(),
      };

      checkStackingContextHacks(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should not report for valid declarations", () => {
      const css = `.selector {
        opacity: 0.5;
        transform: translateX(10px);
        will-change: width, height;
      }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkStackingContextHacks(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should report opacity hack", () => {
      const css = `.selector { opacity: 0.999; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkStackingContextHacks(root, result);
      expect(result.warn).toHaveBeenCalled();
    });

    it("should report transform hack", () => {
      const css = `.selector { transform: translateZ(0); }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkStackingContextHacks(root, result);
      expect(result.warn).toHaveBeenCalled();
    });

    it("should report will-change hack", () => {
      const css = `.selector { will-change: opacity; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkStackingContextHacks(root, result);
      expect(result.warn).toHaveBeenCalled();
    });

    it("should handle multiple declarations", () => {
      const css = `
        .selector1 { opacity: 0.999; }
        .selector2 { transform: translateZ(0); }
        .selector3 { will-change: opacity; }
        .selector4 { opacity: 0.5; }
      `;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkStackingContextHacks(root, result);
      expect(result.warn).toHaveBeenCalledTimes(3);
    });
  });
});
