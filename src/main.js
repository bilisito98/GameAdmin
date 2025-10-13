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

// ⚡ Restaurar sesión antes de montar la app
const auth = useAuthStore(pinia)
auth.restoreSession('https://gameadmin-backend-1.onrender.com').finally(() => {
  app.mount('#app')
})
