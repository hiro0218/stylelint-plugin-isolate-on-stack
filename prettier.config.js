export default {
  useTabs: false,
  tabWidth: 2,
  printWidth: 120,
  arrowParens: "always",
  overrides: [
    {
      files: ["*.json"],
      options: {
        tabWidth: 2,
        useTabs: false,
      },
    },
  ],
};
