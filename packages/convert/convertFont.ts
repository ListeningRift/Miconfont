import type { FontOptions } from './options'
import type { FontBuffer, Metadata, SVGMetadata } from './utils'
import { Buffer } from 'node:buffer'
import { Readable } from 'node:stream'
import svg2ttf from 'svg2ttf'
import { SVGIcons2SVGFontStream } from 'svgicons2svgfont'
import ttf2woff from 'ttf2woff'
import ttf2woff2 from 'ttf2woff2'
import { DEFAULT_FONT_OPTIONS } from './options'
import { CONTENT_PREFIX, getSvgContext, optimizeSvgString } from './utils'

async function generateSvgFontBuffer(svgMetadata: SVGMetadata[], options: FontOptions) {
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

export async function getFontBuffer(svgMetadata: SVGMetadata[], options: FontOptions) {
  const svgBuffer = await generateSvgFontBuffer(svgMetadata, options)
  const ttfUint8Array = svg2ttf(svgBuffer).buffer
  const ttfBuffer = Buffer.from(ttfUint8Array)

  return {
    ttf: ttfBuffer,
    woff: Buffer.from(ttf2woff(ttfUint8Array)),
    woff2: Buffer.from(ttf2woff2(ttfBuffer)),
  }
}

export function getCssString(svgMetadata: SVGMetadata[], options: FontOptions) {
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

export async function convertFont(svgs: Omit<SVGMetadata, 'code'>[], userOptions: FontOptions = {}) {
  const options = Object.assign({}, DEFAULT_FONT_OPTIONS, userOptions)
  const svgMetadatas = getSvgContext(svgs, options)
  const fontBuffer: FontBuffer = await getFontBuffer(svgMetadatas, options)
  const cssString = getCssString(svgMetadatas, options)
  return {
    fontBuffer,
    cssString,
  }
}
