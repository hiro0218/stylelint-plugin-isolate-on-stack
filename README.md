# stylelint-plugin-isolate-on-stack

[![NPM version](https://img.shields.io/npm/v/stylelint-plugin-isolate-on-stack.svg)](https://www.npmjs.org/package/stylelint-plugin-isolate-on-stack)
[![Build Status](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/workflows/CI/badge.svg)](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/actions)

A Stylelint plugin that enforces the use of `isolation: isolate` when using positioning properties (`position: absolute`, `position: relative`, `position: fixed`, `position: sticky`) with `z-index`. This plugin also supports autofix functionality.

## Background

To prevent stacking context issues, it's recommended to specify `isolation: isolate` when using positioning properties and `z-index` together. This plugin detects missing settings and applies automatic fixes when needed.

## Installation

```bash
npm install --save-dev stylelint-plugin-isolate-on-stack
```

## Usage

### Configuration

Add the following to your `.stylelintrc.json` file (or other Stylelint configuration file):

```json
{
  "plugins": ["stylelint-plugin-isolate-on-stack"],
  "rules": {
    "isolate-on-stack/isolation-for-position-zindex": true
  }
}
```

### Rule Details

This plugin reports an error when a positioning property and `z-index` (except `z-index: auto`) exist but `isolation: isolate` is not specified. The error will be attached directly to each `z-index` declaration node, making it clear which declarations need to be addressed.

#### Autofix

This rule supports automatic fixing. When running the `stylelint --fix` command, it will automatically add `isolation: isolate` immediately after the last non-auto `z-index` declaration in the rule.

#### ✅ Correct Example

```css
.element {
  position: absolute;
  z-index: 10;
  isolation: isolate;
}

/* No warning, z-index: auto doesn't create a new stacking context */
.element {
  position: relative;
  z-index: auto;
}
```

#### ❌ Incorrect Example

```css
.element {
  position: absolute;
  z-index: 10;
}
```

#### Pseudo-Elements

This rule handles pseudo-elements specially:

1. When a pseudo-element uses positioning properties with `z-index`, the rule will not report any errors, as `isolation: isolate` has no effect on pseudo-elements and would be redundant.

2. When a pseudo-element already includes `isolation: isolate`, the rule will report a warning indicating that this property has no effect on pseudo-elements and should be removed.

```css
/* No error will be reported */
.element::before {
  position: absolute;
  z-index: 10;
}

/* Will report a warning to remove the redundant property */
.element::after {
  position: fixed;
  z-index: 5;
  isolation: isolate;
}
```

#### Mixed Selectors

When a rule contains both normal selectors and pseudo-element selectors, the plugin will still report errors for the normal selectors:

```css
/* Will report an error for the normal selector */
.element,
.element::before {
  position: absolute;
  z-index: 10;
}
```

The plugin distinguishes between rules containing:

1. Only pseudo-elements - No warning about missing `isolation: isolate`, warns if it's present as redundant
2. At least one normal element - Warning about missing `isolation: isolate` when position and z-index are present

#### Multiple z-index Declarations

When a rule contains multiple `z-index` declarations (except `z-index: auto`), the plugin will report errors for each non-auto declaration:

```css
/* Will report errors for both z-index declarations */
.element {
  position: absolute;
  z-index: 1;
  color: red;
  z-index: 2;
}

/* Will report an error only for z-index: 5, but not for z-index: auto */
.element {
  position: relative;
  z-index: auto;
  margin: 10px;
  z-index: 5;
}
```

When using the autofix feature, the plugin will add `isolation: isolate` after the last `z-index` declaration in the rule.
