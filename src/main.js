// src/main.js (ejemplo)
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './assets/index.css'
import { useAuthStore } from './store/authStore'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Restaurar sesión y luego montar (usa la restoreSession sin parámetros)
const auth = useAuthStore(pinia)
auth.restoreSession().finally(() => {
  app.mount('#app')
})
