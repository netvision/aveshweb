import { createApp, markRaw } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import App from './App.vue'
import './style.css'
import axios from 'axios'

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('aveshToken')
  if (token)
    config.headers.Authorization = `Bearer ${token}`
  return config
})

const pinia = createPinia()
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue))
  app.component(key, component)

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requireAuth) {
    if (localStorage.getItem('aveshToken'))
      next()
    else
      next('/login')
  }
  else {
    next()
  }
})
app.use(router)
pinia.use(({ store }) => {
  store.$router = markRaw(router)
})
app.use(pinia)
app.use(ElementPlus)
app.mount('#app')
