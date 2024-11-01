import { createApp } from 'vue'
import App from './App.vue'

import 'virtual:uno.css'
import './style/index.css'
import './style/reset.css'
import './assets/font/miconfont.css'

export const app = createApp(App)
app.mount('#app')
