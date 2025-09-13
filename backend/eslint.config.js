import { defineConfig, globalIgnores } from "eslint/config";

import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import pkg from '@eslint/js';
const { configs } = pkg;

import { FlatCompat } from "@eslint/eslintrc";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: configs.recommended,
    allConfig: configs.all
});

export default defineConfig([{
    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2021,
        sourceType: "module",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    plugins: {
        prettier,
        "@typescript-eslint": typescriptEslint,
    },

    extends: compat.extends("plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"),

    rules: {
        "@typescript-eslint/array-type": ["error", {
            default: "array-simple",
        }],

        "@typescript-eslint/no-explicit-any": ["off"],

        "@typescript-eslint/no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
        }],

        semi: ["error", "always"],
    },
}, globalIgnores(["**/.eslintrc.js"]), globalIgnores([
    "**/node_modules",
    "**/dist",
    "**/.env",
    "**/yarn-error.log",
    "**/.vscode",
    "**/coverage",
])]);
