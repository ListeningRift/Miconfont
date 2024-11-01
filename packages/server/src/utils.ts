import type { Options } from '@miconfont/convert'
import { readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { basename, extname, join, resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

export async function scanSvgFilePaths(dir: string) {
  return (await readdir(resolve(dir))).map((file) => {
    if (extname(file) === '.svg') {
      return {
        name: basename(file, '.svg'),
        path: join(dir, file),
        content: readFileSync(join(dir, file), 'utf-8'),
      }
    }
    return undefined
  }).filter(item => item) as { name: string, path: string, content: string }[]
}

export async function importRootFile(fileName: string) {
  return import(pathToFileURL(resolve(process.cwd(), fileName)).href)
}

/** 导入配置项 */
export async function importConfig(): Promise<Options> {
  return importRootFile('config.json')
}
