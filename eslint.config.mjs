import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['coverage/**'],
  },
  {
    files: ['**/*.config.js', '**/*.config.ts', '**/*.config.mjs', '**/*.config.cjs', 'jest.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default config;
