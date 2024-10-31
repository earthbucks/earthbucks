import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  server: {
    hmr: {
      port: process.env.PORT ? Number(process.env.PORT) + 1 : undefined,
    },
  },
  build: {
    lib: {
      entry: "src/index.tsx", // Adjust to your component's path
      name: "Compubutton",
      fileName: (format) => "index.js",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        format: "es",
      },
    },
  },
});
