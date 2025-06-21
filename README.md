# stylelint-plugin-isolate-on-stack

[![NPM version](https://img.shields.io/npm/v/stylelint-plugin-isolate-on-stack.svg)](https://www.npmjs.org/package/stylelint-plugin-isolate-on-stack)
[![Build Status](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/workflows/CI/badge.svg)](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/actions)

A Stylelint plugin that detects and prevents stacking context-related issues. This plugin enforces best practices for `z-index` usage and stacking context generation, aiming to improve CSS quality.

## Overview

This plugin is designed for the following purposes:

- Detect redundant or invalid uses of `isolation: isolate`
- Enforce best practices for stacking context generation
- Help understand how CSS declarations affect stacking contexts

## Stacking Context Detection

This plugin automatically detects conditions where CSS properties generate stacking contexts:

- `position: relative/absolute/fixed/sticky` + `z-index` other than `auto`
- `opacity` less than 1
- `transform` other than `none`
- `filter` other than `none`
- `backdrop-filter` other than `none`
- `mix-blend-mode` other than `normal`
- `isolation: isolate`
- `contain: layout/paint/strict/content`
- `perspective` other than `none`
- `clip-path` other than `none`
- `mask` / `mask-image` / `mask-border` other than `none`
- `will-change` with properties that generate stacking contexts

When these properties are detected, the plugin identifies redundant `isolation: isolate` declarations and encourages appropriate corrections.

## Installation

Install with the following command:

```bash
npm install --save-dev stylelint-plugin-isolate-on-stack
```

## Usage

### Configuration

Add the following to your `.stylelintrc.json` file:

```jsonc
{
  "plugins": ["stylelint-plugin-isolate-on-stack"],
  "rules": {
    // Enable stacking context related rules
    "stylelint-plugin-isolate-on-stack/no-redundant-declaration": true,
    // Detect invalid combinations with background blend modes
    "stylelint-plugin-isolate-on-stack/ineffective-on-background-blend": true,
  },
}
```

## Rules

### no-redundant-declaration

Detects redundant `isolation: isolate` declarations when stacking contexts are already created by other properties.

**Incorrect example:**

```css
.redundant {
  position: relative;
  z-index: 1;
  isolation: isolate; /* Redundant: position + z-index already creates a stacking context */
}
```

**Correct example:**

```css
.not-redundant {
  isolation: isolate; /* OK: No other properties are creating a stacking context */
}
```

### ineffective-on-background-blend

Detects invalid combinations of `background-blend-mode` and `isolation: isolate`. `isolation: isolate` does not affect the behavior of `background-blend-mode`.

**Incorrect example:**

```css
.invalid {
  background-blend-mode: multiply;
  isolation: isolate; /* Invalid: does not affect background-blend-mode */
}
```

**Correct example:**

```css
.valid {
  isolation: isolate;
  mix-blend-mode: multiply; /* OK: mix-blend-mode is affected by isolation */
}
```
