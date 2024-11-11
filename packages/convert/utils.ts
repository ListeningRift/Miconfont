import type { Buffer } from 'node:buffer'
import type { FontOptions } from './options'
import { optimize } from 'svgo'

export const CONTENT_PREFIX = '\\'

export interface Metadata {
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

export function getSvgContext(svgs: Omit<SVGMetadata, 'code'>[], options: FontOptions) {
  const svgMetadata: SVGMetadata[] = []
  svgs.forEach((item, index) => {
    const code = options.codeStarter! + index
    svgMetadata.push({
      code,
      name: item.name,
      content: item.content,
    })
  })
  return svgMetadata
}

export function optimizeSvgString(svg: string, clearColor: boolean) {
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

export interface SvgComponent {
  name: string
  componentContent: string
}

function defaultGetVue3ComponentContent(name: string, svgString: string) {
  return `<template>
  ${svgString.replace(/<svg.+?>/g, item => `${item.slice(0, item.length - 1)} v-bind="$attrs">`)}
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: '${name}',
  inheritAttrs: false
});
</script>
`
}

function defaultGetVue2ComponentContent(name: string, svgString: string) {
  return `<template>
  ${svgString.replace(/<svg.+?>/g, item => `${item.slice(0, item.length - 1)} v-bind="$attrs">`)}
</template>

<script>
export default {
  name: '${name}',
  inheritAttrs: false
};
</script>
`
}

function defaultGetReactComponentContent(name: string, svgString: string) {
  return `export interface ${name}Props extends React.SVGAttributes<SVGSVGElement> {}

const ${name} = (props: ${name}Props) => {
  return (
    ${svgString.replace(/<svg.+?>/g, item => `${item.slice(0, item.length - 1)} {...props}>`)}
  );
};

export default ${name};
`
}

export const defaultGetComponentContent = {
  vue3: defaultGetVue3ComponentContent,
  vue2: defaultGetVue2ComponentContent,
  react: defaultGetReactComponentContent,
}
