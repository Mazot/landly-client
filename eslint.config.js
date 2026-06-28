import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import i18next from 'eslint-plugin-i18next'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'i18next': i18next,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // Forbid raw string literals in JSX — all user-visible text must go through t().
      // Set to 'warn' so existing violations surface without breaking the build.
      'i18next/no-literal-string': ['warn', {
        markupOnly: true,
        // Non-translatable JSX attributes — safe to have raw strings.
        ignoreAttribute: [
          'className', 'style', 'data-testid', 'data-cy',
          'role', 'type', 'tabIndex', 'htmlFor', 'id', 'key',
        ],
      }],
    },
  },
)
