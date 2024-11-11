import type { ComponentOptions as ConvertComponentOptions, FontOptions as ConvertFontOptions } from '@miconfont/convert'

export type FontOptions = ConvertFontOptions & { inputPath: string, configPath: string, mode: 'form' | 'file' }

export type ComponentOptions = ConvertComponentOptions & { extname?: string, inputPath: string, configPath: string, mode: 'form' | 'file' }
