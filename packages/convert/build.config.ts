import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './index.ts',
  ],
  outDir: './dist',
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
