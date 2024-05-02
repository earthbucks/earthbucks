import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await-worker";

installGlobals();

export default defineConfig({
  plugins: [remix(), tsconfigPaths(), wasm(), topLevelAwait()],
  worker: {
    plugins: () => [wasm(), topLevelAwait()],
  },
  build: {
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  }
});
