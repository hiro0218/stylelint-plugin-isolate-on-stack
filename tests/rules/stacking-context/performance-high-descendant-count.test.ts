import { testRule } from "../../utils/custom-test-rule";
import { performanceHighDescendantCountMessages } from "../../../src/utils/message";

const ruleName = "stylelint-plugin-isolate-on-stack/performance-high-descendant-count";

testRule({
  plugins: [process.cwd()],
  ruleName,
  config: true,

  accept: [
    {
      code: "#specific-id { isolation: isolate; }",
      description: "IDセレクタは具体的なため子孫が少ないと推定される",
    },
    {
      code: ".simple-class[data-test] { position: relative; z-index: 1; }",
      description: "具体的な属性セレクタは子孫が少ないと推定される",
    },
    {
      code: ".parent > .direct-child { transform: scale(1.1); }",
      description: "直接の子セレクタは子孫が少ないと推定される",
    },
  ],

  reject: [
    {
      code: "div { isolation: isolate; }",
      description: "汎用的なタグセレクタは多数の子孫を持つ可能性がある",
      message: performanceHighDescendantCountMessages.rejected("div", 60),
      line: 1,
      column: 1,
    },
    {
      code: ".very-general-class * { position: relative; z-index: 1; }",
      description: "ワイルドカードを含むセレクタは多数の子孫に影響する可能性がある",
      message: performanceHighDescendantCountMessages.rejected(".very-general-class *", 120),
      line: 1,
      column: 1,
    },
    {
      code: "header nav ul li a { opacity: 0.9; }",
      description: "長い子孫セレクタチェーンは多数の子孫を持つ可能性がある",
      message: performanceHighDescendantCountMessages.rejected("header nav ul li a", 100),
      line: 1,
      column: 1,
    },
  ],
});
