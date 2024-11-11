import type { ComponentOptions as ConvertComponentOptions, FontOptions as ConvertFontOptions, FontBuffer, SvgComponent } from '@miconfont/convert'
import { readdirSync, readFileSync, writeFile } from 'node:fs'
import { stat } from 'node:fs/promises'
import { basename, extname, join, resolve } from 'node:path'
import process from 'node:process'
import { mkdirp } from 'mkdirp'

export function omit<T extends object, K extends (keyof T)[]>(obj: T, keys: K): Omit<T, K[number]> {
  return Object.keys(obj).reduce((acc, key) => {
    if (!keys.includes(key as keyof T)) {
      acc[key as keyof Omit<T, K[number]>] = obj[key as keyof Omit<T, K[number]>]
    }
    return acc
  }, {} as Omit<T, K[number]>)
}

export async function getOptions<T extends { config: string }>(defaultOptions: Partial<T>, options: Partial<T>) {
  let configOptions: any = {}
  try {
    const statInfo = await stat(resolve(process.cwd(), options.config || defaultOptions.config!))
    if (statInfo?.isFile()) {
      configOptions = Object.assign({}, (await import(`file://${resolve(process.cwd(), options.config!)}`)).default, omit(options, ['config']))
    }
    else {
      configOptions = Object.assign({}, omit(options, ['config']))
    }
  }
  catch {
    configOptions = Object.assign({}, defaultOptions, omit(options, ['config']))
  }
  return {
    ...configOptions,
    input: resolve(process.cwd(), configOptions.input),
    output: resolve(process.cwd(), configOptions.output),
  } as T
}

export type FontOptions = ConvertFontOptions & {
  output: string
  input: string
}

export type ComponentOptions = ConvertComponentOptions & {
  output: string
  input: string
  extname: string
}

export function getAllSvgs(input: string) {
  return readdirSync(resolve(input)).map((file) => {
    if (extname(file) === '.svg') {
      return {
        name: basename(file, '.svg'),
        content: readFileSync(join(input, file), 'utf-8'),
      }
    }
    return undefined
  }).filter(item => item) as { name: string, content: string }[]
}

export async function writeFontFile(fontBuffer: FontBuffer, options: FontOptions) {
  try {
    const statInfo = await stat(options.output)
    if (!statInfo?.isDirectory()) {
      await mkdirp(options.output)
    }
  }
  catch {
    await mkdirp(options.output)
  }
  if (options.formats?.includes('ttf')) {
    writeFile(`${options.output}/${options.name}.ttf`, fontBuffer.ttf, (err) => {
      if (err)
        return console.error(err)

      console.log('ttf has created successfully')
    })
  }
  if (options.formats?.includes('woff')) {
    writeFile(`${options.output}/${options.name}.woff`, fontBuffer.woff, (err) => {
      if (err)
        return console.error(err)

      console.log('woff has created successfully')
    })
  }
  if (options.formats?.includes('woff2')) {
    writeFile(`${options.output}/${options.name}.woff2`, fontBuffer.woff2, (err) => {
      if (err)
        return console.error(err)

      console.log('woff2 has created successfully')
    })
  }
}

export async function writeCSSFile(cssString: string, options: FontOptions) {
  writeFile(resolve(`${options.output}/${options.name}.css`), cssString, (err) => {
    if (err)
      return console.error(err)

    console.log('css has created successfully')
  })
}

function getExtname(framework: 'react' | 'vue2' | 'vue3') {
  if (framework === 'react') {
    return 'tsx'
  }
  else {
    return 'vue'
  }
}

export async function writeComponentFile(svgComponents: SvgComponent[], options: ComponentOptions) {
  try {
    const statInfo = await stat(options.output)
    if (!statInfo?.isDirectory()) {
      await mkdirp(options.output)
    }
  }
  catch {
    await mkdirp(options.output)
  }
  const ext = options.extname || getExtname(options.framework!)
  const tasks = svgComponents.map(async (svgComponent) => {
    return writeFile(resolve(`${options.output}/${svgComponent.name}.${ext}`), svgComponent.componentContent, (err) => {
      if (err)
        return console.error(err)

      console.log(`${svgComponent.name}.${ext} has created successfully`)
    })
  })
  await Promise.all(tasks)
}
