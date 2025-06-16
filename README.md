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

This plugin reports an error in the following cases:

- When a positioning property (`position: absolute`, `position: relative`, `position: fixed`, `position: sticky`) and `z-index` exist but `isolation: isolate` is not specified

#### Autofix

This rule supports automatic fixing. When running the `stylelint --fix` command, it will automatically add `isolation: isolate` immediately after `z-index`.

#### ✅ Correct Examples

```css
/* With position: absolute */
.element1 {
  position: absolute;
  z-index: 10;
  isolation: isolate;
}

/* With position: relative */
.element2 {
  position: relative;
  z-index: 10;
  isolation: isolate;
}

/* With position: fixed */
.element3 {
  position: fixed;
  z-index: 10;
  isolation: isolate;
}

/* With position: sticky */
.element4 {
  position: sticky;
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

This rule will still report errors for pseudo-elements (like `::before`, `::after`) that use positioning properties with `z-index` but lack `isolation: isolate`. However, the automatic fix will not be applied to pseudo-elements, as `isolation: isolate` has no effect on them.

Example of a pseudo-element that will be reported but not auto-fixed:

```css
.element::before {
  position: absolute;
  z-index: 10;
  /* isolation: isolate would be reported as missing, but not auto-fixed */
}
```
