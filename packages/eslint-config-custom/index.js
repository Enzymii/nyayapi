/* eslint-env node */
const indentRule = {
  SwitchCase: 1,
  ignoredNodes: [
    'PropertyDefinition',
    'TSUnionType',
    'TSTypeParameterInstantiation',
    'TSIntersectionType',
  ],
};

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next',
    'turbo',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2, indentRule],
    '@typescript-eslint/indent': ['error', 2, indentRule],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
  },
};
