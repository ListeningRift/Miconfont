import type { Options } from './utils'
import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { convert } from '@miconfont/convert'
import { Command } from 'commander'
import pkg from './package.json'
import { getAllSvgs, writeCSSFile, writeFontFile } from './utils'

function omit<T extends object, K extends (keyof T)[]>(obj: T, keys: K): Omit<T, K[number]> {
  return Object.keys(obj).reduce((acc, key) => {
    if (!keys.includes(key as keyof T)) {
      acc[key as keyof Omit<T, K[number]>] = obj[key as keyof Omit<T, K[number]>]
    }
    return acc
  }, {} as Omit<T, K[number]>)
}

const program = new Command()
program.name(pkg.name).description(pkg.description).version(pkg.version)

program
  .description('Convert all SVG icons in a folder to TTF and WOFF/WOFF2 formats.')
  .usage('--output <path> --input <path> --name <name> --config <path>')
  .option('-o, --output <path>', 'The output folder where the converted fonts will be saved. Default is "./fonts".')
  .option('-i, --input <path>', 'The input folder where the SVG icons are located. Default is "./icons".')
  .option('-n, --name <name>', 'The name of the font family. Default is "iconfont".')
  .option('-c, --config <path>', 'The path to the configuration file. Default is "./config.json".')
  .action(async () => {
    const defaultOptions = {
      output: './fonts',
      input: './icons',
      name: 'iconfont',
      formats: ['woff', 'woff2', 'ttf'],
      config: './config.json',
    }
    const userOptions = Object.assign({}, defaultOptions, program.opts())
    let configOptions: any = {}
    try {
      const statInfo = await stat(resolve(process.cwd(), userOptions.config))
      if (statInfo?.isFile()) {
        configOptions = Object.assign({}, await import(resolve(process.cwd(), userOptions.config)), omit(userOptions, ['config']))
      }
      else {
        configOptions = Object.assign({}, omit(userOptions, ['config']))
      }
    }
    catch {
      configOptions = Object.assign({}, omit(userOptions, ['config']))
    }
    const options: Options = {
      ...configOptions,
      input: resolve(process.cwd(), configOptions.input),
      output: resolve(process.cwd(), configOptions.output),
    }
    const svgs = getAllSvgs(options.input)
    const { cssString, fontBuffer } = await convert(svgs, options)
    writeCSSFile(cssString, options)
    writeFontFile(fontBuffer, options)
  })

program.parse()
