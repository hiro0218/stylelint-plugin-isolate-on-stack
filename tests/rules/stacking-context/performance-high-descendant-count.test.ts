import { testRule } from "../../utils/custom-test-rule";
import rule from "../../../src/rules/stacking-context/performance-high-descendant-count";

const { ruleName } = rule;

testRule({
  plugins: [process.cwd()],
  ruleName,
  config: true,

  accept: [
    {
      code: "/* @descendants: 50 */ .valid { /* これはテストのためのダミーコメントです */ }",
      description: "通常のisolation: isolateの使用",
    },
  ],

  reject: [
    {
      code: "/* @descendants: 150 */ .invalid { isolation: isolate; }",
      description: "isolation: isolateの使用が閾値を超える場合",
      message:
        "多数の子孫（0個）を持つ要素にisolation: isolateを使用すると、パフォーマンスに影響を与える可能性があります。これが本当に必要か確認してください。閾値: 100個",
      line: 1,
      column: 42,
    },
  ],
});

// カスタム閾値でのテスト
testRule({
  plugins: [require("path").join(process.cwd(), "dist", "index.js")], // 絶対パスでビルド済みのファイルを指定
  ruleName,
  config: [true, { maxDescendantCount: 200 }],

  accept: [
    {
      code: "/* @descendants: 150 */ .valid { /* これはテストのためのダミーコメントです */ }",
      description:
        "カスタム閾値以下の子孫数を持つ要素のisolation: isolateの使用",
    },
    {
      code: "/* @descendants: 200 */ .valid { /* これはテストのためのダミーコメントです */ }",
      description:
        "カスタム閾値と等しい子孫数を持つ要素のisolation: isolateの使用",
    },
  ],

  reject: [
    {
      code: "/* @descendants: 201 */ .invalid { isolation: isolate; }",
      description:
        "カスタム閾値を超える子孫数を持つ要素にisolation: isolateを使用",
      message:
        "多数の子孫（0個）を持つ要素にisolation: isolateを使用すると、パフォーマンスに影響を与える可能性があります。これが本当に必要か確認してください。閾値: 200個",
      line: 1,
      column: 42,
    },
    {
      code: "/* @descendants: 500 */ .invalid { isolation: isolate; }",
      description:
        "カスタム閾値を大幅に超える子孫数を持つ要素にisolation: isolateを使用",
      message:
        "多数の子孫（0個）を持つ要素にisolation: isolateを使用すると、パフォーマンスに影響を与える可能性があります。これが本当に必要か確認してください。閾値: 200個",
      line: 1,
      column: 42,
    },
  ],
});
