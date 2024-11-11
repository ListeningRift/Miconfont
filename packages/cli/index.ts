import type { ComponentOptions, FontOptions } from './utils'
import { convertComponents, convertFont } from '@miconfont/convert'
import { Command } from 'commander'
import pkg from './package.json'
import { getAllSvgs, getOptions, writeComponentFile, writeCSSFile, writeFontFile } from './utils'

const program = new Command()
program.name(pkg.name).description(pkg.description).version(pkg.version)

program
  .command('font')
  .alias('f')
  .description('Convert all SVG icons in a folder to TTF and WOFF/WOFF2 formats.')
  .usage('--output <path> --input <path> --name <name> --config <path>')
  .option('-o, --output <path>', 'The output folder where the converted fonts will be saved. Default is "./fonts".')
  .option('-i, --input <path>', 'The input folder where the SVG icons are located. Default is "./icons".')
  .option('-n, --name <name>', 'The name of the font family. Default is "iconfont".')
  .option('-c, --config <path>', 'The path to the configuration file. Default is "./config.json".')
  .action(async (programOptions) => {
    const defaultOptions = {
      output: './fonts',
      input: './icons',
      name: 'iconfont',
      formats: ['woff', 'woff2', 'ttf'],
      config: './config.json',
    }
    const options = await getOptions(defaultOptions as FontOptions & { config: string }, programOptions)
    const svgs = getAllSvgs(options.input)
    const { cssString, fontBuffer } = await convertFont(svgs, options)
    await Promise.all([writeCSSFile(cssString, options), writeFontFile(fontBuffer, options)])
  })

program
  .command('component')
  .alias('c')
  .description('Generate components for all SVG icons in a folder.')
  .usage('--output <path> --input <path> --config <path>')
  .option('-o, --output <path>', 'The output folder where the components will be saved. Default is "./components".')
  .option('-i, --input <path>', 'The input folder where the SVG icons are located. Default is "./icons".')
  .option('-f, --framework <framework>', 'The framework to generate components for. Default is "vue3".')
  .option('-e, --extname <extname>', 'The file extension for the generated components. Default is "vue".')
  .option('-c, --config <path>', 'The path to the configuration file. Default is "./config.json".')
  .action(async (programOptions) => {
    const defaultOptions = {
      output: './components',
      input: './icons',
      config: './config.json',
      framework: 'vue3',
    }
    const options = await getOptions(defaultOptions as ComponentOptions & { config: string }, programOptions)
    const svgs = getAllSvgs(options.input)
    const components = await convertComponents(svgs, options)
    await writeComponentFile(components, options)
  })

program.parse()
