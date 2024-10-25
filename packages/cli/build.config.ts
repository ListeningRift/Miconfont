import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './index.ts',
  ],
  outDir: './dist',
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
