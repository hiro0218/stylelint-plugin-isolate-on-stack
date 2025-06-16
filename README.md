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

This plugin reports an error when a positioning property and `z-index` exist but `isolation: isolate` is not specified.

#### Autofix

This rule supports automatic fixing. When running the `stylelint --fix` command, it will automatically add `isolation: isolate` immediately after `z-index`.

#### ✅ Correct Example

```css
.element {
  position: absolute;
  z-index: 10;
  isolation: isolate;
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

This rule handles pseudo-elements in two ways:

1. When a pseudo-element uses positioning properties with `z-index` but lacks `isolation: isolate`, the rule will report an error but will not automatically fix it, as `isolation: isolate` has no effect on pseudo-elements.

2. When a pseudo-element already includes `isolation: isolate`, the rule will report a warning indicating that this property has no effect on pseudo-elements and should be removed.

```css
/* Will report an error but won't be auto-fixed */
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
