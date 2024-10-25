import type { SVGIcons2SVGFontStreamOptions } from 'svgicons2svgfont'

export type Options = {
  name?: string
  iconPrefix?: string
  codeStarter?: number
  clearColor?: boolean
  formats?: string[]
} & Partial<Omit<SVGIcons2SVGFontStreamOptions, 'callback' | 'fontName' | 'log'>>

export const DEFAULT_OPTIONS = {
  name: 'iconfont',
  iconPrefix: 'icon',
  formats: ['woff', 'woff2', 'ttf'],
  clearColor: true,
  codeStarter: 0xE600,
  fontHeight: 1000,
  normalize: true,
}
