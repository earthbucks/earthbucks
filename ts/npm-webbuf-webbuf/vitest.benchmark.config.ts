// vitest.benchmark.config.ts (benchmark tests config)
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["benchmark/**/*.benchmark.ts"], // Only run benchmark files
    exclude: ["test/**/*.test.ts"], // Exclude normal tests
  },
});
