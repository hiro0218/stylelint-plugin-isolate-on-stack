# stylelint-plugin-isolate-on-stack

[![NPM version](https://img.shields.io/npm/v/stylelint-plugin-isolate-on-stack.svg)](https://www.npmjs.org/package/stylelint-plugin-isolate-on-stack)
[![Build Status](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/workflows/CI/badge.svg)](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/actions)

A Stylelint plugin for optimal stacking context management. It validates the usage of `isolation: isolate` property by checking for redundant declarations and detecting cases where the property should be used with positioning and z-index values.

## Background

To create proper stacking contexts in CSS, it's recommended to use `isolation: isolate` when applying positioning properties with z-index. This plugin helps enforce this practice by:

1. Detecting redundant `isolation: isolate` declarations when other properties already create stacking contexts
2. Warning about ineffective combinations like `isolation: isolate` with `background-blend-mode`
3. Identifying cases where `isolation: isolate` is required based on your configuration

### Stacking Context Detection

This plugin automatically detects the presence of CSS properties that create stacking contexts, such as:

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

When these properties are detected, the plugin automatically identifies redundant `isolation: isolate` declarations since these properties already create their own stacking contexts.

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
    "isolate-on-stack/no-redundant-declaration": true
  }
}
```

### Rule Details

This plugin checks for the following issues:

- **Redundant usage**: When `isolation: isolate` is specified but other properties already create a stacking context
- **Ineffective combinations**: When `isolation: isolate` is used with `background-blend-mode` (which has no effect)
- **Pseudo-element restrictions**: When `isolation: isolate` is used on pseudo-elements where it has no effect
- **Required usage**: When a selector specified in `requireClasses` requires `isolation: isolate` but it's not present

#### ✅ Correct Examples

```css
/* Proper use of isolation with positioning and z-index */
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

/* No warning, a stacking context is already created by other properties */
.element {
  position: absolute;
  z-index: 5;
  opacity: 0.9;
}

/* Proper use of isolation for mix-blend-mode scope control */
.blend-container {
  isolation: isolate;
}
.blend-container .blended {
  mix-blend-mode: multiply;
}
```

#### ❌ Incorrect Examples

```css
/* Redundant isolation: isolate with existing stacking context */
.element {
  position: absolute;
  z-index: 5;
  opacity: 0.8; /* Already creates a stacking context */
  isolation: isolate; /* Redundant */
}

/* Invalid combination with background-blend-mode */
.element {
  background-blend-mode: multiply;
  isolation: isolate; /* Invalid: isolation doesn't affect background-blend-mode */
}

/* Ineffective on pseudo-elements */
.element::after {
  position: fixed;
  z-index: 5;
  isolation: isolate; /* No effect on pseudo-elements */
}
```

### Pseudo-Element Handling

The plugin handles pseudo-elements specially, recognizing that most pseudo-elements cannot have their own stacking contexts:

```css
/* Will report a warning to remove the redundant property */
.element::after {
  position: fixed;
  z-index: 5;
  isolation: isolate; /* Will trigger a warning */
}
```

The plugin identifies these specific pseudo-elements where stacking contexts are allowed:

- `::first-letter`
- `::first-line`
- `::marker`

For other pseudo-elements, the plugin will warn about redundant `isolation: isolate` declarations.

## Advanced Options

The plugin supports the following configuration options:

```json
{
  "plugins": ["stylelint-plugin-isolate-on-stack"],
  "rules": {
    "isolate-on-stack/no-redundant-declaration": [
      true,
      {
        "ignoreWhenStackingContextExists": true,
        "ignoreSelectors": ["^\\.ignore-"],
        "ignoreElements": ["header", "footer"],
        "ignoreClasses": ["no-isolate"],
        "requireClasses": ["require-isolate"]
      }
    ]
  }
}
```

### Configuration Options

- **ignoreWhenStackingContextExists**: When `true`, the plugin ignores checks when a stacking context already exists. Default is `false`.

- **ignoreSelectors**: An array of regex patterns. Selectors matching these patterns will be ignored.

  ```css
  /* No errors reported if "^\\.header" is in ignoreSelectors */
  .header {
    position: fixed;
    z-index: 100;
  }
  ```

- **ignoreElements**: An array of HTML element names to ignore.

  ```css
  /* No errors reported if "header" is in ignoreElements */
  header {
    position: sticky;
    z-index: 5;
  }
  ```

- **ignoreClasses**: An array of class names to ignore.

  ```css
  /* No errors reported if "no-isolate" is in ignoreClasses */
  .element.no-isolate {
    position: fixed;
    z-index: 100;
  }
  ```

- **requireClasses**: An array of class names that always require `isolation: isolate`.
  ```css
  /* Error reported if "require-isolate" is in requireClasses and isolation is missing */
  .require-isolate {
    position: relative;
    z-index: 5;
  }
  ```

### Disabling Rules

You can disable the rule for specific lines using standard Stylelint disable comments:

```css
/* stylelint-disable-next-line isolate-on-stack/no-redundant-declaration */
.element {
  position: absolute;
  z-index: 5;
  isolation: isolate; /* This would normally trigger a redundant warning */
}
```

## Technical Implementation

### Rule Messages

The plugin provides the following messages:

- **redundantStackingContext**: Warns when `isolation: isolate` is redundant because a stacking context already exists.
- **ineffectiveOnBackgroundBlend**: Warns that `isolation: isolate` has no effect on `background-blend-mode`.
- **redundant**: Warns when `isolation: isolate` has no effect on pseudo-elements.
- **expectedRequired**: Warns when a selector requires `isolation: isolate` but it's not specified.

### Stacking Context Detection

The plugin detects properties that create stacking contexts:

```javascript
const CSS = {
  POSITION_KEY: "position",
  POSITION_STACKING_VALUES: ["absolute", "relative", "fixed", "sticky"],
  Z_INDEX_KEY: "z-index",
  ISOLATION_KEY: "isolation",
  ISOLATION_VALUE_ISOLATE: "isolate",
  STACKING_CONTEXT_PROPS: {
    OPACITY: "opacity",
    TRANSFORM: "transform",
    FILTER: "filter",
    BACKDROP_FILTER: "backdrop-filter",
    PERSPECTIVE: "perspective",
    CLIP_PATH: "clip-path",
    MASK: "mask",
    MASK_IMAGE: "mask-image",
    MASK_BORDER: "mask-border",
    MIX_BLEND_MODE: "mix-blend-mode",
    BACKGROUND_BLEND_MODE: "background-blend-mode",
    WILL_CHANGE: "will-change",
  },
};
```

### Pseudo-Element Detection

The plugin uses the following patterns to detect pseudo-elements:

```javascript
// Pseudo-element pattern
const PSEUDO_ELEMENT_PATTERN =
  /(::|:)(before|after|first-letter|first-line|selection|backdrop|placeholder|marker|spelling-error|grammar-error)/;

// Pseudo-elements where stacking contexts are allowed
const STACKING_ALLOWED_PSEUDO_ELEMENTS = [
  "first-letter",
  "first-line",
  "marker",
];
```

The plugin validates CSS rules by checking:

1. If selectors are pseudo-elements
2. If `isolation: isolate` is present
3. If other stacking context properties exist
4. If there are any ineffective combinations
5. If a selector requires `isolation: isolate`

This helps maintain optimal and efficient CSS by preventing redundant or ineffective declarations.
