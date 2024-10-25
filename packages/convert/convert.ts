import type { Options } from './options'
import { Buffer } from 'node:buffer'
import { Readable } from 'node:stream'
import svg2ttf from 'svg2ttf'
import { SVGIcons2SVGFontStream } from 'svgicons2svgfont'
import { optimize } from 'svgo'
import ttf2woff from 'ttf2woff'
import ttf2woff2 from 'ttf2woff2'
import { DEFAULT_OPTIONS } from './options'

const CONTENT_PREFIX = '\\'

interface Metadata {
  unicode: string[]
  name: string
  renamed: false
}

export interface SVGMetadata {
  code: number
  name: string
  content: string
}

export interface FontBuffer {
  woff: Buffer
  woff2: Buffer
  ttf: Buffer
}

export function getSvgContext(svgs: Record<string, string>, options: Options) {
  const svgMetadata: SVGMetadata[] = []
  Object.keys(svgs).forEach((name, index) => {
    const code = options.codeStarter! + index
    svgMetadata.push({
      code,
      name,
      content: svgs[name],
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
      glyph.push(optimizeSvgString(item.content, options.clearColor!))
      glyph.push(null)

      ;(glyph as Readable & { metadata?: Metadata }).metadata = {
        unicode: [String.fromCharCode(item.code)],
        name: item.name,
        renamed: false,
      }
      fontStream.write(glyph)
    })
    fontStream.end()
  })
}

export async function getFontBuffer(svgMetadata: SVGMetadata[], options: Options) {
  const svgBuffer = await generateSvgFontBuffer(svgMetadata, options)
  const ttfUint8Array = svg2ttf(svgBuffer).buffer
  const ttfBuffer = Buffer.from(ttfUint8Array)

  return {
    ttf: ttfBuffer,
    woff: Buffer.from(ttf2woff(ttfUint8Array)),
    woff2: Buffer.from(ttf2woff2(ttfBuffer)),
  }
}

export function getCssString(svgMetadata: SVGMetadata[], options: Options) {
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

export async function convert(svgs: Record<string, string>, userOptions: Options = {}) {
  const options = Object.assign({}, DEFAULT_OPTIONS, userOptions)
  const svgMetadatas = getSvgContext(svgs, options)
  const fontBuffer: FontBuffer = await getFontBuffer(svgMetadatas, options)
  const cssString = getCssString(svgMetadatas, options)
  return {
    fontBuffer,
    cssString,
  }
}
