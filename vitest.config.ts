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
          branches: 85,
          functions: 90,
          lines: 85,
          statements: 85,
        },
      },
    },
  },
});
