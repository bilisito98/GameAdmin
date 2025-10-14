<template>
  <div class="app-container">
    <!-- Mostrar carga mientras restaura sesión -->
    <div v-if="auth.loading" class="loading-screen">
      Cargando...
    </div>

    <!-- Login modal si no hay sesión -->
    <LoginModal
        v-else-if="!auth.isAuthenticated"
        @close="onLoginSuccess"
    />

    <!-- App principal solo si hay sesión -->
    <template v-else>
      <Sidebar :isOpen="isSidebarOpen" @toggle="toggleSidebar" />

      <div :class="['main-content', { 'sidebar-open': isSidebarOpen }]">
        <TopBar @toggleSidebar="toggleSidebar" @logout="onLogout" />

        <main class="main-body">
          <router-view />
        </main>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'
import LoginModal from './components/LoginModal.vue'
import { useAuthStore } from './store/authStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const isSidebarOpen = ref(window.innerWidth >= 1024)
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }

onMounted(async () => {
  try {
    const timeout = new Promise(resolve => setTimeout(resolve, 5000)) // 5s máx
    await Promise.race([auth.restoreSession(), timeout])
  } catch (err) {
    console.error('Error restaurando sesión:', err)
  } finally {
    auth.loading = false
    if (auth.isAuthenticated) router.push({ name: 'home' })
  }
})

const onLoginSuccess = () => {
  router.push({ name: 'home' })
}

const onLogout = () => {
  auth.logout()
}
</script>

<style src="./app.css"></style>
