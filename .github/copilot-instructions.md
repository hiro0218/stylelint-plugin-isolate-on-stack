# Copilot Instructions - Stylelint Plugin Isolate on Stack

## Project Overview

This repository contains **stylelint-plugin-isolate-on-stack** - a Stylelint plugin to detect redundant or invalid uses of 'isolation: isolate' in CSS.

### Purpose

- Detect redundant or invalid uses of `isolation: isolate` in CSS
- Identify stacking context generation rule violations
- Enforce best practices for CSS layer management and performance
- Prevent unnecessary isolation properties that don't provide value

## Tech Stack

- **Language**: TypeScript (prefer TypeScript for JavaScript code)
- **Testing Framework**: Vitest
- **Linting**: ESLint + Prettier
- **Build Tool**: TypeScript Compiler
- **Package Manager**: npm
- **Module System**: ES Modules
- **Node Version**: >=20
- **Stylelint Version**: >=16.0.0

## Project Structure

```
src/
├── rules/                    # Individual rule implementations
│   ├── stacking-context/     # Rules for stacking context validation
│   │   ├── ineffective-on-background-blend.ts
│   │   ├── no-redundant-declaration.ts
│   │   ├── performance-high-descendant-count.ts
│   │   └── prefer-over-side-effects.ts
│   └── z-index-range/       # Rules for z-index validation
│       └── index.ts
├── utils/                   # Shared utilities
│   ├── message.ts           # Message formatting utilities
│   └── stacking-context.ts  # Stacking context detection utilities
├── types/                   # TypeScript type definitions
│   └── stylelint-test-rule-node/ # Type definitions for testing
└── index.ts                # Main entry point
tests/
├── rules/                  # Rule tests
│   ├── stacking-context/   # Tests for stacking context rules
│   └── z-index-range/      # Tests for z-index rules
├── utils/                  # Test utilities
│   ├── custom-test-rule.ts
│   └── stacking-context.test.ts
example.css                 # Example CSS for testing
```

## Stacking Context Knowledge

### Conditions that Create Stacking Contexts

- `position: relative/absolute/fixed/sticky` + `z-index` other than `auto`
- `opacity` less than 1
- `transform` other than `none`
- `filter` other than `none`
- `isolation: isolate`
- `mix-blend-mode` other than `normal`
- `contain: layout/paint/strict/content`
- `will-change` with compositing properties
- `backdrop-filter` other than `none`
- `clip-path` other than `none`
- `mask` / `mask-image` / `mask-border`
- `perspective` other than `none`

### Common Problem Patterns

- Redundant `isolation: isolate` that doesn't create meaningful stacking contexts
- Using `isolation: isolate` without understanding its performance implications
- Applying isolation unnecessarily when other stacking context methods would be more appropriate
- Missing isolation when it would actually be beneficial for layer management

## Development Guidelines

### Code Quality Standards

- All code must be written in TypeScript
- Strictly adhere to ESLint and Prettier configurations
- Test coverage must meet the following thresholds:
  - Branch coverage: 85% or higher
  - Function coverage: 90% or higher
  - Line coverage: 85% or higher
  - Statement coverage: 85% or higher
- JSDoc comments are mandatory for all public APIs
- Maintain TypeScript `strict: true` configuration
- Use kebab-case for all file and directory names

### Rule Implementation Pattern

```typescript
import { Rule } from "stylelint";
import { Declaration, Rule as PostCSSRule } from "postcss";
import { alreadyCreatesStackingContext } from "../../utils/stacking-context.js";
import { noRedundantDeclarationMessages } from "../../utils/message.js";

const ruleName = "stylelint-plugin-isolate-on-stack/no-redundant-declaration";

const rule: Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    // Skip if primary option is not true
    if (primary !== true) return;

    // Check declarations that might be redundant
    root.walkDecls("isolation", (decl) => {
      if (decl.value !== "isolate") return;

      const rule = decl.parent;
      if (!rule || rule.type !== "rule") return;

      // Get all properties for this selector
      const properties = collectElementProperties(root).get(rule.selector);
      if (!properties) return;

      // Convert to a format compatible with utility functions
      const propsRecord: Record<string, any> = {};
      properties.forEach((value, key) => {
        propsRecord[key] = value;
      });

      // Check if other properties already create a stacking context
      if (alreadyCreatesStackingContext(propsRecord)) {
        // Report the violation
        report({
          message: noRedundantDeclarationMessages.rejected,
          node: decl,
          result,
          ruleName,
        });
      }
    });
  };
};

rule.ruleName = ruleName;
rule.messages = noRedundantDeclarationMessages;

export default rule;
```

### Test Implementation Pattern

