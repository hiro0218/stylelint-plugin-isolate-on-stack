import { testRule } from "../../utils/custom-test-rule";
import rule, {
  ruleName as importedRuleName,
  report,
  checkRedundantIsolation,
} from "../../../src/rules/stacking-context/no-redundant-declaration";
import { noRedundantDeclarationMessages } from "../../../src/utils/message";
import { describe, it, expect, vi } from "vitest";
import postcss from "postcss";
import Root from "postcss/lib/root";
import Declaration from "postcss/lib/declaration";
import Rule from "postcss/lib/rule";

const { ruleName } = rule;

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
      code: ".valid { position: relative; }",
      description: "Position alone does not create a stacking context",
    },
    {
      code: ".valid { position: relative; z-index: auto; isolation: isolate; }",
      description: "z-index: auto does not create a stacking context",
    },
    {
      code: ".valid { opacity: 1; isolation: isolate; }",
      description: "opacity: 1 does not create a stacking context",
    },
    {
      code: ".valid { transform: none; isolation: isolate; }",
      description: "transform: none does not create a stacking context",
    },
    {
      code: ".valid { filter: none; isolation: isolate; }",
      description: "filter: none does not create a stacking context",
    },
    {
      code: ".valid { will-change: color; isolation: isolate; }",
      description: "will-change: color does not create a stacking context",
    },
    {
      code: ".valid { display: block; isolation: isolate; }",
      description: "Normal display property does not create a stacking context",
    },
    {
      code: ".valid.child { isolation: isolate; } .valid.parent { position: relative; z-index: 1; }",
      description: "Isolation is valid on a separate element even if parent has a stacking context",
    },
    {
      code: "@media (min-width: 768px) { .valid { isolation: isolate; } }",
      description: "Using isolation: isolate in a media query",
    },
  ],

  reject: [
    {
      code: ".invalid { position: relative; z-index: 1; isolation: isolate; }",
      description:
        "isolation: isolate is redundant when position: relative with z-index: 1 already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 50,
    },
    {
      code: ".invalid { position: absolute; z-index: 0; isolation: isolate; }",
      description:
        "isolation: isolate is redundant when position: absolute with z-index: 0 already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 50,
    },
    {
      code: ".invalid { position: fixed; z-index: -1; isolation: isolate; }",
      description:
        "isolation: isolate is redundant when position: fixed with z-index: -1 already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 49,
    },
    {
      code: ".invalid { position: sticky; z-index: 10; isolation: isolate; }",
      description:
        "isolation: isolate is redundant when position: sticky with z-index: 10 already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 50,
    },
    {
      code: ".invalid { opacity: 0.5; isolation: isolate; }",
      description: "isolation: isolate is redundant when opacity: 0.5 already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 28,
    },
    {
      code: ".invalid { transform: translateX(10px); isolation: isolate; }",
      description:
        "isolation: isolate is redundant when transform: translateX(10px) already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 45,
    },
    {
      code: ".invalid { filter: blur(5px); isolation: isolate; }",
      description: "isolation: isolate is redundant when filter: blur(5px) already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 34,
    },
    {
      code: ".invalid { mix-blend-mode: multiply; isolation: isolate; }",
      description: "isolation: isolate is redundant when mix-blend-mode: multiply already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 41,
    },
    {
      code: ".invalid { contain: layout; isolation: isolate; }",
      description: "isolation: isolate is redundant when contain: layout already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 33,
    },
    {
      code: ".invalid { will-change: opacity; isolation: isolate; }",
      description: "isolation: isolate is redundant when will-change: opacity already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 38,
    },
    {
      code: ".invalid { backdrop-filter: blur(5px); isolation: isolate; }",
      description: "isolation: isolate is redundant when backdrop-filter: blur(5px) already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 43,
    },
    {
      code: ".invalid { clip-path: circle(50%); isolation: isolate; }",
      description: "isolation: isolate is redundant when clip-path: circle(50%) already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 39,
    },
    {
      code: ".invalid { mask: url(#mask); isolation: isolate; }",
      description: "isolation: isolate is redundant when mask: url(#mask) already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 34,
    },
    {
      code: ".invalid { mask-image: url(mask.png); isolation: isolate; }",
      description: "isolation: isolate is redundant when mask-image: url(mask.png) already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 43,
    },
    {
      code: ".invalid { perspective: 1000px; isolation: isolate; }",
      description: "isolation: isolate is redundant when perspective: 1000px already creates a stacking context",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 37,
    },
    {
      code: "@media (min-width: 768px) { .invalid { opacity: 0.8; isolation: isolate; } }",
      description: "Redundant usage of isolation: isolate in a media query",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 55,
    },
    {
      code: ".parent { .invalid { transform: scale(1.1); isolation: isolate; } }",
      description: "Redundant usage of isolation: isolate in a nested rule",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 54,
    },
  ],
});

