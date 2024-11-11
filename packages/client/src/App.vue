<script setup lang="ts">
import type { UnwrapRef } from 'vue'
import type { ComponentOptions, FontOptions } from './utils'
import { Button as AButton, RadioButton as ARadioButton, RadioGroup as ARadioGroup, message } from 'ant-design-vue'
import { useDialog } from 'use-dialog-vue3'
import { onMounted, ref } from 'vue'
import ComponentSettingsDialog from './components/componentSettingsDialog.vue'
import FontSettingsDialog from './components/fontSettingsDialog.vue'

const fontOptions = ref<FontOptions>({
  inputPath: '',
  mode: 'form',
  configPath: '',
  name: 'iconfont',
  iconPrefix: 'icon',
  clearColor: true,
})
const componentOptions = ref<ComponentOptions>({
  inputPath: '',
  mode: 'form',
  configPath: '',
  clearColor: true,
  framework: 'vue3',
  template: '',
})
const outputFormats = ref < 'font' | 'component'>('font')

const iconList = ref<{
  name: string
  content: string
}[]>([])

const { open } = useDialog()

function openSettingsDialog() {
  open(outputFormats.value === 'font' ? FontSettingsDialog : ComponentSettingsDialog, {
    options: outputFormats.value === 'font' ? fontOptions.value : componentOptions.value,
  })
}

async function scan() {
  const options = outputFormats.value === 'font' ? fontOptions.value : componentOptions.value
  if (options.inputPath) {
    const scanOptions = Object.assign({}, options, {
      name: 'iconfont',
      iconPrefix: 'icon',
    })
    const response = await fetch('/scan', {
      method: 'POST',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(scanOptions),
    })
    if (response.ok) {
      const data = (await response.json()) as {
        success: boolean
        iconList: UnwrapRef<typeof iconList>
        css: string
        ttfBase64: string
        woffBase64: string
        woff2Base64: string
      }
      if (data.success) {
        iconList.value = data.iconList
        setFontFace(data.css, data.ttfBase64, data.woffBase64, data.woff2Base64)
        message.success('扫描成功')
      }
      else {
        message.error('扫描失败')
      }
    }
    else {
      message.error('扫描失败')
    }
  }
  else {
    message.error('请选择输入文件')
  }
}

const styleEl = document.createElement('style')
onMounted(() => {
  document.head.appendChild(styleEl)
})

function setFontFace(cssString: string, ttfBase64: string, woffBase64: string, woff2Base64: string) {
  const fontMimeType = 'application/font-'
  let css = cssString.replace(/url\([^)]+\)/g, (match) => {
    if (match.includes('ttf')) {
      return `url(data:${fontMimeType}ttf;charset=utf-8;base64,${ttfBase64})`
    }
    else if (match.includes('woff')) {
      return `url(data:${fontMimeType}woff;charset=utf-8;base64,${woffBase64})`
    }
    else if (match.includes('woff2')) {
      return `url(data:${fontMimeType}woff2;charset=utf-8;base64,${woff2Base64})`
    }
    else {
      return match
    }
  })
  css = css.replace('font-size: 16px;', '')
  if ((styleEl as any).styleSheet) {
    (styleEl as any).styleSheet.cssText = css
  }
  else {
    styleEl.innerHTML = css
  }
}

function copyTextToClipboard(name: string) {
  const text = outputFormats.value === 'font' ? `${fontOptions.value.iconPrefix}-${name}` : `<${name} />`
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      message.success('成功复制到剪贴板')
    }).catch((err) => {
      console.error('Failed to copy text: ', err)
    })
  }
  else {
    console.error('Clipboard API not available')
  }
}

async function exportFile() {
  const response = await fetch(outputFormats.value === 'font' ? '/exportFont' : '/exportComponent', {
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify(outputFormats.value === 'font' ? fontOptions.value : componentOptions.value),
  })
  if (response.ok) {
    const data = await response.blob()
    const url = window.URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || (outputFormats.value === 'font' ? 'iconfont.zip' : 'components.zip')
    a.click()
    window.URL.revokeObjectURL(url)
  }
}
</script>

<template>
  <div h="100%" bg="#f4f8ff">
    <div flex="~ row items-center justify-between" p="x-20px" h="64px" font="size-20px 700" b-b="~ solid 1px #ffffff" shadow="[0_2px_12px_rgba(95,109,131,.12)]">
      <span>Miconfont</span>
    </div>
    <div class="output-formats" p="x-16px t-16px">
      <a-radio-group v-model:value="outputFormats" button-style="solid">
        <a-radio-button value="font" bg="#eaecee" b="none s-none!" b-rd-6px>
          Font Class
        </a-radio-button>
        <a-radio-button value="component" m-l-8px bg="#eaecee" b="none s-none!" b-rd-6px>
          Component
        </a-radio-button>
      </a-radio-group>

      <div float-right>
        <a-button m-r-8px bg="transparent" @click="openSettingsDialog">
          设置
        </a-button>
        <a-button m-r-8px bg="transparent" @click="scan">
          扫描
        </a-button>
        <a-button bg="transparent" @click="exportFile">
          导出
        </a-button>
      </div>
    </div>
    <div p-16px class="icon-list">
      <div v-for="icon in iconList" :key="icon.name" class="icon-item" relative flex="~ col items-center justify-center" p="8px" w="100%" h="140px" b-rd-6px shadow="hover:[0_2px_12px_rgba(95,109,131,.12)]">
        <i :class="`iconfont icon-${icon.name}`" m-b-8px font="size-32px"></i>
        <span class="text-overflow" :title="icon.name" inline-box max-w="100%">{{ icon.name }}</span>
        <div class="icon-item-operation" absolute bottom-8px flex="justify-center items-center" w="100%" hidden>
          <i class="miconfont micon-copy" title="复制" cursor-pointer @click="copyTextToClipboard(icon.name)"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ant-radio-button-wrapper:not(:first-child)::before {
  display: none;
}

.icon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-gap: 16px;
}

.icon-item:hover .icon-item-operation {
  display: flex;
}
</style>
