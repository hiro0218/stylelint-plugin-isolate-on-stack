import { testRule } from "../../utils/custom-test-rule";
import rule from "../../../src/rules/z-index-range/index";
import { zIndexRangeMessages } from "../../../src/utils/message";

const { ruleName } = rule;

testRule({
  plugins: [process.cwd()],
  ruleName,
  config: true,

  accept: [
    {
      code: ".valid { z-index: 1; }",
      description: "適切な範囲内のz-index値",
    },
    {
      code: ".valid { z-index: 50; }",
      description: "適切な範囲内のz-index値",
    },
    {
      code: ".valid { z-index: 100; }",
      description: "最大許容値と等しいz-index値",
    },
    {
      code: ".valid { z-index: -10; }",
      description: "負のz-index値は許容される",
    },
    {
      code: ".valid { z-index: auto; }",
      description: "z-index: autoは数値ではないので問題なし",
    },
  ],

  reject: [
    {
      code: ".invalid { z-index: 101; }",
      description: "最大許容値を超えるz-index値",
      message: zIndexRangeMessages.rejected(101, 100),
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { z-index: 999; }",
      description: "著しく高いz-index値",
      message: zIndexRangeMessages.rejected(999, 100),
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { z-index: 99999; }",
      description: "極端に高いz-index値",
      message: zIndexRangeMessages.rejected(99999, 100),
      line: 1,
      column: 11,
    },
  ],
});

// カスタム最大値でのテスト
testRule({
  plugins: [require("path").join(process.cwd(), "dist", "index.js")], // 絶対パスでビルド済みのファイルを指定
  ruleName,
  config: [true, { maxZIndex: 10 }], // 配列形式で正しく渡す

  accept: [
    {
      code: ".valid { z-index: 1; }",
      description: "カスタム最大値内のz-index値",
    },
    {
      code: ".valid { z-index: 10; }",
      description: "カスタム最大値と等しいz-index値",
    },
  ],

  reject: [
    {
      code: ".invalid { z-index: 11; }",
      description: "カスタム最大値を超えるz-index値",
      message: zIndexRangeMessages.rejected(11, 10),
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { z-index: 100; }",
      description: "デフォルト最大値は許容されるがカスタム最大値では許容されないz-index値",
      message: zIndexRangeMessages.rejected(100, 10),
      line: 1,
      column: 11,
    },
  ],
});
