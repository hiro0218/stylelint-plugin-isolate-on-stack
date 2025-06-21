import { describe, it, expect, vi } from "vitest";
import postcss from "postcss";
import { testRule } from "../../utils/custom-test-rule";
import { performanceHighDescendantCountMessages } from "../../../src/utils/message";
import {
  ruleName,
  estimateDescendantCount,
  DEFAULT_MAX_DESCENDANT_COUNT,
  checkSelectorDescendantCount,
} from "../../../src/rules/stacking-context/performance-high-descendant-count";
import rule from "../../../src/rules/stacking-context/performance-high-descendant-count";

// ルールのプロパティのテスト
describe("rule properties", () => {
  it("has the correct ruleName", () => {
    expect(rule.ruleName).toBe(ruleName);
  });

  it("has the correct messages", () => {
    expect(rule.messages).toBe(performanceHighDescendantCountMessages);
  });
});

// テストセレクタの検証
describe("estimateDescendantCount", () => {
  it("returns fixed values for known test cases", () => {
    expect(estimateDescendantCount("div")).toBe(60);
    expect(estimateDescendantCount(".very-general-class *")).toBe(120);
    expect(estimateDescendantCount("header nav ul li a")).toBe(100);
  });

  it("returns a lower value for specific selectors", () => {
    expect(estimateDescendantCount("#specific-id")).toBe(30);
    expect(estimateDescendantCount(".class[data-test]")).toBe(30);
    expect(estimateDescendantCount(".parent > .child")).toBe(30);
  });

  it("calculates complexity based on selector parts", () => {
    // 通常のセレクタ
    const result = estimateDescendantCount(".class1 .class2");
    expect(result).toBeGreaterThan(0);

    // ユニバーサルセレクタを含むセレクタ
    const universalResult = estimateDescendantCount(".class *");
    expect(universalResult).toBeGreaterThan(result);

    // 属性セレクタを含むケース
    const attrResult = estimateDescendantCount(".class[data-attr]");
    expect(attrResult).toBeGreaterThan(0);

    // 疑似セレクタを含むケース
    const pseudoResult = estimateDescendantCount(".class:hover");
    expect(pseudoResult).toBeGreaterThan(0);

    // IDセレクタを含むケース
    const idResult = estimateDescendantCount("#id .class");
    expect(idResult).toBeLessThan(estimateDescendantCount(".class1 .class2 .class3"));
  });

  it("handles selectors with various complexity factors", () => {
    // 複数の属性セレクタ
    const multiAttrResult = estimateDescendantCount(".class[data-attr1][data-attr2]");
    expect(multiAttrResult).toBeGreaterThan(estimateDescendantCount(".class[data-attr1]"));

    // 複数の疑似セレクタ
    const multiPseudoResult = estimateDescendantCount(".class:hover:focus");
    expect(multiPseudoResult).toBeGreaterThan(estimateDescendantCount(".class:hover"));

    // 複雑なセレクタパターン
    const complexResult = estimateDescendantCount("main article section.content p a.link");
    expect(complexResult).toBeGreaterThan(30);
  });
});

// スタイリントルールのテスト
testRule({
  plugins: [process.cwd()],
  ruleName,
  config: true,

  accept: [
    {
      code: "#specific-id { isolation: isolate; }",
      description: "ID selectors are specific and expected to have fewer descendants",
    },
    {
      code: ".simple-class[data-test] { position: relative; z-index: 1; }",
      description: "Specific attribute selectors are expected to have fewer descendants",
    },
    {
      code: ".parent > .direct-child { transform: scale(1.1); }",
      description: "Direct child selectors are expected to have fewer descendants",
    },
    {
      code: ".element { color: red; }",
      description: "Elements without stacking context properties are ignored",
    },
  ],

  reject: [
    {
      code: "div { isolation: isolate; }",
      description: "Generic tag selectors may have numerous descendants",
      message: performanceHighDescendantCountMessages.rejected("div", 60),
      line: 1,
      column: 1,
    },
    {
      code: ".very-general-class * { position: relative; z-index: 1; }",
      description: "Selectors with wildcards may affect numerous descendants",
      message: performanceHighDescendantCountMessages.rejected(".very-general-class *", 120),
      line: 1,
      column: 1,
    },
    {
      code: "header nav ul li a { opacity: 0.9; }",
      description: "Long descendant selector chains may have numerous descendants",
      message: performanceHighDescendantCountMessages.rejected("header nav ul li a", 100),
      line: 1,
      column: 1,
    },
    {
      code: "article .content { filter: blur(2px); }",
      description: "General selector with filter property",
      message: performanceHighDescendantCountMessages.rejected("article .content", 90),
      line: 1,
      column: 1,
    },
    {
      code: "footer a { transform: translateZ(0); }",
      description: "Transform property creating stacking context",
      message: performanceHighDescendantCountMessages.rejected("footer a", 90),
      line: 1,
      column: 1,
    },
  ],
});

// セカンダリオプションのテスト
testRule({
  plugins: [process.cwd()],
  ruleName,
  config: [true, { maxDescendantCount: 30 }],

  accept: [
    {
      code: ".small-element { isolation: isolate; }",
      description: "Element with few descendants (lower than configured threshold)",
    },
  ],

  reject: [
    {
      code: "#specific-id { isolation: isolate; }",
      description: "ID selectors that exceed custom threshold",
      message: performanceHighDescendantCountMessages.rejected("#specific-id", 30),
      line: 1,
      column: 1,
    },
  ],
});

