/** @type {import('stylelint').Config} */
export default {
  plugins: ["./index.js"],
  rules: {
    "isolate-on-stack/isolation-for-position-zindex": [
      true,
      {
        ignoreWhenStackingContextExists: true,
        ignoreClasses: ["no-isolation"]
      }
    ]
  }
};
