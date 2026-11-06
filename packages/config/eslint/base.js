import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Configuración base de ESLint para los paquetes TypeScript de Node (API y dominio).
 * Usa linting con información de tipos (projectService) y deja el formato a Prettier.
 *
 * @param {{ tsconfigRootDir: string, ignores?: string[] }} options
 */
export function createConfig({ tsconfigRootDir, ignores = [] }) {
  return defineConfig(
    { ignores: ['dist/**', 'coverage/**', ...ignores] },
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        globals: globals.node,
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },
    { files: ['**/*.js', '**/*.mjs'], extends: [tseslint.configs.disableTypeChecked] },
    prettier,
  );
}
