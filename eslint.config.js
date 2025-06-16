import jestPlugin from "eslint-plugin-jest";

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
        // Jest globals
        describe: "readonly",
        expect: "readonly",
        it: "readonly",
        test: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
    files: ["**/*.js"],
    plugins: {
      jest: jestPlugin,
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // ESLint core rules
      "no-console": "warn",
      "no-unused-vars": "warn",

      // Jest plugin rules
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
    },
  },
  {
    files: [
      "**/test/**/*.js",
      "**/*.test.js",
      "**/eslint.config.js",
      "**/jest.config.js",
      "**/prettier.config.js",
    ],
    rules: {},
  },
];
