# stylelint-plugin-isolate-on-stack

[![NPM version](https://img.shields.io/npm/v/stylelint-plugin-isolate-on-stack.svg)](https://www.npmjs.org/package/stylelint-plugin-isolate-on-stack)
[![Build Status](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/workflows/CI/badge.svg)](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/actions)

スタッキングコンテキスト関連の問題を検出・防止するStylelintプラグインです。このプラグインは、`z-index`の使用や積み重ねコンテキストの生成に関するベストプラクティスを強制し、CSSの品質向上を目指します。

## 概要

このプラグインは、以下の目的で設計されています：

- 冗長または無効な`isolation: isolate`の使用を検出
- 過度に高い`z-index`値を警告
- スタッキングコンテキスト生成に関するベストプラクティスを強制
- CSS宣言がスタッキングコンテキストに与える影響を理解するのを支援

## スタッキングコンテキストの検出

以下のCSSプロパティがスタッキングコンテキストを生成する条件を自動的に検出します：

- `position: relative/absolute/fixed/sticky` + `z-index`が`auto`以外
- `opacity`が1未満
- `transform`が`none`以外
- `filter`が`none`以外
- `backdrop-filter`が`none`以外
- `mix-blend-mode`が`normal`以外
- `isolation: isolate`
- `contain: layout/paint/strict/content`
- `perspective`が`none`以外
- `clip-path`が`none`以外
- `mask` / `mask-image` / `mask-border`が`none`以外
- スタッキングコンテキストを生成するプロパティを指定した`will-change`

これらのプロパティが検出された場合、プラグインは冗長な`isolation: isolate`宣言を識別し、適切な修正を促します。

## インストール

以下のコマンドでインストールできます：

```bash
npm install --save-dev stylelint-plugin-isolate-on-stack
```

## 使用方法

### 設定

`.stylelintrc.json`ファイルに以下を追加してください：

```json
{
  "plugins": ["stylelint-plugin-isolate-on-stack"],
  "rules": {
    // スタッキングコンテキスト関連のルールを有効化
    "stylelint-plugin-isolate-on-stack/no-redundant-declaration": true,
    // 無効な背景ブレンドモードとの組み合わせを検出
    "stylelint-plugin-isolate-on-stack/ineffective-on-background-blend": true,
    // 過度に高いz-index値を警告
    "stylelint-plugin-isolate-on-stack/z-index-range": [
      true,
      { "maxZIndex": 100 }
    ],
    // 副作用のあるプロパティの使用を避け、明示的なisolationを推奨
    "stylelint-plugin-isolate-on-stack/prefer-over-side-effects": true,
    // 高い子孫要素数を持つスタッキングコンテキストを警告
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

スタッキングコンテキストを生成する要素が多数の子孫要素を持つ場合に警告します。多数の子孫要素を持つスタッキングコンテキストはブラウザのレンダリングパフォーマンスに影響を与える可能性があります。

**不適切な例：**

```css
.complex-stacking-context {
  position: relative;
  z-index: 1;
  /* この要素が100を超える子孫要素を持つ場合に警告 */
}
```

**適切な例：**

```css
.optimized-structure {
  /* 子孫要素数が制限内に収まるよう、DOM構造を最適化 */
  isolation: isolate;
}
```
