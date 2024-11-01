# Miconfont

将本地svg图标转换成字体图标的工具（仿iconfont）。

## 功能

- 将本地svg图标转换成字体图标
- 支持自定义字体名称、字体大小、颜色、图标名称前缀等
- 支持自定义配置文件
- 支持直接调用api自定义逻辑
- 支持通过cli调用
- 支持通过本地服务调用
- 完全本地处理，无服务器

## 使用

### cli

```bash
pnpm cli -i "inputPath" -o "outputPath" -n "fontName" -c "configFilePath"
```

### local service

```bash
pnpm server
```

### Options

```ts
import type { SVGIcons2SVGFontStreamOptions } from 'svgicons2svgfont'

type Options = {
  name?: string
  iconPrefix?: string
  codeStarter?: number
  clearColor?: boolean
  formats?: string[]
} & Partial<Omit<SVGIcons2SVGFontStreamOptions, 'callback' | 'fontName' | 'log'>>
```

#### 默认配置

```ts
const DEFAULT_OPTIONS = {
  name: 'iconfont',
  iconPrefix: 'icon',
  formats: ['woff', 'woff2', 'ttf'],
  clearColor: true,
  codeStarter: 0xE600,
  fontHeight: 1000,
  normalize: true,
}
```
