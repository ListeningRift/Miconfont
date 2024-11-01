// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    vue: true,
  },
  {
    files: ['packages/cli/**/*.{js,ts}'],
    rules: {
      // overrides
      'no-console': 'off',
    },
  },
  {
    files: ['packages/server/**/*.{js,ts}'],
    rules: {
      // overrides
      'no-console': 'off',
    },
  },
  {
    files: ['packages/client/**/*.vue'],
    rules: {
      'vue/valid-attribute-name': 'off',
      'vue/html-self-closing': 'off',
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],

      'node/prefer-global/buffer': 'off',
    },
  },
)
