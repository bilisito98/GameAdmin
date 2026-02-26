<template>
  <div class="app-container">
    <!-- Pantalla de carga -->
    <div v-if="auth.loading" class="loading-screen">
      Cargando...
    </div>

    <!-- Modal de login -->
    <LoginModal v-else-if="!auth.isAuthenticated" @close="onLoginSuccess" />

    <!-- Aplicación principal -->
    <template v-else>
      <Sidebar :isOpen="isSidebarOpen" @toggle="toggleSidebar" />
      <div :class="['main-content', { 'sidebar-open': isSidebarOpen }]">
        <TopBar @toggleSidebar="toggleSidebar" @logout="onLogout" />
        <main class="main-body">
          <router-view />
        </main>
      </div>
    </template>

    <!-- Modal de expiración -->
    <transition name="fade">
      <div
        v-if="showSessionModal"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <div
          class="bg-white rounded-2xl shadow-lg w-80 p-6 text-center space-y-4 animate-fade-in"
        >
          <h2 class="text-lg font-semibold text-gray-800">Sesión expirada</h2>
          <p class="text-sm text-gray-600">
            Tu sesión ha expirado por inactividad. Por favor, vuelve a iniciar sesión.
          </p>
          <button
            @click="handleSessionExpired"
            class="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'
import LoginModal from './components/LoginModal.vue'
import { useAuthStore } from './store/authStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const isSidebarOpen = ref(window.innerWidth >= 1024)
const showSessionModal = ref(false)
const toggleSidebar = () => (isSidebarOpen.value = !isSidebarOpen.value)

let inactivityTimer = null

// 🔹 Reinicia el temporizador de inactividad
const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => {
    showSessionModal.value = true
  }, 5 * 60 * 1000) // 5 minutos
}

// 🔹 Cierra sesión y limpia todo
const handleSessionExpired = () => {
  showSessionModal.value = false
  auth.logout()
  router.push({ name: 'login' })
}

// 🔹 Detectar actividad del usuario
const addActivityListeners = () => {
  const events = ['mousemove', 'keydown', 'click', 'scroll']
  events.forEach((e) => window.addEventListener(e, resetInactivityTimer))
}

// 🔹 Eliminar listeners
const removeActivityListeners = () => {
  const events = ['mousemove', 'keydown', 'click', 'scroll']
  events.forEach((e) => window.removeEventListener(e, resetInactivityTimer))
}

// 🔹 Restaurar sesión
onMounted(async () => {
  try {
    const timeout = new Promise((resolve) => setTimeout(resolve, 5000))
    await Promise.race([auth.restoreSession(), timeout])
  } catch (err) {
    console.error('Error restaurando sesión:', err)
  } finally {
    auth.loading = false
    if (auth.isAuthenticated) {
      router.push({ name: 'home' })
      addActivityListeners()
      resetInactivityTimer()
    }
  }

  // Cierra sesión si se cierra la pestaña
  window.addEventListener('beforeunload', () => {
    auth.logout()
  })
})

onUnmounted(() => {
  clearTimeout(inactivityTimer)
  removeActivityListeners()
})
const onLoginSuccess = () => {
  router.push({ name: 'home' })
  addActivityListeners()
  resetInactivityTimer()
}
const onLogout = () => {
  auth.logout()
  clearTimeout(inactivityTimer)
  removeActivityListeners()
}
</script>

<style src="./app.css"></style>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loading-screen {
  @apply flex items-center justify-center h-screen text-white text-lg bg-gray-900;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

