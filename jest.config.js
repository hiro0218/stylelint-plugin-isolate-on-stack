export default {
  testEnvironment: "node",
  testMatch: ["**/*.test.js"],
  collectCoverage: true,
  collectCoverageFrom: ["index.js"],
  coverageThreshold: {
    global: {
      branches: 68,
      functions: 74,
      lines: 73,
      statements: 72,
    },
  },
  transform: {},
};
