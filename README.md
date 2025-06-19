# stylelint-plugin-isolate-on-stack

[![NPM version](https://img.shields.io/npm/v/stylelint-plugin-isolate-on-stack.svg)](https://www.npmjs.org/package/stylelint-plugin-isolate-on-stack)
[![Build Status](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/workflows/CI/badge.svg)](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/actions)

スタッキングコンテキスト関連の問題を検出・防止するStylelintプラグイン。z-indexの使用や積み重ねコンテキストの生成に関するベストプラクティスを強制します。

## 概要

このプラグインは、CSSでのスタッキングコンテキストと`z-index`の使用に関連する問題を検出し、より堅牢で予測可能なスタイリングを実現するためのStylelintルールを提供します。主な目的は以下の通りです：

- 冗長または無効な`isolation: isolate`の使用を検出
- 過度に高い`z-index`値を検出
- スタッキングコンテキストの生成に関するベストプラクティスを強制
- 様々なCSS宣言がスタッキングコンテキストに与える影響を理解するのを支援

## スタッキングコンテキストの検出

このプラグインは、以下のようなスタッキングコンテキストを生成するCSSプロパティの存在を自動的に検出します：

- `position: relative/absolute/fixed/sticky` + `z-index`が`auto`以外
- `opacity`が1未満
- `transform`が`none`以外
- `filter`が`none`以外
- `mix-blend-mode`が`normal`以外
- `isolation: isolate`
- `contain: layout/paint/strict/content`
- スタッキングコンテキストを生成するプロパティを指定した`will-change`

これらのプロパティが検出された場合、プラグインは自動的に冗長な`isolation: isolate`宣言を識別します。これらのプロパティはすでに独自のスタッキングコンテキストを生成するためです。

## インストール

```bash
npm install --save-dev stylelint-plugin-isolate-on-stack
```

## 使用方法

### 設定

`.stylelintrc.json`ファイル（または他のStylelint設定ファイル）に以下を追加します：

```json
{
  "plugins": ["stylelint-plugin-isolate-on-stack"],
  "rules": {
    "stylelint-plugin-isolate-on-stack/no-redundant-declaration": true,
    "stylelint-plugin-isolate-on-stack/ineffective-on-background-blend": true,
    "stylelint-plugin-isolate-on-stack/z-index-range": [
      true,
      { "maxZIndex": 100 }
    ],
    "stylelint-plugin-isolate-on-stack/prefer-over-side-effects": true,
    "stylelint-plugin-isolate-on-stack/performance-high-descendant-count": [
      true,
      { "maxDescendantCount": 100 }
    ]
  }
}
```

## ルール

### no-redundant-declaration

他のプロパティによって既にスタッキングコンテキストが生成されている場合に、冗長な`isolation: isolate`宣言を検出します。

**不適切な例：**

```css
.redundant {
  position: relative;
  z-index: 1;
  isolation: isolate; /* 冗長: position + z-index でスタッキングコンテキストが生成されている */
}
```

**適切な例：**

```css
.not-redundant {
  isolation: isolate; /* OK: 他のプロパティでスタッキングコンテキストが生成されていない */
}
```

### ineffective-on-background-blend

`background-blend-mode`と`isolation: isolate`の無効な組み合わせを検出します。`isolation: isolate`は`background-blend-mode`の動作に影響を与えません。

**不適切な例：**

```css
.invalid {
  background-blend-mode: multiply;
  isolation: isolate; /* 無効: background-blend-modeには影響しない */
}
```

**適切な例：**

```css
.valid {
  isolation: isolate;
  mix-blend-mode: multiply; /* OK: mix-blend-modeはisolationの影響を受ける */
}
```

### z-index-range

過度に高い`z-index`値を検出します。デフォルトでは100を超える値が警告されます。

**不適切な例：**

```css
.too-high {
  z-index: 9999; /* 過度に高い値 */
}
```

**適切な例：**

```css
.reasonable {
  z-index: 10; /* 適切な範囲内 */
}
```

### prefer-over-side-effects

スタッキングコンテキストの生成のみを目的として副作用のあるプロパティを使用している場合に、より明示的な`isolation: isolate`の使用を推奨します。

**不適切な例：**

```css
.hacky {
  opacity: 0.999; /* ほぼ透明でないがスタッキングコンテキストを生成する目的で使用 */
}

.hacky-transform {
  transform: translateZ(0); /* スタッキングコンテキスト生成のためのハック */
}
```

**適切な例：**

```css
.explicit {
  isolation: isolate; /* 明示的にスタッキングコンテキストを生成 */
}
```

### performance-high-descendant-count

パフォーマンスに影響を与える可能性のある多数の子孫を持つ要素に`isolation: isolate`を使用している場合に警告します。このルールはCSS前のコメントで子孫数を指定する必要があります。

**警告例：**

```css
/* @descendants: 150 */
.high-descendant-count {
  isolation: isolate; /* パフォーマンスに影響する可能性 */
}
```

## スタッキングコンテキストについて

スタッキングコンテキストは、HTML要素をZ軸（視聴者から見た奥行き）に沿って配置する三次元的なレンダリングモデルです。これは、要素が互いにどのように重なり合うかを決定します。

特定のCSS宣言によってスタッキングコンテキストが生成されると、その要素内のすべての子孫要素は、まずそのコンテキスト内で重ね合わせ順序が解決され、その後その要素全体が親コンテキスト内での順序の決定に参加します。

`isolation: isolate`は、他の視覚的な副作用なしに純粋にスタッキングコンテキストを生成するための唯一のプロパティです。

## 貢献

バグ報告や機能リクエストは[GitHub Issues](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/issues)にて受け付けています。プルリクエストも歓迎します。

## ライセンス

MIT
.element {
position: absolute;
z-index: 5;
opacity: 0.8; /_ Already creates a stacking context _/
isolation: isolate; /_ Redundant _/
}

/_ Invalid combination with background-blend-mode _/
.element {
background-blend-mode: multiply;
isolation: isolate; /_ Invalid: isolation doesn't affect background-blend-mode _/
}

/_ Ineffective on pseudo-elements _/
.element::after {
position: fixed;
z-index: 5;
isolation: isolate; /_ No effect on pseudo-elements _/
}

````

### Pseudo-Element Handling

The plugin handles pseudo-elements specially, recognizing that most pseudo-elements cannot have their own stacking contexts:

```css
/* Will report a warning to remove the redundant property */
.element::after {
  position: fixed;
  z-index: 5;
  isolation: isolate; /* Will trigger a warning */
}
````

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
