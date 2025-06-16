# stylelint-plugin-isolate-on-stack

[![NPM version](https://img.shields.io/npm/v/stylelint-plugin-isolate-on-stack.svg)](https://www.npmjs.org/package/stylelint-plugin-isolate-on-stack)
[![Build Status](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/workflows/CI/badge.svg)](https://github.com/hiro0218/stylelint-plugin-isolate-on-stack/actions)

Stylelintプラグインで、`position: absolute`と`z-index`を使用する際に`isolation: isolate`の指定を強制するルールを提供する。このプラグインは自動修正機能（autofix）にも対応している。

[English README](./README.md)

## 背景

スタッキングコンテキストの問題を防ぐために、`position: absolute`と`z-index`を併用する場合は、`isolation: isolate`を指定することが推奨される。このプラグインはその設定漏れを検出し、必要に応じて自動修正を行う。

## インストール

```bash
npm install --save-dev stylelint-plugin-isolate-on-stack
```

## 使い方

### 設定

`.stylelintrc.json`ファイル（または他のStylelint設定ファイル）に以下のように追加する：

```json
{
  "plugins": ["stylelint-plugin-isolate-on-stack"],
  "rules": {
    "isolate-on-stack/isolation-for-absolute-zindex": true
  }
}
```

### ルール詳細

このプラグインは以下の場合にエラーを報告する：

- `position: absolute`と`z-index`が存在するが、`isolation: isolate`が指定されていない場合

#### 自動修正

このルールは自動修正機能をサポートしている。`stylelint --fix`コマンドを実行すると、`z-index`の直後に`isolation: isolate`を自動的に追加する。

#### ✅ 正しい例

```css
.element {
  position: absolute;
  z-index: 10;
  isolation: isolate;
}
```

#### ❌ 誤った例

```css
.element {
  position: absolute;
  z-index: 10;
}
```

## ライセンス

MIT
