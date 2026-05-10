import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default [
  {
    ignores: ["node_modules", "dist", "build", ".turbo", "coverage"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
    },
    settings: {
      react: { version: "19.0" },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Architecture Invariant #1 — `@rye/rewards-ui` must not depend on
      // the `checkout-intents` API client. Components are presentation only;
      // every API interaction goes through partner-supplied callbacks.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "checkout-intents",
              message:
                "@rye/rewards-ui must not import the checkout-intents API client. Components receive data via props and emit callbacks; the partner's backend is the only thing that talks to Rye's API. (See Architecture Invariant #1 in the design doc.)",
            },
          ],
          patterns: [
            {
              group: ["checkout-intents/*"],
              message:
                "@rye/rewards-ui must not import the checkout-intents API client. (See Architecture Invariant #1.)",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];
