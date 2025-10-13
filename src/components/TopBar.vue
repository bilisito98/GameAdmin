<template>
  <header class="topbar">
    <div class="topbar-left">
      <button class="menu-btn" @click="$emit('toggleSidebar')" aria-label="Abrir menú">☰</button>
      <h1 class="topbar-title">Panel de Control</h1>
    </div>

    <div class="topbar-actions">
      <!-- Notificaciones -->
      <div class="notifications">
        <button class="notif-btn" @click="toggleNotifications" aria-label="Notificaciones">
          <svg xmlns="http://www.w3.org/2000/svg" class="notif-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M15 17h5l-1.405-1.405C18.21 15.21 18 14.702 18 14V11a6.002 6.002 0
                     00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3c0
                     .702-.21 1.21-.595 1.595L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span v-if="notifications > 0" class="notif-badge">{{ notifications }}</span>
        </button>

        <div v-if="showNotifications" class="notif-dropdown">
          <h3 class="notif-title">Notificaciones</h3>
          <ul>
            <li v-for="(n, idx) in notificationList" :key="idx" class="notif-item">{{ n }}</li>
          </ul>
        </div>
      </div>

      <!-- Avatar / Usuario -->
      <div class="user-menu">
        <button class="user-btn" @click="toggleMenu">
          <img :src="avatarSrc" alt="Avatar" class="user-avatar" />
          <span class="user-name">{{ userName }}</span>
        </button>

        <div v-if="showMenu" class="user-dropdown">
          <ul>
            <li v-if="auth.isAuthenticated">
              <span v-if="auth.isAdmin">(Admin)</span>
              <span v-else-if="auth.isUser">(Usuario)</span>
              <a href="#" @click.prevent="logout">Cerrar sesión</a>
            </li>
            <li v-else>
              <a href="#" @click.prevent="openLoginModal">Iniciar sesión</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Login Modal -->
    <LoginModal v-if="showLoginModal" @close="showLoginModal = false" />
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'
import LoginModal from './LoginModal.vue'

const auth = useAuthStore()

const notifications = ref(2)
const notificationList = ref(['Nuevo cliente registrado', 'Licencia próxima a vencer'])

const showNotifications = ref(false)
const showMenu = ref(false)
const showLoginModal = ref(false)

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showMenu.value = false
}
const toggleMenu = () => {
  showMenu.value = !showMenu.value
  showNotifications.value = false
}

const userName = computed(() => auth.user?.fullName || 'Invitado')
const avatarSrc = computed(() => auth.user?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png')

const logout = () => {
  auth.logout()
  showMenu.value = false
}

const openLoginModal = () => {
  showLoginModal.value = true
}

// Restaurar sesión al cargar la página
onMounted(() => {
  auth.restoreSession()
})
</script>

<style src="../assets/Topbar.css"></style>
