/** @type {import('stylelint').Config} */
export default {
  plugins: ["./index.js"],
  rules: {
    "isolate-on-stack/no-redundant-declaration": [
      true,
      {
        ignoreWhenStackingContextExists: true,
        ignoreClasses: ["no-isolation"]
      }
    ]
  }
};
