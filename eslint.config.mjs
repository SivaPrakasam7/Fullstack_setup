import prettier from 'eslint-plugin-prettier';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import parser from 'vue-eslint-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ['**/dist', '**/out'],
    },
    ...compat.extends(
        'plugin:@typescript-eslint/recommended',
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'prettier'
    ),
    {
        plugins: {
            prettier,
            '@typescript-eslint': typescriptEslint,
        },

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
                ...globals.browser,
                ...globals.es2024,
                ILargeRecord: true,
                ITimer: true,
                Cypress: true,
                cy: true,
            },

            parser: parser,
            ecmaVersion: 2024,
            sourceType: 'module',

            parserOptions: {
                parser: '@typescript-eslint/parser',
            },
        },

        rules: {
            'no-unused-vars': 'off',
            'vue/html-indent': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },
];
