import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import pluginImport from "eslint-plugin-import";

export default tseslint.config(
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { import: pluginImport },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "prefer-const": "error",

      "import/extensions": ["error", "always", { ts: "never" }],
      // Additional strict rules
      eqeqeq: ["error", "always"], // Enforce the use of === and !==
      curly: ["error", "all"], // Require curly braces for all control statements
      "no-var": "error", // Require let or const instead of var
      //"@typescript-eslint/strict-boolean-expressions": "error", // Disallow loosely typed Boolean expressions
      "@typescript-eslint/type-annotation-spacing": "error", // Require consistent spacing around type annotations
      "@typescript-eslint/no-explicit-any": "error", // Disallow the use of the `any` type
      //  "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }], // Require explicit return types on functions and class methods
      "@typescript-eslint/no-non-null-assertion": "error", // Disallow non-null assertions using the `!` postfix operator
      "no-unused-expressions": "error", // Disallow unused expressions
      "no-constant-condition": ["error", { checkLoops: false }], // Disallow constant conditions in statements
      //"no-shadow": "error", // Disallow variable declarations from shadowing variables declared in the outer scope
      //"@typescript-eslint/no-shadow": ["error"], // TypeScript specific rule to disallow shadowing
      //"complexity": ["error", { "max": 20 }], // Limit cyclomatic complexity
      "max-depth": ["error", 5], // Limit maximum depth that blocks can be nested
      "max-lines": [
        "error",
        { max: 10000, skipBlankLines: true, skipComments: true },
      ], // Limit the maximum number of lines per file
      "max-params": ["error", { max: 6 }], // Limit the number of parameters that can be used in function definitions
      "max-nested-callbacks": ["error", 5], // Limit the depth of nesting callbacks
      //"max-statements": ["error", 10, { "ignoreTopLevelFunctions": true }], // Limit the number of statements allowed in function blocks
    },
  },
);
