import type { FontOptions as ConvertFontOptions, FontBuffer } from '@miconfont/convert'
import { readdirSync, readFileSync, writeFile } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'

export type FontOptions = ConvertFontOptions & {
  output: string
  input: string
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
