import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import pluginImport from "eslint-plugin-import";

export default tseslint.config(
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {import:pluginImport},
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "prefer-const": "error",

      "import/extensions": [
        "error",
        "always",
        { "ts": "never" }
    ]
    },
  },
);
