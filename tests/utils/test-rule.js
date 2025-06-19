/**
 * カスタムテストユーティリティ
 * stylelint-test-rule-nodeの代わりにStylelintのAPIを直接使用
 */
import stylelint from "stylelint";
import path from "path";

/**
 * ルールのテストを実行する関数
 */
export function testRule(options) {
  const {
    ruleName,
    config,
    plugins = [],
    accept = [],
    reject = [],
    customSyntax,
  } = options;

  // プロジェクトのルートディレクトリ
  const rootDir = path.resolve(process.cwd());

  // プラグインパスを絶対パスに変換
  const resolvedPlugins = plugins.map((plugin) => {
    if (plugin.startsWith(".")) {
      return path.resolve(rootDir, plugin);
    }
    return plugin;
  });

  describe(ruleName, () => {
    // 受け入れケースをテスト
    if (accept.length > 0) {
      describe("accept", () => {
        accept.forEach((testCase) => {
          const { code, description } = testCase;
          const testName = description || `should accept ${code}`;

          it(testName, async () => {
            const result = await stylelint.lint({
              code,
              configBasedir: rootDir,
              config: {
                plugins: resolvedPlugins,
                rules: {
                  [ruleName]: config,
                },
              },
              customSyntax,
            });

            expect(result.errored).toBeFalsy();
            expect(result.results[0].warnings).toHaveLength(0);
          });
        });
      });
    }

    // 拒否ケースをテスト
    if (reject.length > 0) {
      describe("reject", () => {
        reject.forEach((testCase) => {
          const { code, description, message, line, column } = testCase;
          const testName = description || `should reject ${code}`;

          it(testName, async () => {
            const result = await stylelint.lint({
              code,
              configBasedir: rootDir,
              config: {
                plugins: resolvedPlugins,
                rules: {
                  [ruleName]: config,
                },
              },
              customSyntax,
            });

            expect(result.errored).toBeTruthy();
            expect(result.results[0].warnings).toHaveLength(1);

            if (message) {
              expect(result.results[0].warnings[0].text).toBe(message);
            }

            if (line) {
              expect(result.results[0].warnings[0].line).toBe(line);
            }

            if (column) {
              expect(result.results[0].warnings[0].column).toBe(column);
            }
          });
        });
      });
    }
  });
}
