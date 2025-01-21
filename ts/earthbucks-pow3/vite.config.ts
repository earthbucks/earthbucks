import { defineConfig } from "vitest/config";
import { stringPlugin } from "vite-string-plugin";

export default defineConfig({
  plugins: [
    stringPlugin({
      match: /\.(wgsl)$/i,
    }),
  ],
  test: {
    name: "browser",
    environment: "happy-dom", // or 'jsdom'
    browser: {
      enabled: true,
      name: "chromium",
      provider: "playwright",
    },
    exclude: ["test/**/*.node.ts"],
    include: ["test/**/*.browser.ts"],
  },
});
