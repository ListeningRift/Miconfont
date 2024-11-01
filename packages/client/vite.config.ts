import vue from '@vitejs/plugin-vue'
import { presetAttributify, presetUno } from 'unocss'
import Unocss from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [
      vue(),
      Unocss({
        presets: [presetUno(), presetAttributify()],
      }),
    ],
  }
})