```typescript
import { testRule } from "../../utils/custom-test-rule";
import rule from "../../../src/rules/stacking-context/no-redundant-declaration";
import { noRedundantDeclarationMessages } from "../../../src/utils/message";

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
      code: ".valid { position: relative; }",
      description: "Position alone does not create a stacking context",
    },
    // More valid cases...
  ],

  reject: [
    {
      code: ".invalid { position: relative; z-index: 1; isolation: isolate; }",
      description: "Redundant isolation with position + z-index",
      message: noRedundantDeclarationMessages.rejected,
      line: 1,
      column: 49,
    },
    // More invalid cases...
  ],
});
```

## Naming Conventions

### Files & Directories

- Use kebab-case for file names and directories
- Rule names should clearly express functionality
- Test files should match rule file names with `.test.ts` suffix

### Variables & Functions

- Use camelCase for variables and functions
- Boolean values should start with `is`, `has`, `should`, `can`
- Function names should be descriptive verbs
- Constants should use UPPER_SNAKE_CASE

### Rule Naming

- Use namespace prefix: `stylelint-plugin-isolate-on-stack/rule-name`
- Keep rule names concise but descriptive
- Use kebab-case for rule names

### CSS Property Analysis

```typescript
const ISOLATION_PROPERTY = "isolation";
const ISOLATION_VALUES = ["auto", "isolate"] as const;

const STACKING_CONTEXT_PROPERTIES = [
  "position",
  "opacity",
  "transform",
  "filter",
  "isolation",
  "mix-blend-mode",
  "contain",
  "will-change",
  "backdrop-filter",
  "clip-path",
  "mask",
  "mask-image",
  "mask-border",
  "perspective",
] as const;

const POSITIONING_VALUES = ["relative", "absolute", "fixed", "sticky"] as const;
```

### Utility Functions for Isolation Detection

```typescript
import { Declaration, Rule as PostCSSRule } from "postcss";

function isRedundantIsolation(decl: Declaration): boolean {
  if (decl.prop !== "isolation" || decl.value !== "isolate") {
    return false;
  }

  const parentRule = decl.parent;
  if (!parentRule || parentRule.type !== "rule") return false;

  // Check if there are other stacking context creating properties
  const hasOtherStackingContext = parentRule.nodes.some(
    (node) =>
      node.type === "decl" && node !== decl && createsStackingContext(node),
  );

  // If no other stacking context creators, isolation might be redundant
  return !hasOtherStackingContext;
}

function createsStackingContext(decl: Declaration): boolean {
  const { prop, value } = decl;

  switch (prop) {
    case "position":
      return (
        POSITIONING_VALUES.includes(value as any) && hasZIndexSibling(decl)
      );
    case "opacity":
      return parseFloat(value) < 1;
    case "transform":
      return value !== "none";
    case "filter":
      return value !== "none";
    case "isolation":
      return value === "isolate";
    case "mix-blend-mode":
      return value !== "normal";
    case "contain":
      return ["layout", "paint", "strict", "content"].some((v) =>
        value.includes(v),
      );
    case "will-change":
      return ["transform", "opacity", "filter"].some((prop) =>
        value.includes(prop),
      );
    default:
      return false;
  }
}

function hasStackingRelevantSiblings(decl: Declaration): boolean {
  const parentRule = decl.parent;
  if (!parentRule || parentRule.type !== "rule") return false;

  return parentRule.nodes.some(
    (node) =>
      node.type === "decl" &&
      node !== decl &&
      ["z-index", "position", "transform", "opacity"].includes(node.prop),
  );
}
```

## Performance Considerations

- Optimize for large CSS files (>10MB)
- Minimize memory usage by avoiding unnecessary data structures
- Use efficient algorithms for AST traversal
- Cache computed values when possible
- Implement early returns for better performance
- Use Set/Map for O(1) lookups instead of arrays

## Error Messages Guidelines

### Message Structure

```typescript
const messages = {
  // Use descriptive, actionable messages
  redundantIsolation: () =>
    `Redundant 'isolation: isolate' without meaningful stacking context benefits.`,

  unnecessaryIsolation: () =>
    `'isolation: isolate' may be unnecessary. Consider if this creates intended layer separation.`,

  performanceImpact: () =>
    `'isolation: isolate' creates new stacking context, which may impact performance.`,
};
```

### Message Best Practices

- Provide clear, actionable feedback
- Include the problematic value in the message
- Suggest alternatives when possible
- Keep messages concise but informative

## Debugging & Troubleshooting

### Common Issues

1. **PostCSS parser errors**: Ensure CSS syntax is valid
2. **Rule false positives**: Check property value parsing logic
3. **TypeScript compilation errors**: Verify type definitions
4. **Performance issues**: Profile with large CSS files

