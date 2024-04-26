import { readFileSync, readdirSync, writeFile, writeFileSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import type { Buffer } from 'node:buffer'
import FontCarrier from 'font-carrier'

const SVG_PREFIX = '&#x'
const SVG_SUFFIX = ';'
const CONTENT_PREFIX = '\\'

const CODE_STARTER = 'e600'

// interface FontBuffer {
//   ttf: Buffer
//   eot: Buffer
//   woff: Buffer
//   woff2: Buffer
//   svg: Buffer
// }

function add16(code: string, index: number) {
  const newCode = Number.parseInt(code, 16) + index
  return newCode.toString(16)
}

function getAllSvgs() {
  return readdirSync(resolve('test/svgs')).map((file) => {
    if (extname(file) === '.svg')
      return join('test/svgs', file)
    else return undefined
  }).filter(file => file) as string[]
}

function getSvgContext() {
  const font = FontCarrier.create()
  const svgs = getAllSvgs()
  const svgMap: Record<string, string> = {}
  svgs.forEach((svg, index) => {
    const icon = readFileSync(resolve(svg)).toString()
    const code = add16(CODE_STARTER, index)
    svgMap[basename(svg, extname(svg))] = code
    font.setSvg(SVG_PREFIX + code + SVG_SUFFIX, icon)
  })
  return {
    font,
    svgMap,
  }
}

function writeFontFile(font: FontCarrier.Font) {
  const res = font.output({
    types: ['ttf'],
  })

  Object.keys(res).forEach((type: any) => {
    console.log('index > Line 57 > [ res[type] ] =>', res[type])
    writeFileSync(`test/iconfont.${type}`, res[type])
  })
}

function writeCSSFile(svgMap: Record<string, string>) {
  let css = `@font-face {
  font-family: "iconfont";
  src: url('iconfont.woff2') format('woff2'),
       url('iconfont.woff') format('woff'),
       url('iconfont.ttf') format('truetype');
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

`
  css = css + Object.keys(svgMap).map((key) => {
    return `.icon-${key}::before { content: "${CONTENT_PREFIX + svgMap[key]}"; }`
  }).join('\n')
  css += '\n'
  writeFile(resolve('test/iconfont.css'), css, (err) => {
    if (err)
      return console.error(err)

    console.log('css has created successfully')
  })
}

function main() {
  const { font, svgMap } = getSvgContext()
  writeFontFile(font)
  writeCSSFile(svgMap)
}

main()
