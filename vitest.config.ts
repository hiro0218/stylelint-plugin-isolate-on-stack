import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.js"],
    coverage: {
      enabled: true,
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      thresholds: {
        global: {
          branches: 68,
          functions: 74,
          lines: 73,
          statements: 72,
        },
      },
    },
  },
});
