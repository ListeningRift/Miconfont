<script setup lang="ts">
import type { Options } from '@miconfont/convert'
import type { UnwrapRef } from 'vue'
import { Button as AButton, message } from 'ant-design-vue'
import { useDialog } from 'use-dialog-vue3'
import { onMounted, ref } from 'vue'
import SettingsDialog from './components/settingsDialog.vue'

const options = ref<Options & { inputPath: string, configPath: string, mode: 'form' | 'file' }>({
  inputPath: '',
  mode: 'form',
  configPath: '',
  name: 'iconfont',
  iconPrefix: 'icon',
  clearColor: true,
})

const iconList = ref<{
  name: string
  content: string
}[]>([])

const { open } = useDialog()

function openSettingsDialog() {
  open(SettingsDialog, {
    options: options.value,
  })
}

async function scan() {
  if (options.value.inputPath) {
    const response = await fetch('/scan', {
      method: 'POST',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(options.value),
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

function copyTextToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      message.success('复制成功')
    }).catch((err) => {
      console.error('Failed to copy text: ', err)
    })
  }
  else {
    console.error('Clipboard API not available')
  }
}

async function exportFile() {
  const response = await fetch('/exportFile', {
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify(options.value),
  })
  if (response.ok) {
    const data = await response.blob()
    const url = window.URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'iconfont.zip'
    a.click()
    window.URL.revokeObjectURL(url)
  }
}
</script>

<template>
  <div h="100%" bg="#f4f8ff">
    <div flex="~ row items-center justify-between" p="x-20px" h="64px" font="size-20px 700" b-b="~ solid 1px #ffffff" shadow="[0_2px_12px_rgba(95,109,131,.12)]">
      <span>Miconfont</span>
      <div items-end>
        <a-button m-r-8px bg="#f4f8ff" @click="scan">
          扫描
        </a-button>
        <a-button m-r-8px bg="#f4f8ff" @click="openSettingsDialog">
          设置
        </a-button>
        <a-button bg="#f4f8ff" @click="exportFile">
          导出
        </a-button>
      </div>
    </div>
    <div p-16px class="icon-list">
      <div v-for="icon in iconList" :key="icon.name" class="icon-item" relative flex="~ col items-center justify-center" p="8px" w="100%" h="140px" shadow="hover:[0_2px_12px_rgba(95,109,131,.12)]">
        <i :class="`${options.name} ${options.iconPrefix}-${icon.name}`" m-b-8px font="size-32px"></i>
        <span class="text-overflow" :title="icon.name" inline-box max-w="100%">{{ icon.name }}</span>
        <div class="icon-item-operation" absolute bottom-8px flex="justify-center items-center" w="100%" hidden>
          <i class="miconfont icon-copy" title="复制" cursor-pointer @click="copyTextToClipboard(`${options.iconPrefix}-${icon.name}`)"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-gap: 16px;
}

.icon-item:hover .icon-item-operation {
  display: flex;
}
</style>
