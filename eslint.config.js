export default [
  {
    ignores: ["coverage/**", "node_modules/**"],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Node.js globals
        process: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "writable",
      },
    },
    files: ["**/*.js"],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // ESLint core rules
      "no-console": "warn",
      "no-unused-vars": "warn",
    },
  },
];
