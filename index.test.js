import stylelint from "stylelint";
import plugin from "./index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { ruleName, messages } = plugin;

const testRule = async (options) => {
    const { code, fixed, description, warnings } = options;

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
        expect(result.output).toEqual(fixed);
    }

    if (warnings) {
        expect(result.results[0].warnings).toHaveLength(warnings);
    } else {
        expect(result.results[0].warnings).toHaveLength(0);
    }
};

describe("isolate-on-stack/isolation-for-absolute-zindex rule", () => {
    it("flags position: absolute with z-index but no isolation", async () => {
        await testRule({
            code: `
        .test {
          position: absolute;
          z-index: 1;
        }
      `,
            warnings: 1,
            description: "should flag when position: absolute and z-index are used without isolation: isolate",
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
            warnings: 1,
            description: "should only flag the first rule",
        });
    });
});
