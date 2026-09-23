export const rules = {
  'no-console': 'warn',
  'no-debugger': 'warn',
  'quotes': ['warn', 'single', {avoidEscape: true, allowTemplateLiterals: true}],
  'semi': ['warn', 'always'],
  'object-curly-spacing': ['warn', 'never'],
  'comma-dangle': ['warn', 'never'],
  'eqeqeq': ['warn', 'always',  {null: 'ignore'}],
  '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_$'}],
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/explicit-function-return-type': 'warn',
  'no-unreachable': 'warn',
  'no-unreachable-loop': 'warn',
  'no-duplicate-imports': 'warn'
}
