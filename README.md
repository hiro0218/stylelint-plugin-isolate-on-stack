# stylelint-plugin-isolate-on-stack

[![NPM version](https://img.shields.io/npm/v/stylelint-plugin-isolate-on-stack.svg)](https://www.npmjs.org/package/stylelint-plugin-isolate-on-stack)
[![Build Status](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/workflows/CI/badge.svg)](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/actions)

A Stylelint plugin that enforces the use of `isolation: isolate` when using positioning properties (`position: absolute`, `position: relative`, `position: fixed`, `position: sticky`) with `z-index`. This plugin also supports autofix functionality.

## Background

To prevent stacking context issues, it's recommended to specify `isolation: isolate` when using positioning properties and `z-index` together. This plugin detects missing settings and applies automatic fixes when needed.

### Stacking Context Detection

This plugin automatically detects the presence of other CSS properties that create stacking contexts, such as:

- `opacity` values less than 1
- `transform` (except `none`)
- `filter` (except `none`)
- `backdrop-filter` (except `none`)
- `perspective` (except `none`)
- `clip-path` (except `none`)
- `mask` (except `none`)
- `mask-image` (except `none`)
- `mask-border` (except `none`)
- `mix-blend-mode` (except `normal`)
- `will-change` properties that would create stacking contexts

When these properties are detected, the plugin automatically suppresses warnings about missing `isolation: isolate` since these properties already create a stacking context equivalent to using `isolation: isolate`.

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

## Advanced Options

This plugin supports several configuration options to make it more flexible and avoid redundant warnings.

### Secondary Options

```json
{
  "plugins": ["stylelint-plugin-isolate-on-stack"],
  "rules": {
    "isolate-on-stack/isolation-for-position-zindex": [
      true,
      {
        "ignoreClasses": ["no-isolation", "stacking-context"],
        "ignoreSelectors": ["\\.header", "\\.banner"],
        "ignoreElements": ["header", "footer"],
        "requireClasses": ["stacking-required"]
      }
    ]
  }
}
```

#### `ignoreClasses`

An array of class names to ignore. When a selector contains any of these class names, the rule will not report errors for that selector.

```css
/* No error will be reported if 'no-isolation' is in ignoreClasses */
.element.no-isolation {
  position: fixed;
  z-index: 100;
}
```

#### `ignoreSelectors`

An array of regular expression patterns. The rule will not be applied to selectors that match the specified patterns. This is useful for excluding specific selectors with finer granularity.

```css
/* No error will be reported if '\.header' is in ignoreSelectors */
.header {
  position: fixed;
  z-index: 100;
}
```

#### `ignoreElements`

An array of HTML element names. The rule will not be applied to the specified elements. This is useful when you want to exclude specific HTML elements.

```css
/* No error will be reported if 'header' is in ignoreElements */
header {
  position: sticky;
  z-index: 5;
}
```

#### `requireClasses`

An array of class names. Selectors containing the specified classes will always require `isolation: isolate`. This is useful when you want to enforce isolation for specific classes even without position properties or `z-index`.

```css
/* Error will be reported if 'stacking-required' is in requireClasses, even without position or z-index */
.stacking-required {
  color: blue;
}
```

### Disabling with Comments

You can disable the rule for specific lines using standard Stylelint disable comments:

```css
/* stylelint-disable-next-line isolate-on-stack/isolation-for-position-zindex */
.element {
  position: absolute;
  z-index: 5;
}

/* stylelint-disable isolate-on-stack/isolation-for-position-zindex */
.element {
  position: fixed;
  z-index: 10;
}
/* stylelint-enable isolate-on-stack/isolation-for-position-zindex */
```
