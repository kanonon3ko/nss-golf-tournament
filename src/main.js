import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useDarkModeStore } from '@/stores/darkMode'
import { siteName } from '@/config'

import './css/main.css'

// Init Pinia
const pinia = createPinia()

// Create Vue app
createApp(App).use(router).use(pinia).mount('#app')

// Dark mode
const darkModeStore = useDarkModeStore(pinia)
darkModeStore.init()

const defaultDocumentTitle = siteName

// Set document title from route meta
router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} — ${defaultDocumentTitle}`
    : defaultDocumentTitle
})
