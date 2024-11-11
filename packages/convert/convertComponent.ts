import type { ComponentOptions } from './options'
import type { SvgComponent, SVGMetadata } from './utils'
import { DEFAULT_COMPONENT_OPTIONS } from './options'
import { defaultGetComponentContent, getSvgContext } from './utils'

function getGetComponentContentFunc(options: ComponentOptions) {
  if (options.getComponentContent)
    return options.getComponentContent
  if (options.template)
    return (name: string, svgString: string) => options.template!.replace(/\$name/g, name).replace(/\$svgString/g, svgString)
  return defaultGetComponentContent[options.framework || 'vue3']
}

export async function convertComponents(svgs: Omit<SVGMetadata, 'code'>[], userOptions: ComponentOptions = {}) {
  const options = Object.assign({}, DEFAULT_COMPONENT_OPTIONS, userOptions)
  const getComponentContent = getGetComponentContentFunc(options)
  const svgMetadatas = getSvgContext(svgs, options)
  return svgMetadatas.map((svgMetadata) => {
    return {
      name: svgMetadata.name,
      componentContent: getComponentContent(svgMetadata.name, svgMetadata.content),
    } as SvgComponent
  })
}
