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
      description: "Intentionally used opacity",
    },
    {
      code: ".valid { opacity: 1; }",
      description: "Full opacity has no side effects",
    },
    {
      code: ".valid { transform: translateX(10px); }",
      description: "Intentionally used transform",
    },
    {
      code: ".valid { will-change: width, height; }",
      description: "will-change that doesn't generate stacking context",
    },
    {
      code: ".valid { isolation: isolate; }",
      description: "Explicit use of isolation: isolate",
    },
  ],

  reject: [
    {
      code: ".invalid { opacity: 0.999; }",
      description: "Using opacity value that is nearly opaque to create a stacking context",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { transform: translateZ(0); }",
      description: "Creating stacking context with transform hack",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { transform: translate3d(0,0,0); }",
      description: "Creating stacking context with transform 3D hack",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { will-change: opacity; }",
      description: "Using will-change for opacity",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { will-change: transform; }",
      description: "Using will-change for transform",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
    {
      code: ".invalid { will-change: z-index; }",
      description: "Using will-change for z-index",
      message: preferOverSideEffectsMessages.rejected,
      line: 1,
      column: 11,
    },
  ],
});
