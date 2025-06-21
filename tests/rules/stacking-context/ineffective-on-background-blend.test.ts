import { testRule } from "../../utils/custom-test-rule";
import rule, {
  ruleName as importedRuleName,
  report,
  checkIneffectiveIsolation,
} from "../../../src/rules/stacking-context/ineffective-on-background-blend";
import { ineffectiveOnBackgroundBlendMessages } from "../../../src/utils/message";
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
      code: ".valid { isolation: isolate; }",
      description: "Simple usage of isolation: isolate",
    },
    {
      code: ".valid { background-blend-mode: multiply; }",
      description: "Simple usage of background-blend-mode",
    },
    {
      code: ".valid { isolation: isolate; mix-blend-mode: multiply; }",
      description: "Combination of isolation: isolate and mix-blend-mode is effective",
    },
    {
      code: ".valid { background-blend-mode: normal; isolation: isolate; }",
      description: "background-blend-mode: normal has no special effect so no issues",
    },
  ],

  reject: [
    {
      code: ".invalid { background-blend-mode: multiply; isolation: isolate; }",
      description: "isolation: isolate has no effect on background-blend-mode",
      message: ineffectiveOnBackgroundBlendMessages.rejected,
      line: 1,
      column: 46,
    },
    {
      code: ".invalid { background-blend-mode: screen; isolation: isolate; }",
      description: "isolation: isolate has no effect on background-blend-mode: screen",
      message: ineffectiveOnBackgroundBlendMessages.rejected,
      line: 1,
      column: 44,
    },
    {
      code: ".invalid { background-blend-mode: overlay; isolation: isolate; }",
      description: "isolation: isolate has no effect on background-blend-mode: overlay",
      message: ineffectiveOnBackgroundBlendMessages.rejected,
      line: 1,
      column: 45,
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
      code: ".invalid { background-blend-mode: multiply; isolation: isolate; }",
      description: "When config is false, even ineffective isolation should be accepted",
    },
  ],
});

testRule({
  plugins: [process.cwd()],
  ruleName,
  config: null,

  accept: [
    {
      code: ".invalid { background-blend-mode: multiply; isolation: isolate; }",
      description: "When config is null, even ineffective isolation should be accepted",
    },
  ],
});

// 新しいユニットテスト
describe("ineffective-on-background-blend unit tests", () => {
  describe("report function", () => {
    it("should call result.warn with correct parameters", () => {
      // モックを作成
      const result = {
        warn: vi.fn(),
      };

      const node = new Declaration({ prop: "isolation", value: "isolate" });
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

  describe("checkIneffectiveIsolation function", () => {
    it("should not report when no rules exist", () => {
      const root = new Root();
      const result = {
        warn: vi.fn(),
      };

      checkIneffectiveIsolation(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should not report when isolation property is not present", () => {
      const css = `.selector { background-blend-mode: multiply; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkIneffectiveIsolation(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should not report when isolation is not set to isolate", () => {
      const css = `.selector { isolation: auto; background-blend-mode: multiply; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkIneffectiveIsolation(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should not report when background-blend-mode is not present", () => {
      const css = `.selector { isolation: isolate; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkIneffectiveIsolation(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should not report when background-blend-mode is normal", () => {
      const css = `.selector { isolation: isolate; background-blend-mode: normal; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkIneffectiveIsolation(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should report when isolation: isolate is used with background-blend-mode", () => {
      const css = `.selector { isolation: isolate; background-blend-mode: multiply; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkIneffectiveIsolation(root, result);
      expect(result.warn).toHaveBeenCalledWith(
        ineffectiveOnBackgroundBlendMessages.rejected,
        expect.objectContaining({
          ruleName: importedRuleName,
        })
      );
    });

    it("should handle multiple rules correctly", () => {
      const css = `
        .selector1 { isolation: isolate; background-blend-mode: multiply; }
        .selector2 { isolation: isolate; }
      `;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkIneffectiveIsolation(root, result);
      expect(result.warn).toHaveBeenCalledTimes(1);
    });

    it("should handle properties declared in different orders", () => {
      const css = `
        .selector1 { background-blend-mode: multiply; isolation: isolate; }
        .selector2 { isolation: isolate; background-blend-mode: multiply; }
      `;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkIneffectiveIsolation(root, result);
      expect(result.warn).toHaveBeenCalledTimes(2);
    });
  });
});
