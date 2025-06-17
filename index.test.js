import stylelint from "stylelint";
import plugin from "./index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { ruleName } = plugin;

const testRule = async (options) => {
  const { code, fixed, warnings, description } = options;

  const result = await stylelint.lint({
    code,
    config: {
      plugins: [path.resolve(__dirname, "./index.js")],
      rules: {
        [ruleName]: true,
      },
    },
    fix: Boolean(fixed),
  });

  if (fixed) {
    expect(result.output).toEqual(fixed,
      description ? `Failed fix assertion: ${description}` : undefined);
  }

  if (warnings) {
    expect(result.results[0].warnings).toHaveLength(warnings,
      description ? `Expected ${warnings} warnings: ${description}` : undefined);
  } else {
    expect(result.results[0].warnings).toHaveLength(0,
      description ? `Expected no warnings: ${description}` : undefined);
  }
};

describe("isolate-on-stack/isolation-for-position-zindex rule", () => {
  it("flags position: absolute with z-index but no isolation", async () => {
    await testRule({
      code: `
        .test {
          position: absolute;
          z-index: 1;
        }
      `,
      warnings: 1,
      description:
        "should flag when position: absolute and z-index are used without isolation: isolate",
    });
  });

  it("passes when position: absolute with z-index has isolation: isolate", async () => {
    await testRule({
      code: `
        .test {
          position: absolute;
          z-index: 1;
          isolation: isolate;
        }
      `,
      warnings: 0,
      description: "should pass when isolation: isolate is present",
    });
  });

  it("passes when only position: absolute is used (no z-index)", async () => {
    await testRule({
      code: `
        .test {
          position: absolute;
        }
      `,
      warnings: 0,
      description: "should pass when only position: absolute is used",
    });
  });

  it("passes when only z-index is used (no position: absolute)", async () => {
    await testRule({
      code: `
        .test {
          z-index: 1;
        }
      `,
      warnings: 0,
      description: "should pass when only z-index is used",
    });
  });

  it("autofixes by adding isolation: isolate after z-index", async () => {
    await testRule({
      code: `
        .test {
          position: absolute;
          z-index: 1;
        }
      `,
      fixed: `
        .test {
          position: absolute;
          z-index: 1;
          isolation: isolate;
        }
      `,
      warnings: 0, // autofixモードでは警告は出ない
      description: "should autofix by adding isolation: isolate after z-index",
    });
  });

  it("handles multiple rules correctly", async () => {
    await testRule({
      code: `
        .test1 {
          position: absolute;
          z-index: 1;
        }
        .test2 {
          position: absolute;
          z-index: 2;
          isolation: isolate;
        }
        .test3 {
          position: relative;
          z-index: 3;
        }
      `,
      warnings: 2,
      description: "should flag both position: absolute and position: relative with z-index",
    });
  });

  it("flags position: relative with z-index but no isolation", async () => {
    await testRule({
      code: `
        .test {
          position: relative;
          z-index: 1;
        }
      `,
      warnings: 1,
      description:
        "should flag when position: relative and z-index are used without isolation: isolate",
    });
  });

  it("flags position: fixed with z-index but no isolation", async () => {
    await testRule({
      code: `
        .test {
          position: fixed;
          z-index: 1;
        }
      `,
      warnings: 1,
      description:
        "should flag when position: fixed and z-index are used without isolation: isolate",
    });
  });

  it("flags position: sticky with z-index but no isolation", async () => {
    await testRule({
      code: `
        .test {
          position: sticky;
          z-index: 1;
        }
      `,
      warnings: 1,
      description:
        "should flag when position: sticky and z-index are used without isolation: isolate",
    });
  });

  it("passes when position: relative with z-index has isolation: isolate", async () => {
    await testRule({
      code: `
        .test {
          position: relative;
          z-index: 1;
          isolation: isolate;
        }
      `,
      warnings: 0,
      description: "should pass when isolation: isolate is present with position: relative",
    });
  });

  it("autofixes by adding isolation: isolate for position: fixed", async () => {
    await testRule({
      code: `
        .test {
          position: fixed;
          z-index: 1;
        }
      `,
      fixed: `
        .test {
          position: fixed;
          z-index: 1;
          isolation: isolate;
        }
      `,
      warnings: 0,
      description: "should autofix by adding isolation: isolate for position: fixed",
    });
  });

  it("should not report error for pseudo-element with position and z-index", async () => {
    await testRule({
      code: `
        .test::before {
          position: absolute;
          z-index: 1;
        }
      `,
      warnings: 0,
      description: "should not report error for pseudo-element with position and z-index",
    });
  });

  it("should not report error for single colon pseudo-element with position and z-index", async () => {
    await testRule({
      code: `
        .test:before {
          position: fixed;
          z-index: 1;
        }
      `,
      warnings: 0,
      description: "should not report error for single colon pseudo-element with position and z-index",
    });
  });

  it("should not apply fix to pseudo-elements even when fix is enabled", async () => {
    const result = await stylelint.lint({
      code: `
        .test::after {
          position: relative;
          z-index: 1;
        }
      `,
      config: {
        plugins: [path.resolve(__dirname, "./index.js")],
        rules: {
          [ruleName]: true,
        },
      },
      fix: true, // 明示的にfixをtrueに設定
    });

    // 修正が適用されていないことを確認
    expect(result.code).toEqual(`
        .test::after {
          position: relative;
          z-index: 1;
        }
      `);
    // 疑似要素にはエラーを報告しないため、警告は0になるはず
    expect(result.results[0].warnings).toHaveLength(0);
  });

  it("should report warning when pseudo-element has isolation: isolate", async () => {
    await testRule({
      code: `
        .test::before {
          position: absolute;
          z-index: 1;
          isolation: isolate;
        }
      `,
      warnings: 1,
      description: "should report warning when pseudo-element has isolation: isolate",
    });
  });

  it("should report warning when CSS2 style pseudo-element has isolation: isolate", async () => {
    await testRule({
      code: `
        .test:after {
          position: fixed;
          z-index: 1;
          isolation: isolate;
        }
      `,
      warnings: 1,
      description: "should report warning when CSS2 style pseudo-element has isolation: isolate",
    });
  });

  it("should explain clearly why pseudo-elements with isolation: isolate are redundant", async () => {
    const result = await stylelint.lint({
      code: `
        .test::before {
          position: absolute;
          z-index: 1;
          isolation: isolate;
        }
      `,
      config: {
        plugins: [path.resolve(__dirname, "./index.js")],
        rules: {
          [ruleName]: true,
        },
      },
    });

    // メッセージに「no effect on pseudo-elements」という文言が含まれていることを確認
    expect(result.results[0].warnings).toHaveLength(1);
    expect(result.results[0].warnings[0].text).toContain("no effect on pseudo-elements");
  });

  it("verifies that all pseudo-elements are properly detected for isolation warning", async () => {
    const pseudoElements = [
      "::before", "::after", "::first-line", "::first-letter",
      "::marker", "::placeholder", "::selection", "::backdrop"
    ];

    for (const pseudoElement of pseudoElements) {
      const result = await stylelint.lint({
        code: `
          .test${pseudoElement} {
            position: absolute;
            z-index: 1;
            isolation: isolate;
          }
        `,
        config: {
          plugins: [path.resolve(__dirname, "./index.js")],
          rules: {
            [ruleName]: true,
          },
        },
      });

      expect(result.results[0].warnings).toHaveLength(1,
        `Pseudo-element ${pseudoElement} should trigger a warning with isolation: isolate`);
    }
  });

  it("handles different property order (z-index before position)", async () => {
    await testRule({
      code: `
        .test {
          z-index: 1;
          position: absolute;
        }
      `,
      warnings: 1,
      description: "should flag when z-index is before position",
    });
  });

  it("handles case insensitive property names", async () => {
    await testRule({
      code: `
        .test {
          Position: absolute;
          Z-INDEX: 1;
        }
      `,
      warnings: 1,
      description: "should flag when property names have different capitalization",
    });
  });

  it("handles case insensitive property values", async () => {
    await testRule({
      code: `
        .test {
          position: ABSOLUTE;
          z-index: 1;
        }
      `,
      warnings: 1,
      description: "should flag when property values have different capitalization",
    });
  });

  it("passes when isolation: isolate is specified with different capitalization", async () => {
    await testRule({
      code: `
        .test {
          position: absolute;
          z-index: 1;
          isolation: ISOLATE;
        }
      `,
      warnings: 0,
      description: "should pass when isolation: isolate is present with different capitalization",
    });
  });

  it("handles isolation: isolate between other properties", async () => {
    await testRule({
      code: `
        .test {
          position: fixed;
          color: red;
          isolation: isolate;
          z-index: 1;
          margin: 10px;
        }
      `,
      warnings: 0,
      description: "should pass when isolation: isolate is between other properties",
    });
  });

  it("should not report error for ::first-line pseudo-element", async () => {
    await testRule({
      code: `
        .test::first-line {
          position: absolute;
          z-index: 1;
        }
      `,
      warnings: 0,
      description: "should not report error for ::first-line pseudo-element",
    });
  });

  it("should not report error for ::first-letter pseudo-element", async () => {
    await testRule({
      code: `
        .test::first-letter {
          position: relative;
          z-index: 1;
        }
      `,
      warnings: 0,
      description: "should not report error for ::first-letter pseudo-element",
    });
  });

  it("should not report error for ::marker pseudo-element", async () => {
    await testRule({
      code: `
        li::marker {
          position: relative;
          z-index: 1;
        }
      `,
      warnings: 0,
      description: "should not report error for ::marker pseudo-element",
    });
  });

  it("should report warning when ::selection pseudo-element has isolation: isolate", async () => {
    await testRule({
      code: `
        .test::selection {
          position: relative;
          z-index: 1;
          isolation: isolate;
        }
      `,
      warnings: 1,
      description: "should report warning when ::selection pseudo-element has isolation: isolate",
    });
  });

  it("handles complex selectors with combinators", async () => {
    await testRule({
      code: `
        .parent > .child {
          position: absolute;
          z-index: 1;
        }
      `,
      warnings: 1,
      description: "should flag when using complex selectors with combinators",
    });
  });

  it("handles multiple selectors in the same rule", async () => {
    await testRule({
      code: `
        .test1, .test2, .test3 {
          position: fixed;
          z-index: 1;
        }
      `,
      warnings: 1,
      description: "should flag when using multiple selectors in the same rule",
    });
  });

  it("autofixes multiple selectors in the same rule", async () => {
    await testRule({
      code: `
        .test1, .test2, .test3 {
          position: fixed;
          z-index: 1;
        }
      `,
      fixed: `
        .test1, .test2, .test3 {
          position: fixed;
          z-index: 1;
          isolation: isolate;
        }
      `,
      warnings: 0,
      description: "should autofix when using multiple selectors in the same rule",
    });
  });

  it("handles mixed normal and pseudo-element selectors", async () => {
    await testRule({
      code: `
        .test, .test::before {
          position: sticky;
          z-index: 1;
        }
      `,
      warnings: 1,
      description: "should flag only for normal selectors when mixed with pseudo-element selectors",
    });

    // 追加テスト：通常のセレクタが複数あり、疑似要素セレクタがある場合
    await testRule({
      code: `
        .test1, .test2, .test3::before {
          position: absolute;
          z-index: 1;
        }
      `,
      warnings: 1,
      description: "should flag once for rule with multiple normal selectors and pseudo-element selectors",
    });
  });

  it("handles multiple position declarations in the same rule", async () => {
    await testRule({
      code: `
        .test {
          position: static;
          color: blue;
          position: absolute;
          z-index: 1;
        }
      `,
      warnings: 1,
      description: "should flag when having multiple position declarations with the last one being a stacking value",
    });
  });

  it("handles multiple z-index declarations in the same rule", async () => {
    await testRule({
      code: `
        .test {
          position: absolute;
          z-index: auto;
          color: blue;
          z-index: 1;
        }
      `,
      warnings: 1,
      description: "should flag when having multiple z-index declarations",
    });
  });

  it("autofixes correctly with multiple z-index declarations", async () => {
    await testRule({
      code: `
        .test {
          position: absolute;
          z-index: auto;
          color: blue;
          z-index: 1;
        }
      `,
      fixed: `
        .test {
          position: absolute;
          z-index: auto;
          color: blue;
          z-index: 1;
          isolation: isolate;
        }
      `,
      warnings: 0,
      description: "should autofix correctly with multiple z-index declarations",
    });
  });

  it("passes when isolation already exists but with different value", async () => {
    await testRule({
      code: `
        .test {
          position: absolute;
          z-index: 1;
          isolation: auto;
        }
      `,
      warnings: 1,
      description: "should flag when isolation exists but with a value other than isolate",
    });
  });

  it("passes when z-index is auto", async () => {
    await testRule({
      code: `
        .test {
          position: relative;
          z-index: auto;
        }
      `,
      warnings: 0,
      description: "should pass when z-index is auto",
    });
  });

  it("passes when z-index is AUTO (case insensitive)", async () => {
    await testRule({
      code: `
        .test {
          position: absolute;
          z-index: AUTO;
        }
      `,
      warnings: 0,
      description: "should pass when z-index is AUTO (case insensitive)",
    });
  });

  it("flags when multiple z-index values with one non-auto", async () => {
    await testRule({
      code: `
        .test {
          position: relative;
          z-index: auto;
          z-index: 1;
        }
      `,
      warnings: 1,
      description: "should flag when there are multiple z-index values with at least one non-auto",
    });
  });

  it("passes when only isolation: isolate is used (no position or z-index)", async () => {
    await testRule({
      code: `
        .test {
          isolation: isolate;
        }
      `,
      warnings: 0,
      description: "should pass when only isolation: isolate is used (creates stacking context unconditionally)",
    });
  });

  it("passes with isolation: isolate even without position or z-index", async () => {
    await testRule({
      code: `
        .test {
          margin: 10px;
          isolation: isolate;
          padding: 5px;
        }
      `,
      warnings: 0,
      description: "should pass with isolation: isolate even without position or z-index",
    });
  });

  it("handles visual example from example.css with nested stacking contexts", async () => {
    await testRule({
      code: `
        /* Parent element (without isolation: isolate, with z-index added) */
        .parent-without-isolation {
          position: relative;
          width: 300px;
          height: 300px;
          background-color: #f0f0f0;
          z-index: 0; /* z-index added */
        }

        /* Child element 1 - Low z-index */
        .child-1 {
          position: absolute;
          top: 50px;
          left: 50px;
          width: 100px;
          height: 100px;
          background-color: red;
          z-index: 1;
        }

        /* Grandchild element - Very high z-index */
        .grandchild {
          position: absolute;
          top: 25px;
          left: 25px;
          width: 50px;
          height: 50px;
          background-color: green;
          z-index: 999; /* Very high value */
        }
      `,
      warnings: 3, // 3 errors (3 z-index specifications without isolation: isolate)
      description: "should flag all elements with stacking positions and z-index in visual example",
    });
  });

  it("handles visual example with correct isolation usage", async () => {
    await testRule({
      code: `
        /* Parent element (with isolation: isolate) */
        .parent-with-isolation {
          position: relative;
          width: 300px;
          height: 300px;
          background-color: #f0f0f0;
          isolation: isolate; /* Correctly specified */
        }

        /* Child element 1 - Low z-index */
        .child-1 {
          position: absolute;
          top: 50px;
          left: 50px;
          width: 100px;
          height: 100px;
          background-color: red;
          z-index: 1;
          isolation: isolate; /* Correctly specified */
        }

        /* Grandchild element - Very high z-index */
        .grandchild {
          position: absolute;
          top: 25px;
          left: 25px;
          width: 50px;
          height: 50px;
          background-color: green;
          z-index: 999; /* Very high value */
          isolation: isolate; /* Correctly specified */
        }
      `,
      warnings: 0, // All elements correctly specify isolation: isolate
      description: "should pass when all elements with stacking positions and z-index have isolation: isolate",
    });
  });
});

describe("Understanding isolation property and stacking contexts", () => {
  it("isolation: isolate creates a stacking context regardless of position or z-index", async () => {
    await testRule({
      code: `
        /* isolation: isolate alone can create a new stacking context */
        .standalone-isolation {
          isolation: isolate;
        }

        /* isolation: isolate creates stacking context even without position */
        .isolation-with-z-index {
          z-index: 5; /* Normally, z-index has no effect without position */
          isolation: isolate; /* But with isolation: isolate, a stacking context is created */
        }
      `,
      warnings: 0,
      description: "isolation: isolate should create stacking context regardless of other properties",
    });
  });

  it("ensures z-index auto does not create a stacking context even with position", async () => {
    await testRule({
      code: `
        .position-with-z-index-auto {
          position: absolute;
          z-index: auto; /* auto does not create a stacking context */
        }

        .position-with-z-index-auto-multiple {
          position: relative;
          z-index: auto;
          margin: 10px;
          z-index: auto; /* Multiple auto values still don't create a stacking context */
        }
      `,
      warnings: 0,
      description: "z-index: auto should not create stacking context even with position",
    });
  });
});
