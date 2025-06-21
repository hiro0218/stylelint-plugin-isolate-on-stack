/** @type {import('stylelint').Config} */
export default {
  plugins: ["./dist/index.js"],
  rules: {
    // 冗長なisolation: isolate宣言を検出
    "stylelint-plugin-isolate-on-stack/no-redundant-declaration": true,

    // 無効なbackground-blend-modeとisolation: isolateの組み合わせを検出
    "stylelint-plugin-isolate-on-stack/ineffective-on-background-blend": true,
  },
};
