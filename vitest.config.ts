import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Tests hit the live WebAPI, and the route tests fetch in beforeAll.
    testTimeout: 20000,
    hookTimeout: 20000,
    slowTestThreshold: 1000,
    include: ["test/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts"],
    },
  },
});
