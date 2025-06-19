/**
 * テスト用のStylelint設定
 */
const path = require("path");

module.exports = {
  plugins: [path.join(__dirname, "dist", "src", "index.js")], // ビルド済みのプラグインを使用
  rules: {
    // テスト時にはルールは個別に設定される
  },
};
