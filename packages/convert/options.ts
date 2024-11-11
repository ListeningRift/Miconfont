import type { SVGIcons2SVGFontStreamOptions } from 'svgicons2svgfont'

export type FontOptions = {
  name?: string
  iconPrefix?: string
  codeStarter?: number
  clearColor?: boolean
  formats?: string[]
} & Partial<Omit<SVGIcons2SVGFontStreamOptions, 'callback' | 'fontName' | 'log'>>

export const DEFAULT_FONT_OPTIONS = {
  name: 'iconfont',
  iconPrefix: 'icon',
  formats: ['woff', 'woff2', 'ttf'],
  clearColor: true,
  codeStarter: 0xE600,
  fontHeight: 1000,
  normalize: true,
}

export interface ComponentOptions {
  clearColor?: boolean
  framework?: 'react' | 'vue3' | 'vue2'
  template?: string
  getComponentContent?: (name: string, svgString: string) => string
}

export const DEFAULT_COMPONENT_OPTIONS: ComponentOptions = {
  clearColor: true,
  framework: 'vue3',
}
