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
  ],
});
