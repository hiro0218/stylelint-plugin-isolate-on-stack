import stylelint from "stylelint";
import plugin from "./index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { ruleName } = plugin;

const testRule = async (options) => {
  const { code, fixed, warnings } = options;

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
    expect(result.code).toEqual(fixed);
  }

  if (warnings) {
    expect(result.results[0].warnings).toHaveLength(warnings);
  } else {
    expect(result.results[0].warnings).toHaveLength(0);
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

  it("should report error for pseudo-element but not autofix", async () => {
    await testRule({
      code: `
        .test::before {
          position: absolute;
          z-index: 1;
        }
      `,
      // fixedは指定しない - 疑似要素には自動修正を適用しないため
      warnings: 1,
      description: "should report error for pseudo-element but not apply autofix",
    });
  });

  it("should report error for single colon pseudo-element but not autofix", async () => {
    await testRule({
      code: `
        .test:before {
          position: fixed;
          z-index: 1;
        }
      `,
      // fixedは指定しない - 疑似要素には自動修正を適用しないため
      warnings: 1,
      description: "should report error for single colon pseudo-element but not apply autofix",
    });
  });

  it("should explicitly not autofix pseudo-elements when fix is enabled", async () => {
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
    expect(result.results[0].warnings).toHaveLength(1);
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

  it("should report correct message when pseudo-element has isolation: isolate", async () => {
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

    expect(result.results[0].warnings).toHaveLength(1);
    expect(result.results[0].warnings[0].text).toContain("has no effect on pseudo-elements");
  });
});
