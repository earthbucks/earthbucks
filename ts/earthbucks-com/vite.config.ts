import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import wasm from "vite-plugin-wasm";

installGlobals();

export default defineConfig({
  plugins: [
    remix(),
    tsconfigPaths(),
    wasm(),
  ],
});