### Debugging Methods

```bash
# Run all tests
npm test

# Run specific rule tests
npm test -- --reporter=verbose rules/isolate-usage

# Run tests with CSS examples
npm run lint:css
```

## External Dependencies

### Required Dependencies

```json
{
  "stylelint": ">=16.0.0",
  "postcss": "^8.5.6"
}
```

### Development Dependencies

```json
{
  "@vitest/coverage-v8": "^3.2.4",
  "eslint": "^9.29.0",
  "husky": "^9.1.7",
  "lint-staged": "^16.1.2",
  "prettier": "^3.5.3",
  "typescript": "^5.8.3",
  "vitest": "^3.2.4"
}
```

## Rule Configuration Schema

```typescript
export type BaseRuleProps = {
  severity?: "error" | "warning"; // Error level setting
  ignoreSelectors?: string[]; // Array of selectors to ignore
  ignoreProperties?: string[]; // Array of properties to ignore
};

export type IsolationRuleProps = BaseRuleProps & {
  allowRedundant?: boolean; // Allow redundant isolation declarations
  checkPerformanceImpact?: boolean; // Check performance impact
  requireContext?: boolean; // Require stacking context creation
};
```

## Plugin Architecture

### Core Components

- **Rule Engine**: Validates CSS against stacking context rules
- **AST Walker**: Traverses PostCSS AST efficiently
- **Message Reporter**: Formats and reports violations
- **Configuration Parser**: Handles rule options and validation
- **Utility Functions**: Shared logic for stacking context detection

### Plugin Entry Point

```typescript
/**
 * Stacking context related plugin for Stylelint
 * Detects redundant or invalid uses of isolation: isolate
 */
import stylelint from "stylelint";
import noRedundantDeclarationRule from "./rules/stacking-context/no-redundant-declaration.js";
import ineffectiveOnBackgroundBlendRule from "./rules/stacking-context/ineffective-on-background-blend.js";
import preferOverSideEffectsRule from "./rules/stacking-context/prefer-over-side-effects.js";
import zIndexRangeRule from "./rules/z-index-range/index.js";
import performanceHighDescendantCountRule from "./rules/stacking-context/performance-high-descendant-count.js";

// Plugin namespace
const namespace = "stylelint-plugin-isolate-on-stack";

// Register each rule as a Stylelint plugin
const noRedundantDeclaration = stylelint.createPlugin(
  `${namespace}/no-redundant-declaration`,
  noRedundantDeclarationRule,
);

const ineffectiveOnBackgroundBlend = stylelint.createPlugin(
  `${namespace}/ineffective-on-background-blend`,
  ineffectiveOnBackgroundBlendRule,
);

// ... more rules registration

// Plugin array for Stylelint v16 ESM format
const plugins = [
  noRedundantDeclaration,
  ineffectiveOnBackgroundBlend,
  preferOverSideEffects,
  zIndexRange,
  performanceHighDescendantCount,
];

// Default export for ESM
export default plugins;
```

## CI/CD Configuration

### GitHub Actions Example

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js version from package.json
        uses: actions/setup-node@v4
        with:
          node-version-file: package.json
          cache: "npm"

      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

## Best Practices for Contributors

- Write comprehensive tests before implementing features
- Use TypeScript strict mode for better type safety
- Document complex algorithms with inline comments
- Keep rules focused on single responsibilities
- Provide clear error messages with actionable advice
- Consider edge cases in CSS syntax and browser differences
- Maintain backward compatibility when possible
- Follow semantic versioning for releases
- Add integration tests for real-world CSS scenarios

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md` with new features/fixes
3. Run full test suite: `npm run test:ci`
4. Build distribution: `npm run build`
5. Publish to npm: `npm publish`
6. Create GitHub release with tag
7. Update documentation if needed

## Integration Examples

### With Stylelint Config

```javascript
// .stylelintrc.js
module.exports = {
  plugins: ["stylelint-plugin-isolate-on-stack"],
  rules: {
    "stylelint-plugin-isolate-on-stack/no-redundant-declaration": true,
    "stylelint-plugin-isolate-on-stack/ineffective-on-background-blend": true,
    "stylelint-plugin-isolate-on-stack/prefer-over-side-effects": true,
    "stylelint-plugin-isolate-on-stack/z-index-range": true,
    "stylelint-plugin-isolate-on-stack/performance-high-descendant-count": [
      true,
      {
        allowRedundant: false,
        checkPerformanceImpact: true,
        ignoreSelectors: [".modal", ".tooltip"],
      },
    ],
  },
};
```

---

This plugin aims to improve CSS maintainability and performance by preventing redundant uses of `isolation: isolate` and promoting clean, efficient layer management in stylesheets.