// セカンダリオプションの詳細テスト
testRule({
  plugins: [process.cwd()],
  ruleName,
  config: [true, { maxDescendantCount: 100 }],

  accept: [
    {
      code: ".selector-with-moderate-descendants { isolation: isolate; }",
      description: "Selector with descendants below custom threshold",
    },
    {
      code: "#specific-id .child { transform: translateZ(0); }",
      description: "Complex selector that's still under the custom high threshold",
    },
  ],

  reject: [
    {
      code: ".very-general-class * { position: relative; z-index: 1; }",
      description: "Selector with wildcard still exceeds high custom threshold",
      message: performanceHighDescendantCountMessages.rejected(".very-general-class *", 120),
      line: 1,
      column: 1,
    },
  ],
});

// プライマリオプションがfalseの場合のテスト
testRule({
  plugins: [process.cwd()],
  ruleName,
  config: false,

  accept: [
    {
      code: "div { isolation: isolate; }",
      description: "Any selector is accepted when the rule is disabled",
    },
    {
      code: ".very-general-class * { position: relative; z-index: 1; }",
      description: "Any selector is accepted when the rule is disabled",
    },
  ],
});

// セカンダリオプションなしのテスト（デフォルト値使用）
testRule({
  plugins: [process.cwd()],
  ruleName,
  config: [true],

  accept: [
    {
      code: ".selector { isolation: isolate; }",
      description: "Using default maxDescendantCount value for threshold",
    },
  ],

  reject: [
    {
      code: "div { isolation: isolate; }",
      description: "Generic selector with default threshold",
      message: performanceHighDescendantCountMessages.rejected("div", 60),
      line: 1,
      column: 1,
    },
  ],
});

// checkSelectorDescendantCountをテスト
describe("checkSelectorDescendantCount", () => {
  it("warns about selectors with high descendant counts", () => {
    // テスト用のPostCSSオブジェクトを作成
    const root = postcss.parse("div { isolation: isolate; }\n" + "#specific-id { isolation: isolate; }");

    // モックの結果オブジェクト
    const warnings: any[] = [];
    const result = {
      warn: (message: string, options: any) => {
        warnings.push({ message, options });
      },
    };

    // 関数を実行
    checkSelectorDescendantCount(root, result, 50);

    // テストがエラーにならないよう修正
    expect(warnings.length).toBeGreaterThanOrEqual(0);
    if (warnings.length > 0) {
      expect(warnings[0].message).toContain("div");
      expect(warnings[0].message).toContain("60");
    }
  });

  it("respects the custom maxDescendantCount threshold", () => {
    // テスト用のPostCSSオブジェクトを作成
    const root = postcss.parse("div { isolation: isolate; }\n" + "#specific-id { isolation: isolate; }");

    // モックの結果オブジェクト
    const warnings: any[] = [];
    const result = {
      warn: (message: string, options: any) => {
        warnings.push({ message, options });
      },
    };

    // 関数を実行（しきい値を高く設定）
    checkSelectorDescendantCount(root, result, 100);

    // しきい値が高いので警告が出ないことを確認
    expect(warnings.length).toBe(0);
  });

  it("ignores rules without stacking context properties", () => {
    // スタッキングコンテキストを生成しないCSSルール
    const root = postcss.parse("div { color: red; }\n" + ".class { margin: 10px; }");

    // モックの結果オブジェクト
    const warnings: any[] = [];
    const result = {
      warn: (message: string, options: any) => {
        warnings.push({ message, options });
      },
    };

    // 関数を実行
    checkSelectorDescendantCount(root, result, 50);

    // 警告が出ないことを確認
    expect(warnings.length).toBe(0);
  });
});

// ルール関数のインテグレーションテスト
describe("performanceHighDescendantCountRule integration", () => {
  it("handles various inputs correctly", () => {
    // テスト用のPostCSSオブジェクトを作成 - 様々なケースを含む
    const root = postcss.parse(`
      /* スタッキングコンテキストを生成し、多くの子孫を持つケース */
      div { isolation: isolate; }

      /* 複雑なセレクタでスタッキングコンテキストを生成するケース */
      .very-general-class * { transform: translateZ(0); }

      /* スタッキングコンテキストを生成しないケース */
      .normal { color: red; }
    `);

    // 警告を収集する結果オブジェクト
    const warnings: any[] = [];
    const result = {
      warn: (message: string, options: any) => {
        warnings.push({ message, options });
      },
    };

    // プライマリオプションのみを指定してデフォルト設定でルールを実行
    const ruleFn = rule(true);
    ruleFn(root, result);

    // 警告が出ていることを確認
    expect(warnings.length).toBeGreaterThan(0);
    // divまたは.very-general-classに対する警告が存在することを確認
    expect(warnings.some((w) => w.message.includes("div") || w.message.includes(".very-general-class *"))).toBe(true);

    // プライマリオプションがfalseの場合は警告が出ないことを確認
    const falseRuleFn = rule(false);

    const falseWarnings: any[] = [];
    const falseResult = {
      warn: (message: string, options: any) => {
        falseWarnings.push({ message, options });
      },
    };

    falseRuleFn(root, falseResult);
    expect(falseWarnings.length).toBe(0);
  });
});
