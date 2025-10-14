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

// ✅ Restaurar sesión sin bloquear la carga inicial
const auth = useAuthStore(pinia)
auth.restoreSession(import.meta.env.VITE_API_URL || 'https://gameadmin-backend-1.onrender.com')
  .catch(err => console.error('Error restaurando sesión:', err))
  .finally(() => {
    app.mount('#app')
  })
