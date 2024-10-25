import { readFileSync, readdirSync, writeFile } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import { Buffer } from 'node:buffer'
import { Readable } from 'node:stream'
import { SVGIcons2SVGFontStream } from 'svgicons2svgfont'
import svg2ttf from 'svg2ttf'
import ttf2woff from 'ttf2woff'
import ttf2woff2 from 'ttf2woff2'
import { optimize } from 'svgo'
import { DEFAULT_OPTIONS, type Options } from './options'

const CONTENT_PREFIX = '\\'

interface Metadata {
  unicode: string[]
  name: string
  path: string
  renamed: false
}

interface SVGMetadata {
  code: number
  path: string
  name: string
}

interface FontBuffer {
  woff: Buffer
  woff2: Buffer
  ttf: Buffer
}

function getAllSvgs(input: string) {
  return readdirSync(resolve(input)).map((file) => {
    if (extname(file) === '.svg')
      return join(input, file)
    else return undefined
  }).filter(file => file) as string[]
}

function getSvgContext(options: Options) {
  const svgs = getAllSvgs(options.input!)
  const svgMetadata: SVGMetadata[] = []
  svgs.forEach((svg, index) => {
    const code = options.codeStarter! + index
    svgMetadata.push({
      code,
      path: resolve(svg),
      name: basename(svg, extname(svg)),
    })
  })
  return svgMetadata
}

function optimizeSvgString(svg: string, clearColor: boolean) {
  const { data } = optimize(svg, {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
          },
        },
      },
      ...(
        clearColor
          ? [{
              name: 'clearSvgColor',
              fn: () => {
                return {
                  element: {
                    enter: (node: any) => {
                      const colorRegex = /#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\d+,\s*\d+,\s*\d+\)|rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)|hsl\(\d+,\s*\d+%,\s*\d+%\)|hsla\(\d+,\s*\d+%,\s*\d+%,\s*[\d.]+\)/g
                      Object.entries(node.attributes)
                        .filter(([, value]) => colorRegex.test(value as string))
                        .forEach(([key]) => {
                          node.attributes[key] = 'currentColor'
                        })
                    },
                  },
                }
              },
            }]
          : []),
    ],
  })
  return data
}

async function generateSvgFontBuffer(svgMetadata: SVGMetadata[], options: Options) {
  const fontStream = new SVGIcons2SVGFontStream({
    fontName: options.name, // 字体名称
    log() { },
    ...options,
  } as ConstructorParameters<typeof SVGIcons2SVGFontStream>[0])
  return new Promise<string>((resolve, reject) => {
    let res = ''
    fontStream
      .on('data', (chunk: any) => {
        res += chunk
      })
      .on('end', () => {
        resolve(res)
      })
      .on('error', reject)
    svgMetadata.forEach((item) => {
      const glyph = new Readable()
      const content = readFileSync(item.path, 'utf-8')
      glyph.push(optimizeSvgString(content, options.clearColor!))
      glyph.push(null)

      ;(glyph as Readable & { metadata?: Metadata }).metadata = {
        unicode: [String.fromCharCode(item.code)],
        name: item.name,
        path: item.path,
        renamed: false,
      }
      fontStream.write(glyph)
    })
    fontStream.end()
  })
}

async function getFontBuffer(svgMetadata: SVGMetadata[], options: Options) {
  const svgBuffer = await generateSvgFontBuffer(svgMetadata, options)
  const ttfUint8Array = svg2ttf(svgBuffer).buffer
  const ttfBuffer = Buffer.from(ttfUint8Array)

  return {
    ttf: ttfBuffer,
    woff: Buffer.from(ttf2woff(ttfUint8Array)),
    woff2: Buffer.from(ttf2woff2(ttfBuffer)),
  }
}

function getCssString(svgMetadata: SVGMetadata[], options: Options) {
  let css = `@font-face {
  font-family: "${options.name}";
  src: url('${options.name}.woff2') format('woff2'),
       url('${options.name}.woff') format('woff'),
       url('${options.name}.ttf') format('truetype');
}

.${options.name} {
  font-family: "${options.name}" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

`
  css = css + svgMetadata.map((item) => {
    return `.${options.iconPrefix}-${item.name}::before { content: "${CONTENT_PREFIX + item.code.toString(16).toUpperCase()}"; }`
  }).join('\n')
  css += '\n'
  return css
}

async function writeFontFile(fontBuffer: FontBuffer, options: Options) {
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

async function writeCSSFile(cssString: string, options: Options) {
  writeFile(resolve(`${options.output}/${options.name}.css`), cssString, (err) => {
    if (err)
      return console.error(err)

    console.log('css has created successfully')
  })
}

export async function generateFile(userOptions: Options = {}) {
  const options = Object.assign({}, DEFAULT_OPTIONS, userOptions)
  const svgMetadata = getSvgContext(options)
  const fontBuffer: FontBuffer = await getFontBuffer(svgMetadata, options)
  writeFontFile(fontBuffer, options)
  const cssString = getCssString(svgMetadata, options)
  writeCSSFile(cssString, options)
}
generateFile({
  input: 'test/svgs',
  output: './',
})
