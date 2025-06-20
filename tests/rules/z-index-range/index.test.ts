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