describe("no-redundant-declaration unit tests", () => {
  describe("report function", () => {
    it("should call result.warn with correct parameters", () => {
      const result = {
        warn: vi.fn(),
      };

      const node = new Declaration({ prop: "isolation", value: "isolate" });
      const message = "Test message";

      report({
        message,
        node,
        result,
        ruleName: importedRuleName,
      });

      expect(result.warn).toHaveBeenCalledWith(message, {
        node,
        ruleName: importedRuleName,
      });
    });
  });

  describe("checkRedundantIsolation function", () => {
    it("should not report when no rules exist", () => {
      const root = new Root();
      const result = {
        warn: vi.fn(),
      };

      checkRedundantIsolation(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should not report when isolation property is not present", () => {
      const css = `.selector { color: red; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkRedundantIsolation(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should not report when isolation is not set to isolate", () => {
      const css = `.selector { isolation: auto; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkRedundantIsolation(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should not report when isolation: isolate is used alone", () => {
      const css = `.selector { isolation: isolate; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkRedundantIsolation(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should not report when other properties don't create a stacking context", () => {
      const css = `.selector {
        isolation: isolate;
        position: relative;
        z-index: auto;
        opacity: 1;
        transform: none;
      }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkRedundantIsolation(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });

    it("should report when other properties already create a stacking context", () => {
      const css = `.selector {
        isolation: isolate;
        position: relative;
        z-index: 1;
      }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkRedundantIsolation(root, result);
      expect(result.warn).toHaveBeenCalledWith(
        noRedundantDeclarationMessages.rejected,
        expect.objectContaining({
          ruleName: importedRuleName,
        })
      );
    });

    it("should handle multiple rules correctly", () => {
      const css = `
        .selector1 { isolation: isolate; opacity: 0.5; }
        .selector2 { isolation: isolate; }
      `;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkRedundantIsolation(root, result);
      expect(result.warn).toHaveBeenCalledTimes(1);
    });

    it("should handle properties declared in different orders", () => {
      const css = `
        .selector1 { opacity: 0.5; isolation: isolate; }
        .selector2 { isolation: isolate; opacity: 0.5; }
      `;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkRedundantIsolation(root, result);
      expect(result.warn).toHaveBeenCalledTimes(2);
    });

    it("should not report when isolation value is not 'isolate'", () => {
      const css = `.selector { isolation: auto; position: relative; z-index: 1; }`;
      const root = postcss.parse(css);
      const result = {
        warn: vi.fn(),
      };

      checkRedundantIsolation(root, result);
      expect(result.warn).not.toHaveBeenCalled();
    });
  });

  // 別のテストグループとしてruleをテスト
  testRule({
    plugins: [process.cwd()],
    ruleName,
    config: false,

    accept: [
      {
        code: ".invalid { position: relative; z-index: 1; isolation: isolate; }",
        description: "When config is false, even redundant isolation should be accepted",
      },
    ],
  });

  testRule({
    plugins: [process.cwd()],
    ruleName,
    config: null,

    accept: [
      {
        code: ".invalid { position: relative; z-index: 1; isolation: isolate; }",
        description: "When config is null, even redundant isolation should be accepted",
      },
    ],
  });
});
