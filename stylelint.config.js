/** @type {import('stylelint').Config} */
export default {
  plugins: ["./dist/src/index.js"],
  rules: {
    // 冗長なisolation: isolate宣言を検出
    "stylelint-plugin-isolate-on-stack/no-redundant-declaration": true,

    // 無効なbackground-blend-modeとisolation: isolateの組み合わせを検出
    "stylelint-plugin-isolate-on-stack/ineffective-on-background-blend": true,

    // 過度に高いz-index値を検出
    "stylelint-plugin-isolate-on-stack/z-index-range": [true, { maxZIndex: 100 }],

    // 副作用のあるプロパティ代わりにisolation: isolateの使用を推奨
    "stylelint-plugin-isolate-on-stack/prefer-over-side-effects": true,

    // パフォーマンスに影響を与える可能性のある多数の子孫を持つ要素でのisolation: isolateの使用を警告
    "stylelint-plugin-isolate-on-stack/performance-high-descendant-count": [true, { maxDescendantCount: 100 }],
  },
};
