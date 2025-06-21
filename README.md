# stylelint-plugin-isolate-on-stack

[![NPM version](https://img.shields.io/npm/v/stylelint-plugin-isolate-on-stack.svg)](https://www.npmjs.org/package/stylelint-plugin-isolate-on-stack)
[![Build Status](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/workflows/CI/badge.svg)](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/actions)

A Stylelint plugin that detects and prevents stacking context-related issues. This plugin enforces best practices for `z-index` usage and stacking context generation, aiming to improve CSS quality.

## Overview

This plugin is designed for the following purposes:

- Detect redundant or invalid uses of `isolation: isolate`
- Warn against excessively high `z-index` values
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
    // Warn against excessively high z-index values
    "stylelint-plugin-isolate-on-stack/z-index-range": [true, { "maxZIndex": 100 }],
    // Encourage explicit isolation over properties with side effects
    "stylelint-plugin-isolate-on-stack/prefer-over-side-effects": true,
    // Warn about stacking contexts with high descendant counts
    "stylelint-plugin-isolate-on-stack/performance-high-descendant-count": [true, { "maxDescendantCount": 50 }],
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

### z-index-range

Detects excessively high `z-index` values. By default, values exceeding 100 will trigger a warning.

**Incorrect example:**

```css
.too-high {
  z-index: 9999; /* Excessively high value */
}
```

**Correct example:**

```css
.reasonable {
  z-index: 10; /* Within reasonable range */
}
```

### prefer-over-side-effects

Encourages the use of explicit `isolation: isolate` over properties with side effects when the sole purpose is to create a stacking context.

**Incorrect example:**

```css
.hacky {
  opacity: 0.999; /* Almost not transparent but used to create a stacking context */
}

.hacky-transform {
  transform: translateZ(0); /* Hack to create a stacking context */
}
```

**Correct example:**

```css
.explicit {
  isolation: isolate; /* Explicitly creates a stacking context */
}
```

### performance-high-descendant-count

Warns when elements creating stacking contexts contain a high number of descendant elements. Stacking contexts with many descendants can impact browser rendering performance.

**Incorrect example:**

```css
.complex-stacking-context {
  position: relative;
  z-index: 1;
  /* This will trigger a warning if the element has more than 100 descendants */
}
```

**Correct example:**

```css
.optimized-structure {
  /* Optimize DOM structure to keep descendant count within limits */
  isolation: isolate;
}
```
