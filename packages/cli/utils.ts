import type { Options as ConvertOptions, FontBuffer } from '@miconfont/convert'
import { readdirSync, readFileSync, writeFile } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'

export type Options = ConvertOptions & {
  output: string
  input: string
}

export function getAllSvgs(input: string) {
  const res: Record<string, string> = {}
  readdirSync(resolve(input)).forEach((file) => {
    if (extname(file) === '.svg')
      res[basename(file, '.svg')] = readFileSync(join(input, file), 'utf-8')
  })
  return res
}

export async function writeFontFile(fontBuffer: FontBuffer, options: Options) {
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

export async function writeCSSFile(cssString: string, options: Options) {
  writeFile(resolve(`${options.output}/${options.name}.css`), cssString, (err) => {
    if (err)
      return console.error(err)

    console.log('css has created successfully')
  })
}
