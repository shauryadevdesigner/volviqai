import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import remotion from "@remotion/eslint-plugin";
import tseslint from "typescript-eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

// Build Next.js recommended rules and an "off" map for overrides
const nextRecommended = nextPlugin.configs.recommended ?? { rules: {} };
const nextRecommendedRules = nextRecommended.rules ?? {};
const offNextRules = Object.fromEntries(
  Object.keys(nextRecommendedRules).map((k) => [k, "off"]),
);

const dummyReactPlugin = {
  rules: {
    "no-unknown-property": {
      create() {
        return {};
      },
    },
  },
};

export default [
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "next.config.js",
      "deploy.mjs",
    ],
  },
  // Base JS recommended
  js.configs.recommended,
  // TypeScript recommended (non type-checked for speed/simplicity)
  ...tseslint.configs.recommended,
  // Global language options and environments
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Next.js recommended rules applied to app code
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
      "react": dummyReactPlugin,
    },
    rules: {
      ...nextRecommendedRules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Remotion rules applied only to remotion files
  {
    files: ["src/remotion/**"],
    ...remotion.flatPlugin,
    rules: {
      ...remotion.flatPlugin.rules,
    },
  },
  // Disable all Next.js rules within remotion files
  {
    files: ["src/remotion/**"],
    rules: {
      ...offNextRules,
    },
  },
];
