import { testRule } from "../../utils/custom-test-rule";
import rule, {
  ruleName as importedRuleName,
  report,
  checkZIndexRange,
  DEFAULT_MAX_Z_INDEX,
} from "../../../src/rules/z-index-range/index";
import { zIndexRangeMessages } from "../../../src/utils/message";
import { describe, it, expect, vi } from "vitest";
import postcss from "postcss";
import Root from "postcss/lib/root";
import Declaration from "postcss/lib/declaration";

const { ruleName } = rule;

// 既存のtestRuleコードはそのまま
testRule({
  plugins: [process.cwd()],
  ruleName,
  config: true,

  accept: [
    {
      code: ".valid { z-index: 1; }",
      description: "z-index value within appropriate range",
    },
    {
      code: ".valid { z-index: 50; }",
      description: "z-index value within appropriate range",
    },
    {
      code: ".valid { z-index: 100; }",
      description: "z-index value equal to maximum allowed value",
    },
    {
      code: ".valid { z-index: -10; }",
      description: "Negative z-index values are allowed",
    },
    {
      code: ".valid { z-index: auto; }",
      description: "z-index: auto is not a number so it's valid",
    },
  ],

  reject: [
    {
      code: ".invalid { z-index: 101; }",
      description: "z-index value exceeding the maximum allowed value",
      message: zIndexRangeMessages.rejected(101, 100),
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { z-index: 999; }",
      description: "Significantly high z-index value",
      message: zIndexRangeMessages.rejected(999, 100),
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { z-index: 99999; }",
      description: "Extremely high z-index value",
      message: zIndexRangeMessages.rejected(99999, 100),
      line: 1,
      column: 11,
    },
  ],
});

// Test with custom maximum value
testRule({
  plugins: [require("path").join(process.cwd(), "dist", "index.js")], // Specify built file with absolute path
  ruleName,
  config: [true, { maxZIndex: 10 }], // Pass correctly in array format

  accept: [
    {
      code: ".valid { z-index: 1; }",
      description: "z-index value within custom maximum",
    },
    {
      code: ".valid { z-index: 10; }",
      description: "z-index value equal to custom maximum",
    },
  ],

  reject: [
    {
      code: ".invalid { z-index: 11; }",
      description: "z-index value exceeding custom maximum",
      message: zIndexRangeMessages.rejected(11, 10),
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { z-index: 100; }",
      description: "z-index value allowed by default maximum but not by custom maximum",
      message: zIndexRangeMessages.rejected(100, 10),
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
      code: ".invalid { z-index: 999; }",
      description: "When config is false, even high z-index values should be accepted",
    },
  ],
});

testRule({
  plugins: [process.cwd()],
  ruleName,
  config: null,

  accept: [
    {
      code: ".invalid { z-index: 9999; }",
      description: "When config is null, even high z-index values should be accepted",
    },
  ],
});

// 新しいユニットテスト
describe("z-index-range unit tests", () => {
  describe("report function", () => {
    it("should call result.warn with correct parameters", () => {
      // モックを作成
      const result = {
        warn: vi.fn(),
      };

      const node = new Declaration({ prop: "z-index", value: "999" });
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

  describe("checkZIndexRange function", () => {
    it("should not report when no declarations exist", () => {
      const root = new Root();
      const result = {
        warn: vi.fn(),
      };

      checkZIndexRange(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should not report when z-index is within range", () => {
      const css = `.selector { z-index: 50; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkZIndexRange(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should not report when z-index is auto", () => {
      const css = `.selector { z-index: auto; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkZIndexRange(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should report when z-index exceeds default maximum", () => {
      const css = `.selector { z-index: 101; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkZIndexRange(root, result);
      expect(result.warn).toHaveBeenCalledWith(
        zIndexRangeMessages.rejected(101, DEFAULT_MAX_Z_INDEX),
        expect.objectContaining({
          ruleName: importedRuleName,
        })
      );
    });

    it("should respect custom maximum z-index", () => {
      const css = `.selector { z-index: 20; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };
      const customMax = 10;

      checkZIndexRange(root, result, customMax);
      expect(result.warn).toHaveBeenCalledWith(
        zIndexRangeMessages.rejected(20, customMax),
        expect.objectContaining({
          ruleName: importedRuleName,
        })
      );
    });

    it("should handle multiple declarations", () => {
      const css = `
        .selector1 { z-index: 50; }
        .selector2 { z-index: 200; }
        .selector3 { z-index: 999; }
      `;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkZIndexRange(root, result);
      expect(result.warn).toHaveBeenCalledTimes(2); // 2つのz-indexが範囲外
    });
  });
});
