// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: [
      // eslint ignore globs here
    ],
  },
  {
    files: ['packages/cli/**/*.{js,ts}'],
    rules: {
      // overrides
      'no-console': 'off',
    },
  },
)
