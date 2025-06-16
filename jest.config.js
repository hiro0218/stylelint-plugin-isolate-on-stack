export default {
    testEnvironment: "node",
    testMatch: ["**/*.test.js"],
    collectCoverage: true,
    collectCoverageFrom: ["index.js"],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    transform: {},
};
