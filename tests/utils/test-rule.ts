/**
 * カスタムテストユーティリティ
 * 各ルールを直接テストするためのユーティリティ
 */
import stylelint, { lint } from "stylelint";
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
  const { ruleName, config, accept = [], reject = [] } = options;

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
              config: {
                rules: {
                  [ruleName]: config,
                },
              },
              customSyntax: "postcss-scss",
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
              config: {
                rules: {
                  [ruleName]: config,
                },
              },
              customSyntax: "postcss-scss",
            });

            // 警告があることを確認
            expect(result.results[0].warnings.length).toBeGreaterThan(0);
            expect(result.errored).toBeTruthy();

            // メッセージが指定されている場合は確認
            if (message) {
              const expectedMessage = Array.isArray(message)
                ? message[0]
                : message;
              expect(result.results[0].warnings[0].text).toBe(expectedMessage);
            }

            // 行番号が指定されている場合は確認
            if (line) {
              expect(result.results[0].warnings[0].line).toBe(line);
            }

            // 列が指定されている場合は確認
            if (column) {
              expect(result.results[0].warnings[0].column).toBe(column);
            }
          });
        });
      });
    }
  });
}
