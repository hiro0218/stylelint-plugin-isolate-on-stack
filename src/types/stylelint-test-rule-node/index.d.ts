declare module "stylelint-test-rule-node" {
  export interface TestCase {
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

  export interface TestRuleOptions {
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

  export function testRule(options: TestRuleOptions): void;
}
