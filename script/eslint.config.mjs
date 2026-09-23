import tseslint from 'typescript-eslint';
import { rules } from '../eslint.mjs';

export default tseslint.config(
  {
    files: ['**/*.ts'],

    languageOptions: {

      parser: tseslint.parser,
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },

    rules
  },
);
