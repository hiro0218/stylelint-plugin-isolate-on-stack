import { testRule } from "../../utils/custom-test-rule";
import rule from "../../../src/rules/stacking-context/ineffective-on-background-blend";
import { ineffectiveOnBackgroundBlendMessages } from "../../../src/utils/message";

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
