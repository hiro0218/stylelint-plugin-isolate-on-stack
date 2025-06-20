import { testRule } from "../../utils/custom-test-rule";
import rule from "../../../src/rules/stacking-context/prefer-over-side-effects";
import { preferOverSideEffectsMessages } from "../../../src/utils/message";

const { ruleName } = rule;

testRule({
  plugins: [process.cwd()],
  ruleName,
  config: true,

  accept: [
    {
      code: ".valid { opacity: 0.5; }",
      description: "意図的に使用されているopacity",
    },
    {
      code: ".valid { opacity: 1; }",
      description: "完全な不透明度は副作用なし",
    },
    {
      code: ".valid { transform: translateX(10px); }",
      description: "意図的に使用されているtransform",
    },
    {
      code: ".valid { will-change: width, height; }",
      description: "スタッキングコンテキストを生成しないwill-change",
    },
    {
      code: ".valid { isolation: isolate; }",
      description: "明示的なisolation: isolateの使用",
    },
  ],

  reject: [
    {
      code: ".invalid { opacity: 0.999; }",
      description: "ほぼ透明ではないopacityの値でスタッキングコンテキストを生成",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { transform: translateZ(0); }",
      description: "transformハックでのスタッキングコンテキスト生成",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { transform: translate3d(0,0,0); }",
      description: "transform 3Dハックでのスタッキングコンテキスト生成",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { will-change: opacity; }",
      description: "opacityに対するwill-changeの使用",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { will-change: transform; }",
      description: "transformに対するwill-changeの使用",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { will-change: z-index; }",
      description: "z-indexに対するwill-changeの使用",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
  ],
});
