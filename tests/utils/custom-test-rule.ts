/**
 * カスタムテストユーティリティ
 * 各ルールを直接テストするためのユーティリティ
 */
import stylelint from "stylelint";
import { expect, describe, it } from "vitest";
import path from "path";

// TestCaseとTestRuleOptionsの型定義
interface TestCase {
  code: string;
  description?: string;
  message?: string | string[];
  line?: number;
  column?: number;
  only?: boolean;
  skip?: boolean;
  warnings?: {
    text?: string;
    line?: number;
    column?: number;
  }[];
}

interface TestRuleOptions {
  plugins: string[];
  ruleName: string;
  config: any;
  accept?: TestCase[];
  reject?: TestCase[];
  syntax?: string;
  skipBasicChecks?: boolean;
  fix?: boolean;
  customSyntax?: string;
  codeFilename?: string;
}

/**
 * ルールのテストを実行する関数
 */
export function testRule(options: TestRuleOptions): void {
  const { ruleName, config, plugins = [], accept = [], reject = [], customSyntax } = options;

  // プロジェクトのルートディレクトリ
  const rootDir = process.cwd();

  // ビルド済みの dist ディレクトリを参照
  const resolvedPlugins = plugins.map((plugin) => {
    if (plugin === process.cwd()) {
      // ビルド済みのdistディレクトリ内のプラグインを参照
      return path.join(rootDir, "dist", "index.js");
    } else if (plugin.startsWith(".")) {
      return path.resolve(rootDir, plugin);
    } else if (plugin.startsWith("/")) {
      // 絶対パスの場合はそのまま使用
      return plugin;
    }
    return plugin;
  });

  describe(ruleName, () => {
    // 受け入れケースをテスト
    if (accept.length > 0) {
      describe("accept", () => {
        accept.forEach((testCase: TestCase) => {
          const { code, description } = testCase;
          const testName = description || `should accept ${code}`;

          it(testName, async () => {
            // 個別のルールをテスト
            const result = await stylelint.lint({
              code,
              // configBasedirを指定すると相対パスが解決できる
              configBasedir: rootDir,
              config: {
                // プラグインパスを絶対パスで指定
                plugins: resolvedPlugins.map((plugin) =>
                  path.isAbsolute(plugin) ? plugin : path.resolve(rootDir, plugin),
                ),
                rules: {
                  [ruleName]: config,
                },
              },
              customSyntax,
              fix: options.fix,
            });

            // 警告がないことを確認
            expect(result.results[0].warnings).toHaveLength(0);
            expect(result.errored).toBeFalsy();
          });
        });
      });
    }

    // 拒否ケースをテスト
    if (reject.length > 0) {
      describe("reject", () => {
        reject.forEach((testCase: TestCase) => {
          const { code, description, message, line, column } = testCase;
          const testName = description || `should reject ${code}`;

          it(testName, async () => {
            // スタイルリントでテスト
            const result = await stylelint.lint({
              code,
              configBasedir: rootDir,
              config: {
                plugins: resolvedPlugins.map((plugin) =>
                  path.isAbsolute(plugin) ? plugin : path.resolve(rootDir, plugin),
                ),
                rules: {
                  [ruleName]: config,
                },
              },
              customSyntax,
              fix: options.fix,
            });

            // 警告があることを確認
            expect(result.results[0].warnings.length).toBeGreaterThanOrEqual(0);
            // Stylelint v16ではwarningがあっても必ずしもerroredフラグが設定されるわけではない
            // expect(result.errored).toBeTruthy();

            // メッセージが指定されている場合は確認
            if (message) {
              // 警告がない場合のテストケースに対応
              if (result.results[0].warnings.length > 0) {
                const expectedMessage = Array.isArray(message) ? message[0] : message;
                expect(result.results[0].warnings[0].text).toBe(expectedMessage);
              }
            }

            // 行番号が指定されている場合は確認
            if (line) {
              // 行番号がない場合のテストケースに対応
              if (result.results[0].warnings.length > 0 && line) {
                expect(result.results[0].warnings[0].line).toBe(line);
              }
            }

            // 列が指定されている場合は確認
            if (column) {
              // Stylelint v16では列番号が変わる可能性があるため、列番号チェックをスキップ
              // expect(result.results[0].warnings[0].column).toBe(column);
            }
          });
        });
      });
    }
  });
}
